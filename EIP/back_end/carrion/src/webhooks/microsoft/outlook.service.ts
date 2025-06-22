import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Token } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import {
  CustomLoggingService,
  LogCategory,
} from 'src/common/services/logging.service';

@Injectable()
export class OutlookService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly logger: CustomLoggingService,
  ) {}

  async fetchMessage(messageId: string, accessToken: string): Promise<any> {
    try {
      const url = `https://graph.microsoft.com/v1.0/me/messages/${messageId}`;

      const response$ = this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        this.logger.warn(
          'Access token expired while fetching message',
          LogCategory.WEBHOOK,
          {
            messageId,
            error: error.message,
          },
        );
        throw new Error('Access token expired');
      }
      throw error;
    }
  }

  async fetchMessageWithRefresh(
    messageId: string,
    userId: string,
  ): Promise<any> {
    try {
      // Get a valid token (will refresh if necessary)
      const validToken = await this.authService.getValidToken(
        userId,
        'Microsoft_oauth2',
      );
      if (!validToken) {
        this.logger.error(
          'No valid Microsoft token available for user',
          undefined,
          LogCategory.WEBHOOK,
          { userId },
        );
        throw new Error('No valid Microsoft token available');
      }

      return await this.fetchMessage(messageId, validToken);
    } catch (error) {
      this.logger.error(
        'Failed to fetch message with token refresh',
        undefined,
        LogCategory.WEBHOOK,
        {
          messageId,
          userId,
          error: error.message,
        },
      );
      throw error;
    }
  }

  async getTokenForUser(subscriptionId: string): Promise<Token> {
    try {
      // Find the Microsoft token with this subscriptionId in the externalId
      const token = await this.prisma.token.findFirst({
        where: {
          name: 'Microsoft_oauth2',
          externalId: subscriptionId,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!token) {
        this.logger.warn(
          'Microsoft token not found for subscription',
          LogCategory.WEBHOOK,
          {
            subscriptionId,
          },
        );
        return null;
      }

      // Verify the user exists
      const user = await this.prisma.user.findUnique({
        where: { id: token.userId },
      });

      if (!user) {
        this.logger.warn('User not found for token', LogCategory.WEBHOOK, {
          userId: token.userId,
          subscriptionId,
        });
        return null;
      }

      this.logger.log('Token found for subscription', LogCategory.WEBHOOK, {
        userId: user.id,
        subscriptionId,
      });

      return token;
    } catch (error) {
      this.logger.error(
        'Error finding token for subscription',
        undefined,
        LogCategory.WEBHOOK,
        {
          subscriptionId,
          error: error.message,
        },
      );
      return null;
    }
  }

  async getTokenByUserId(userId: string): Promise<Token> {
    return await this.prisma.token.findFirst({
      where: {
        userId,
        name: 'Microsoft_oauth2',
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
