import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { use } from 'passport';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GmailService {
  private logger = new Logger(GmailService.name);
  constructor(
    private readonly authService: AuthService
  ) {}

  async getOAuth2Client(emailAddress: string): Promise<OAuth2Client> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    // ici mettre access token const accessToken =
    // ici mettre access token oauth2Client.setCredentials({access_token: accessToken});

    return oauth2Client;
  }

  async processHistoryUpdate(emailAddress: string, historyId: string): Promise<void> {
    const auth = await this.getOAuth2Client(emailAddress);
    const gmail = google.gmail({ version: 'v1', auth });

    try {
      const res = await gmail.users.history.list({
        userId: 'me',
        startHistoryId: historyId,
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

            if (this.isJobApplication(message)) {
              const jobDescription = this.extractJobDescription(message);
              await this.saveJobApplication(emailAddress, message, jobDescription);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing history update: ' + error.message);
    }
  }

  isJobApplication(message: any): boolean {
    const headers = message.payload.headers;
    const subjectHeader = headers.find((h) => h.name.toLowerCase() === 'subject');
    if (subjectHeader) {
      const subject = subjectHeader.value.toLowerCase();
      const keywords = ['job application', 'career opportunity', 'position', 'job offer'];
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
      jobDescription = Buffer.from(payload.body.data, 'base64').toString('utf8');
    }
    return jobDescription;
  }

  async saveJobApplication(emailAddress: string, message: any, jobDescription: string): Promise<void> {
    const headers = message.payload.headers;
    const subjectHeader = headers.find((h) => h.name.toLowerCase() === 'subject');
    const subject = subjectHeader ? subjectHeader.value : 'No Subject';

    this.logger.log(`Saving job application for ${emailAddress} - Subject: ${subject}`);
    this.logger.log(`Job Description Extracted: ${jobDescription}`);
  }
}
