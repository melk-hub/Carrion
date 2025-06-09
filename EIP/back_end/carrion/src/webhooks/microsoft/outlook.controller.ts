import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { OutlookService } from './outlook.service';
import {
  CustomLoggingService,
  LogCategory,
} from 'src/common/services/logging.service';
import { MailFilterService } from 'src/services/mailFilter/mailFilter.service';
import { OutlookMessage } from 'src/webhooks/mail/outlook.types';
import { UserService } from 'src/user/user.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('webhook/outlook')
export class OutlookController {
  private processedMessages = new Set<string>();
  private readonly MESSAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly outlookService: OutlookService,
    private readonly logger: CustomLoggingService,
    private readonly mailFilterService: MailFilterService,
    private readonly userService: UserService,
  ) {
    // Clean up processed messages cache every 10 minutes
    setInterval(() => {
      this.processedMessages.clear();
    }, 10 * 60 * 1000);
  }

  /**
   * Test endpoint to verify webhook accessibility
   */
  @Public()
  @Get('test')
  async testWebhook() {
    const response = {
      message: 'Outlook webhook is accessible',
      timestamp: new Date().toISOString(),
      url: 'GET /webhook/outlook/test',
    };

    this.logger.logWebhookEvent('Test endpoint accessed', response);
    return response;
  }

  /**
   * Handle validation requests that come as GET
   */
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async handleValidation(@Query('validationToken') validationToken?: string) {
    this.logger.logWebhookEvent('GET validation request received', {
      validationToken: validationToken || 'none',
    });

    if (validationToken) {
      this.logger.logWebhookEvent('Returning validation token from GET', {
        validationToken,
      });
      return validationToken;
    }

    return { status: 'no_validation_token' };
  }

  /**
   * Handle incoming Outlook webhook notifications
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleNotification(
    @Body() notification: any,
    @Headers() headers: any,
    @Req() req: any,
  ) {
    const startTime = Date.now();
    
    // Check for validation token in different possible headers
    const validationToken =
      headers['validation-token'] ||
      headers['validationtoken'] ||
      headers['x-validation-token'] ||
      notification?.validationToken ||
      req.query.validationToken;

    const requestContext = {
      notification: JSON.stringify(notification),
      validationToken: validationToken || 'none',
      headers: JSON.stringify(headers),
      timestamp: new Date().toISOString(),
    };

    // Log incoming notification for debugging
    this.logger.logWebhookEvent('Outlook notification received', notification, {
      validationToken: validationToken || 'none',
      allHeaders: headers,
    });

    try {
      // Handle subscription validation
      if (validationToken) {
        this.logger.logWebhookEvent('Subscription validation requested', {
          validationToken,
          willReturn: validationToken,
        });
        
        // Microsoft expects just the validation token as plain text response
        return validationToken;
      }

      // Check if this is a validation request with no explicit token
      if (Object.keys(notification).length === 0 || !notification.value) {
        this.logger.logWebhookEvent(
          'Empty notification received - might be validation',
          {
            notification,
            headers,
            queryParams: req.query,
          },
        );
        
        // If we have any validation-related header or query param, return it
        const possibleValidationToken = 
          headers['validation-token'] || 
          headers['validationtoken'] ||
          headers['x-validation-token'] ||
          req.query.validationToken ||
          req.query.ValidationToken;
          
        if (possibleValidationToken) {
          this.logger.logWebhookEvent(
            'Found validation token in empty request',
            {
              validationToken: possibleValidationToken,
              source: 'headers_or_query',
            },
          );
          return possibleValidationToken;
        }
        
        // For completely empty requests, Microsoft might expect a 200 with specific response
        this.logger.logWebhookEvent(
          'No validation token found - returning plain OK',
          {
            contentType: headers['content-type'],
            acceptHeader: headers['accept'],
          },
        );
        
        // Return plain text response since Microsoft expects text/plain
        return 'OK';
      }

      // Process actual notifications
      if (notification?.value && Array.isArray(notification.value)) {
        const processingPromises = notification.value.map(async (item: any) => {
          return this.processNotificationItem(item, requestContext);
        });

        // Process notifications in batches to prevent server overload
        const CONCURRENT_LIMIT = await this.mailFilterService.getConcurrentEmailLimit();
        
        for (let i = 0; i < processingPromises.length; i += CONCURRENT_LIMIT) {
          const batch = processingPromises.slice(i, i + CONCURRENT_LIMIT);
          await Promise.all(batch);
          
          this.logger.logPerformance(
            'Outlook batch processing completed',
            Date.now() - startTime,
            {
              processed: batch.length,
              batchNumber: Math.floor(i / CONCURRENT_LIMIT) + 1,
              totalNotifications: notification.value.length,
            },
          );
        }

        // Log performance metrics
        this.logger.logPerformance(
          'Outlook notification processing completed',
          Date.now() - startTime,
          {
            totalNotifications: notification.value.length,
            batches: Math.ceil(processingPromises.length / CONCURRENT_LIMIT),
          },
        );
      }

      return { status: 'success', processed: notification?.value?.length || 0 };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'Outlook webhook processing failed',
        undefined,
        LogCategory.WEBHOOK,
        {
          error: error.message,
          duration,
          requestContext,
        },
      );

      // Return success to prevent Microsoft from retrying
      return { status: 'error_handled', message: error.message };
    }
  }

  /**
   * Process individual notification item
   */
  private async processNotificationItem(item: any, requestContext: any) {
    try {
      const resourceData = item.resourceData;
      if (!resourceData) {
        this.logger.warn(
          'Notification item missing resourceData',
          LogCategory.WEBHOOK,
          { item },
        );
        return;
      }

      // Check for duplicate processing with improved key
      const messageId = resourceData.id;
      const subscriptionId = item.subscriptionId;
      const cacheKey = `${subscriptionId}-${messageId}`;
      
      if (this.processedMessages.has(cacheKey)) {
        this.logger.warn(
          `Skipping already processed message. MessageId: ${messageId}, SubscriptionId: ${subscriptionId}`,
          LogCategory.WEBHOOK,
        );
        return;
      }

      // Mark as being processed immediately to prevent race conditions
      this.processedMessages.add(cacheKey);
      
      this.logger.log(
        `Processing new Outlook message. MessageId: ${messageId}, SubscriptionId: ${subscriptionId}`,
      );

      // Get token for this subscription
      const token = await this.outlookService.getTokenForUser(subscriptionId);
      if (!token) {
        this.logger.warn(
          'Token not found for subscription',
          LogCategory.WEBHOOK,
          {
            subscriptionId: subscriptionId,
            messageId: messageId,
          },
        );
        return;
      }

      // Find user by token
      const user = await this.userService.findOne(token.userId);
      if (!user) {
        this.logger.warn('User not found for token', LogCategory.WEBHOOK, {
          userId: token.userId,
          subscriptionId: subscriptionId,
          messageId: messageId,
        });
        return;
      }

      // Fetch the actual email message from Microsoft Graph API
      const emailMessage: OutlookMessage =
        await this.outlookService.fetchMessageWithRefresh(
          resourceData.id,
          user.id,
        );

      if (!emailMessage) {
        this.logger.warn('Could not fetch email message', LogCategory.WEBHOOK, {
          messageId: resourceData.id,
          userId: user.id,
          subscriptionId: subscriptionId,
        });
        return;
      }

      // Log email processing start
      this.logger.logEmailProcessing(
        'Processing Outlook email',
        {
          subject: emailMessage.subject,
          from: emailMessage.from?.emailAddress?.address,
          messageId: emailMessage.id,
        },
        { userId: user.id },
      );

      // Process email through MailFilter service using the dedicated Outlook function
      const result = await this.mailFilterService.processEmailAndCreateJobApplyFromOutlook(
        emailMessage,
        user.id,
      );

      this.logger.logEmailProcessing(
        'Outlook email processed successfully',
        {
          subject: emailMessage.subject,
          messageId: emailMessage.id,
        },
        { userId: user.id },
      );
    } catch (error) {
      this.logger.error(
        'Error processing notification item',
        undefined,
        LogCategory.WEBHOOK,
        {
          error: error.message,
          item,
          requestContext,
        },
      );
    }
  }
}
