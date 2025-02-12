import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards, Request } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GoogleAuthGuard } from 'src/auth/guards/google/google-auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('webhook')
export class GmailController {
  private readonly logger = new Logger(GmailController.name);

  constructor(private readonly gmailService: GmailService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Creation of gmail webhook'})
  async handleWebhook(@Request() req, @Body() body: any) {
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
    const emailAddress = notification.emailAddress; // Optional

    if (!historyId) {
      this.logger.warn('No historyId found in notification.');
      return;
    }
    await this.gmailService.processHistoryUpdate(req.user.id, emailAddress, historyId);
  }
}
