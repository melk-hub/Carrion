import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailFilterService } from 'src/services/mailFilter/mailFilter.service';
import { GmailMessage } from '../mail/gmail.types';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GmailService {
  private logger = new Logger(GmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailFilter: MailFilterService,
    private readonly authService: AuthService,
  ) {}

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
      const history = await gmail.users.history.list({
        userId: 'me',
        startHistoryId: historyId,
      });

      await this.authService.updateGoogleTokenWithHistoryId(
        tokenRecord.userId,
        history.data.historyId,
      );

      if (!history.data.history) return;

      const messageIds = new Set<string>();
      for (const historyRecord of history.data.history) {
        if (historyRecord.messages) {
          for (const message of historyRecord.messages) {
            messageIds.add(message.id);
          }
        }
      }

      if (messageIds.size === 0) return;

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
    try {
      const messageRes = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });
      const message = messageRes.data;
      const gmailMessage: GmailMessage = this.mapToGmailMessage(message);
      await this.mailFilter.processEmailAndCreateJobApplyFromGmail(
        gmailMessage,
        userId,
      );
    } catch (error) {
      this.logger.error(
        `Error processing message ${messageId}: ${error.message}`,
      );
    }
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
