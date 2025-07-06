import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailFilterService } from 'src/services/mailFilter/mailFilter.service';
import { GmailMessage } from '../mail/gmail.types';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GmailService {
  private logger = new Logger(GmailService.name);
  private processedMessages = new Set<string>();
  private readonly MESSAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailFilter: MailFilterService,
    private readonly authService: AuthService,
  ) {
    setInterval(
      () => {
        this.processedMessages.clear();
        this.logger.log('Cleared Gmail processed messages cache');
      },
      6 * 60 * 60 * 1000, // 6 hours
    );
  }

  async processHistoryUpdate(
    emailAddress: string,
    historyId: string,
  ): Promise<void> {
    this.logger.log(
      `Processing history update for ${emailAddress} with historyId: ${historyId}`,
    );

    const normalizedEmail = emailAddress.toLowerCase();
    const tokenRecord = await this.prisma.token.findFirst({
      where: {
        userEmail: normalizedEmail,
        name: 'Google_oauth2',
      },
    });

    if (!tokenRecord) {
      this.logger.warn(
        `Webhook received for ${normalizedEmail}, but no corresponding Google token was found.`,
      );
      return;
    }

    const validAccessToken = await this.authService.getValidToken(
      tokenRecord.userId,
      'Google_oauth2',
    );

    if (!validAccessToken) {
      this.logger.error(
        `Could not get a valid access token for user ${tokenRecord.userId} (${normalizedEmail}).`,
      );
      return;
    }

    await this.authService.checkAndRenewWebhook(tokenRecord, validAccessToken);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: validAccessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
      // Get the last known historyId from database (stored in externalId)
      const lastKnownHistoryId = tokenRecord.externalId;
      this.logger.log(
        `Retrieving history from ${lastKnownHistoryId || 'beginning'} to ${historyId}`,
      );

      const history = await gmail.users.history.list({
        userId: 'me',
        startHistoryId: lastKnownHistoryId || historyId, // Use last known or fallback to current
      });

      // Update the stored historyId with the new one
      await this.authService.updateGoogleTokenWithHistoryId(
        tokenRecord.userId,
        historyId.toString(), // Convert to string for database storage
      );

      if (!history.data.history) {
        this.logger.log(
          `No history data found between ${lastKnownHistoryId} and ${historyId}`,
        );
        return;
      }

      this.logger.log(
        `Processing ${history.data.history.length} history records between ${lastKnownHistoryId} and ${historyId}`,
      );

      const messageIds = new Set<string>();
      for (const historyRecord of history.data.history) {
        // Log all available events for debugging
        this.logger.log(
          `History record contains: ${JSON.stringify({
            messagesAdded: !!historyRecord.messagesAdded,
            messagesDeleted: !!historyRecord.messagesDeleted,
            labelsAdded: !!historyRecord.labelsAdded,
            labelsRemoved: !!historyRecord.labelsRemoved,
            messagesAddedCount: historyRecord.messagesAdded?.length || 0,
            messagesDeletedCount: historyRecord.messagesDeleted?.length || 0,
            labelsAddedCount: historyRecord.labelsAdded?.length || 0,
            labelsRemovedCount: historyRecord.labelsRemoved?.length || 0,
          })}`,
        );

        // ONLY process newly added messages - ignore read/delete/label events
        if (historyRecord.messagesAdded) {
          for (const messageAdded of historyRecord.messagesAdded) {
            if (messageAdded.message?.id) {
              messageIds.add(messageAdded.message.id);
              this.logger.log(`New message added: ${messageAdded.message.id}`);
            }
          }
        }

        // Optional: Log other events but don't process them
        if (historyRecord.messagesDeleted) {
          this.logger.log(
            `Messages deleted (ignored): ${historyRecord.messagesDeleted.length}`,
          );
        }
        if (historyRecord.labelsAdded) {
          this.logger.log(
            `Labels added (ignored): ${historyRecord.labelsAdded.length}`,
          );
        }
        if (historyRecord.labelsRemoved) {
          this.logger.log(
            `Labels removed (ignored): ${historyRecord.labelsRemoved.length}`,
          );
        }
      }

      if (messageIds.size === 0) {
        this.logger.warn(
          `No new messages found to process in history update for ${emailAddress}`,
        );
        return;
      }

      this.logger.log(
        `Found ${messageIds.size} new messages to process: ${Array.from(messageIds).join(', ')}`,
      );

      const uniqueMessageIds = Array.from(messageIds);
      const messageProcessingPromises = uniqueMessageIds.map((messageId) =>
        this.processMessage(gmail, messageId, tokenRecord.userId),
      );

      const CONCURRENT_LIMIT = await this.mailFilter.getConcurrentEmailLimit();
      for (
        let i = 0;
        i < messageProcessingPromises.length;
        i += CONCURRENT_LIMIT
      ) {
        const batch = messageProcessingPromises.slice(i, i + CONCURRENT_LIMIT);
        await Promise.all(batch);
      }
    } catch (error) {
      this.logger.error(
        'Error processing history update: ' + error.message,
        error.stack,
      );
    }
  }

  private async processMessage(
    gmail: any,
    messageId: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(`Processing message ${messageId} for user ${userId}`);

    // Check if this message was already processed
    const cacheKey = `${userId}-${messageId}`;
    if (this.processedMessages.has(cacheKey)) {
      this.logger.log(
        `Skipping already processed Gmail message: ${messageId} for user ${userId}`,
      );
      return;
    }

    // Mark as being processed to prevent race conditions
    this.processedMessages.add(cacheKey);

    try {
      const messageRes = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      this.logger.log(`Retrieved message ${messageId} from Gmail API`);

      const message = messageRes.data;
      const gmailMessage: GmailMessage = this.mapToGmailMessage(message);

      if (await this.isUserSentEmail(gmailMessage, userId)) {
        this.logger.log(
          `Skipping email ${messageId} - sent by user to themselves`,
        );
        return;
      }

      this.logger.log(`Mapped message ${messageId} to GmailMessage format`);

      const result =
        await this.mailFilter.processEmailAndCreateJobApplyFromGmail(
          gmailMessage,
          userId,
        );

      this.logger.log(
        `MailFilter processing result for message ${messageId}: ${result}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing message ${messageId}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async isUserSentEmail(
    gmailMessage: GmailMessage,
    userId: string,
  ): Promise<boolean> {
    try {
      // Get user's email address
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user?.email) {
        this.logger.warn(`User ${userId} not found or has no email`);
        return false;
      }

      const userEmail = user.email.toLowerCase();

      // Get sender from email headers
      const fromHeader = gmailMessage.payload.headers.find(
        (header) => header.name.toLowerCase() === 'from',
      );

      if (!fromHeader) {
        return false;
      }

      const fromEmail = this.extractEmailFromHeader(fromHeader.value);

      // Check if sender is the user themselves
      const isSelfSent = fromEmail.toLowerCase() === userEmail;

      if (isSelfSent) {
        this.logger.log(
          `Email detected as self-sent: ${fromEmail} = ${userEmail}`,
        );
      }

      return isSelfSent;
    } catch (error) {
      this.logger.error(
        `Error checking if email is self-sent: ${error.message}`,
      );
      return false;
    }
  }

  private extractEmailFromHeader(headerValue: string): string {
    const emailMatch = headerValue.match(/<([^>]+)>/);
    return emailMatch ? emailMatch[1] : headerValue.trim();
  }

  mapToGmailMessage(sourceData: any): GmailMessage {
    if (!sourceData?.id || !sourceData?.payload) {
      throw new Error('Invalid message structure received from API.');
    }
    const sourcePayload = sourceData.payload;
    return {
      id: sourceData.id,
      threadId: sourceData.threadId ?? '',
      snippet: sourceData.snippet ?? '',
      payload: {
        partId: sourcePayload.partId ?? '',
        mimeType: sourcePayload.mimeType ?? 'application/octet-stream',
        filename: sourcePayload.filename ?? '',
        headers: (sourcePayload.headers ?? []).map((header: any) => ({
          name: header.name ?? 'Unknown-Header',
          value: header.value ?? '',
        })),
        body: {
          size: sourcePayload.body?.size ?? 0,
          data: sourcePayload.body?.data,
          attachmentId: sourcePayload.body?.attachmentId,
        },
        parts: sourcePayload.parts ? sourcePayload.parts : undefined,
      },
    };
  }
}
