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
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401)
        throw new Error('Access token expired');
      throw error;
    }
  }

  async fetchMessageWithRefresh(
    messageId: string,
    userId: string,
  ): Promise<any> {
    try {
      const tokenRecord = await this.getTokenByUserId(userId);
      if (!tokenRecord) {
        throw new Error('No Microsoft token record found for user');
      }

      const validAccessToken = await this.authService.getValidToken(
        userId,
        'Microsoft_oauth2',
      );
      if (!validAccessToken) {
        throw new Error('No valid Microsoft token available');
      }

      await this.authService.checkAndRenewWebhook(
        tokenRecord,
        validAccessToken,
      );

      return await this.fetchMessage(messageId, validAccessToken);
    } catch (error) {
      this.logger.error(
        'Failed to fetch message with token refresh',
        undefined,
        LogCategory.WEBHOOK,
        { messageId, userId, error: error.message },
      );
      throw error;
    }
  }

  async getTokenForUser(subscriptionId: string): Promise<Token | null> {
    try {
      const token = await this.prisma.token.findFirst({
        where: { name: 'Microsoft_oauth2', externalId: subscriptionId },
        orderBy: { createdAt: 'desc' },
      });
      if (!token) return null;
      const user = await this.prisma.user.findUnique({
        where: { id: token.userId },
      });
      if (!user) return null;
      return token;
    } catch (error) {
      return null;
    }
  }

  async getTokenByUserId(userId: string): Promise<Token | null> {
    return await this.prisma.token.findFirst({
      where: { userId, name: 'Microsoft_oauth2' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
