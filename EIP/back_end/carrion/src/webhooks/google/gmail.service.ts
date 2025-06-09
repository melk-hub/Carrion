import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
// import { use } from 'passport';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Token } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { MailFilterService } from 'src/services/mailFilter/mailFilter.service';
import { GmailMessage } from '../mail/gmail.types';

@Injectable()
export class GmailService {
  private logger = new Logger(GmailService.name);
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailFilter: MailFilterService,
  ) {}

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    // Rafraîchir l'access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token;
  }

  async getOAuth2Client(accessToken: string): Promise<OAuth2Client> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    return oauth2Client;
  }

  async isAccessTokenValid(accessToken: string): Promise<boolean> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' +
        accessToken,
    );
    const data = await response.json();
    if (data.error) return false;
    return data.expires_in > 0;
  }

  async getTokenForUser(emailAddress: string): Promise<Token> {
    return await this.prisma.token.findFirst({
      where: { user: { email: emailAddress }, name: 'Google_oauth2' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAccessToken(
    emailAddress: string,
    newAccessToken: string,
  ): Promise<void> {
    await this.prisma.token.updateMany({
      where: { user: { email: emailAddress } },
      data: { accessToken: newAccessToken },
    });
  }

  mapToGmailMessage(sourceData: any): GmailMessage {
    if (!sourceData?.id || !sourceData?.payload) {
      // console.error(
      //   "Source message data is missing essential 'id' or 'payload'.",
      //   sourceData,
      // );
      this.logger.error(
        'Source message data is missing essential "id" or "payload"',
        JSON.stringify(sourceData),
      );
      throw new Error('Invalid message structure received from API.');
    }

    const sourcePayload = sourceData.payload;

    const gmailMessage: GmailMessage = {
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

    return gmailMessage;
  }

  async processHistoryUpdate(
    emailAddress: string,
    historyId: string,
  ): Promise<void> {
    const token = await this.getTokenForUser(emailAddress);
    const user = await this.userService.findByIdentifier(emailAddress, true);
    if (token == null) {
      this.logger.error(`No access token found for ${emailAddress}`);
      return;
    }
    let accessToken = token.accessToken;
    if (token.refreshToken != null && token.refreshToken != '') {
      const isAccessTokenValid = await this.isAccessTokenValid(accessToken);

      if (!isAccessTokenValid) {
        accessToken = await this.refreshAccessToken(token.refreshToken);
        await this.updateAccessToken(emailAddress, accessToken);
      }
    }

    const auth = await this.getOAuth2Client(accessToken);
    const gmail = google.gmail({ version: 'v1', auth });
    try {
      const res = await gmail.users.history.list({
        userId: 'me',
        startHistoryId: token.externalId,
      });
      const history = res.data.history;
      if (!history) {
        this.logger.log(`No new history records since ${historyId}.`);
        return;
      }
      for (const record of history) {
        if (record.messagesAdded) {
          for (const messageRecord of record.messagesAdded) {
            const messageId = messageRecord.message.id;

            const messageRes = await gmail.users.messages.get({
              userId: 'me',
              id: messageId,
              format: 'full',
            });
            const message = messageRes.data;
            const gmailMessage: GmailMessage = this.mapToGmailMessage(message);
            this.mailFilter.processEmailAndCreateJobApplyFromGmail(
              gmailMessage,
              user.id,
            );

            if (this.isJobApplication(message)) {
              const jobDescription = this.extractJobDescription(message);
              await this.saveJobApplication(
                emailAddress,
                message,
                jobDescription,
              );
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing history update: ' + error.message);
    }
    await this.updateGoogleTokenWithHistoryId(user.id, historyId);
  }

  async updateGoogleTokenWithHistoryId(
    userId: string,
    historyId: string,
  ): Promise<void> {
    try {
      // Find the Google token for this user
      const existingToken = await this.prisma.token.findFirst({
        where: {
          userId,
          name: 'Google_oauth2',
        },
      });

      if (existingToken) {
        // Update the token with the new historyId
        await this.prisma.token.update({
          where: { id: existingToken.id },
          data: {
            externalId: historyId.toString(),
          },
        });
        this.logger.log(`Updated Google token historyId for user ${userId}`);
      } else {
        this.logger.warn(`No Google token found for user ${userId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update Google token with history ID: ${error.message}`,
      );
    }
  }

  isJobApplication(message: any): boolean {
    const headers = message.payload.headers;
    const subjectHeader = headers.find(
      (h) => h.name.toLowerCase() === 'subject',
    );
    if (subjectHeader) {
      const subject = subjectHeader.value.toLowerCase();
      const keywords = [
        'job application',
        'career opportunity',
        'position',
        'job offer',
      ];
      return keywords.some((keyword) => subject.includes(keyword));
    }
    return false;
  }

  extractJobDescription(message: any): string {
    let jobDescription = '';
    const { payload } = message;

    if (payload.parts && payload.parts.length > 0) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          const text = Buffer.from(part.body.data, 'base64').toString('utf8');
          jobDescription += text;
        }
      }
    } else if (payload.body && payload.body.data) {
      jobDescription = Buffer.from(payload.body.data, 'base64').toString(
        'utf8',
      );
    }
    return jobDescription;
  }

  async saveJobApplication(
    emailAddress: string,
    message: any,
    jobDescription: string,
  ): Promise<void> {
    const headers = message.payload.headers;
    const subjectHeader = headers.find(
      (h) => h.name.toLowerCase() === 'subject',
    );
    const subject = subjectHeader ? subjectHeader.value : 'No Subject';

    this.logger.log(
      `Saving job application for ${emailAddress} - Subject: ${subject}`,
    );
    this.logger.log(`Job Description Extracted: ${jobDescription}`);
  }
}
