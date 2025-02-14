import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards, Request } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GoogleAuthGuard } from 'src/auth/guards/google/google-auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('webhook')
export class GmailController {
  private readonly logger = new Logger(GmailController.name);

  constructor(private readonly gmailService: GmailService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  //@UseGuards(GoogleAuthGuard)
  @Post('gmail')
  @ApiOperation({ summary: 'Creation of gmail webhook'})
  async handleWebhook(@Body() body: any) {
    console.log("MAILED RECEIVED\n\n");
    this.logger.log('Received webhook payload: ' + JSON.stringify(body));

    const message = body.message;
    if (!message || !message.data) {
      this.logger.warn('Missing message or data in payload.');
      return;
    }

    const decodedData = Buffer.from(message.data, 'base64').toString('utf8');
    let notification;
    try {
      notification = JSON.parse(decodedData);
    } catch (error) {
      this.logger.error('Failed to parse notification data: ' + error.message);
      return;
    }

    this.logger.log('Parsed notification: ' + JSON.stringify(notification));

    const historyId = notification.historyId;
    console.log(historyId);
    const emailAddress = notification.emailAddress;

    if (!historyId) {
      this.logger.warn('No historyId found in notification.');
      return;
    }
    await this.gmailService.processHistoryUpdate(emailAddress, historyId);
  }
}
