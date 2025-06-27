import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CurrentUser } from './types/current-user';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  CustomLoggingService,
  LogCategory,
} from 'src/common/services/logging.service';

@Injectable()
export class AuthService {
  private static webhookRenewalInitialized = false;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly logger: CustomLoggingService,
  ) {
    if (!AuthService.webhookRenewalInitialized) {
      AuthService.webhookRenewalInitialized = true;
      this.initializeOutlookWebhookRenewals();
    }
  }

  async initializeOutlookWebhookRenewals(): Promise<void> {
    try {
      const microsoftTokens = await this.prisma.token.findMany({
        where: { name: 'Microsoft_oauth2', externalId: { not: null } },
        include: { user: true },
      });
      this.logger.logAuthEvent(
        `Initializing webhook renewals for ${microsoftTokens.length} Outlook subscriptions`,
        undefined,
      );
      for (const token of microsoftTokens) {
        try {
          const validToken = await this.getValidToken(
            token.userId,
            'Microsoft_oauth2',
          );
          if (validToken && token.externalId) {
            await this.checkAndScheduleOutlookRenewal(
              token.userId,
              token.externalId,
              validToken,
            );
          }
        } catch (error) {
          this.logger.warn(
            `Failed to initialize webhook renewal for user ${token.userId}`,
            LogCategory.WEBHOOK,
            { error: error.message },
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to initialize Outlook webhook renewals',
        undefined,
        LogCategory.WEBHOOK,
        { error: error.message },
      );
    }
  }

  private async checkAndScheduleOutlookRenewal(
    userId: string,
    subscriptionId: string,
    accessToken: string,
  ): Promise<void> {
    try {
      const url = `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`;
      const response$ = this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const response = await firstValueFrom(response$);
      const subscription = response.data;
      if (subscription && subscription.expirationDateTime) {
        const expirationDate = new Date(subscription.expirationDateTime);
        const now = new Date();
        const timeDiff = expirationDate.getTime() - now.getTime();
        if (timeDiff <= 60 * 60 * 1000) {
          this.logger.logAuthEvent(
            'Outlook subscription expiring soon, renewing immediately',
            undefined,
            {
              subscriptionId,
              expirationDateTime: subscription.expirationDateTime,
            },
          );
          await this.renewOutlookWebhook(userId, subscriptionId);
        } else {
          const renewalDelay = Math.max(timeDiff - 60 * 60 * 1000, 0);
          setTimeout(async () => {
            await this.renewOutlookWebhook(userId, subscriptionId);
          }, renewalDelay);
          this.logger.logAuthEvent(
            'Outlook webhook renewal scheduled',
            undefined,
            {
              subscriptionId,
              expirationDateTime: subscription.expirationDateTime,
              renewalInMinutes: Math.round(renewalDelay / 60000),
            },
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        `Subscription ${subscriptionId} may be invalid, will try to recreate`,
        LogCategory.WEBHOOK,
        { userId, error: error.message },
      );
      try {
        await this.createOutlookWebhook(accessToken, userId);
      } catch (recreateError) {
        this.logger.error(
          'Failed to recreate invalid Outlook webhook',
          undefined,
          LogCategory.WEBHOOK,
          { userId, error: recreateError.message },
        );
      }
    }
  }

  async validateUser(identifier: string, password: string, isEmail: boolean) {
    const user = await this.userService.findByIdentifier(identifier, isEmail);
    if (!user) return null;
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;
    return user;
  }

  async login(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return { id: userId, accessToken, refreshToken };
  }

  async signUp(createUserDto: CreateUserDto) {
    const existingUserByEmail = await this.userService.findByIdentifier(
      createUserDto.email,
      true,
    );
    const existingUsername = await this.userService.findByIdentifier(
      createUserDto.username,
      false,
    );
    if (existingUserByEmail || existingUsername)
      throw new ConflictException('User with this email already exists');
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.login(user.id);
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    userId: string;
  } | null> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.refreshTokenConfig.secret,
      });
      if (!decoded || !decoded.sub) return null;
      const userId = decoded.sub;
      const userToken = await this.prisma.token.findFirst({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
      });
      if (!userToken || !userToken.refreshToken) return null;
      const refreshTokenMatches = await argon2.verify(
        userToken.refreshToken,
        refreshToken,
      );
      if (!refreshTokenMatches) return null;
      const tokens = await this.generateTokens(userId);
      const hashedRefreshToken = await argon2.hash(tokens.refreshToken);
      await this.userService.updateHashedRefreshToken(
        userId,
        hashedRefreshToken,
      );
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userId: userId,
      };
    } catch (error) {
      this.logger.error(
        'Refresh token validation failed',
        undefined,
        LogCategory.AUTH,
        { error: error.message },
      );
      return null;
    }
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const userToken = await this.prisma.token.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!userToken) throw new UnauthorizedException('Invalid Refresh Token');
    const refreshTokenMatches = await argon2.verify(
      userToken.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid Refresh Token');
    return { id: userId };
  }

  async validateCookie(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (!decoded || !decoded.sub) return null;
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true },
      });
      return user || null;
    } catch (error) {
      this.logger.error('Token validation error', undefined, LogCategory.AUTH, {
        error: error.message,
      });
      return null;
    }
  }

  async signOut(userId: string) {
    await this.userService.updateHashedRefreshToken(userId, null);
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = { id: user.id, role: user.role as Role };
    return currentUser;
  }

  async validateOAuthUser(OAuthUser: CreateUserDto, userId?: string) {
    if (userId) {
      this.logger.logAuthEvent(
        'User already logged in, linking new service',
        userId,
        {
          email: OAuthUser.email,
        },
      );
      const user = await this.userService.findOne(userId);
      if (!user) throw new UnauthorizedException('User not found for linking.');
      return user;
    }

    const existingUser = await this.userService.findByIdentifier(
      OAuthUser.email,
      true,
    );
    if (existingUser) {
      this.logger.logAuthEvent('User found with email', undefined, {
        email: OAuthUser.email,
      });
      return existingUser;
    }

    const existingUserByUsername = await this.userService.findByIdentifier(
      OAuthUser.username,
      false,
    );
    let finalUsername = OAuthUser.username;
    if (existingUserByUsername) {
      const timestamp = Date.now().toString().slice(-6);
      finalUsername = `${OAuthUser.username}_${timestamp}`;
      this.logger.logAuthEvent('Username already exists', undefined, {
        username: OAuthUser.username,
      });
    }

    try {
      const newUser = await this.userService.create({
        ...OAuthUser,
        username: finalUsername,
      });
      this.logger.logAuthEvent('New OAuth user created', newUser.id, {
        email: OAuthUser.email,
        username: finalUsername,
      });
      return newUser;
    } catch (error) {
      this.logger.error(
        'Failed to create OAuth user',
        undefined,
        LogCategory.AUTH,
        { error: error.message },
      );
      if (error.message?.includes('already exists')) {
        const uniqueUsername = `${OAuthUser.username}_${Date.now()}`;
        this.logger.logAuthEvent('Retrying with unique username', undefined, {
          uniqueUsername,
        });
        return await this.userService.create({
          ...OAuthUser,
          username: uniqueUsername,
        });
      }
      throw error;
    }
  }

  async createGmailWebhook(accessToken: string, userId: string) {
    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/watch';
    const payload = {
      labelIds: ['INBOX'],
      topicName: `projects/${process.env.GOOGLE_PROJECT_ID}/topics/${process.env.GOOGLE_PROJECT_WEBHOOK}`,
    };
    try {
      const response = await this.httpService
        .post(url, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        .toPromise();
      await this.updateGoogleTokenWithHistoryId(
        userId,
        response.data['historyId'],
      );
    } catch (error) {
      this.logger.error(
        'Error creating Gmail webhook subscription',
        undefined,
        LogCategory.WEBHOOK,
        { error: error.message },
      );
      this.logger.logAuthEvent(
        'Continuing authentication without Gmail webhook',
        undefined,
      );
    }
  }

  async createOutlookWebhook(
    accessToken: string,
    userId: string,
    retryCount: number = 0,
  ): Promise<void> {
    const maxRetries = 3;
    const baseDelay = 2000;
    try {
      const webhookUrl = `${process.env.FRONTEND_URL}/webhooks/outlook/handle-notification`;
      const expirationDateTime = new Date(Date.now() + 4230 * 60 * 1000);
      this.logger.logAuthEvent(
        'Creating Outlook webhook subscription',
        userId,
        {
          webhookUrl,
          expirationDateTime: expirationDateTime.toISOString(),
          attempt: retryCount + 1,
        },
      );
      const response$ = this.httpService.post(
        'https://graph.microsoft.com/v1.0/subscriptions',
        {
          changeType: 'created',
          notificationUrl: webhookUrl,
          resource: "me/mailFolders('inbox')/messages",
          expirationDateTime: expirationDateTime.toISOString(),
          clientState: `${userId}-outlook`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );
      const response = await firstValueFrom(response$);
      if (response.data?.id) {
        await this.updateMicrosoftTokenWithSubscription(
          userId,
          response.data.id,
        );
        this.scheduleOutlookWebhookRenewal(userId, response.data.id);
        this.logger.logAuthEvent(
          'Outlook webhook subscription created successfully',
          userId,
          {
            subscriptionId: response.data.id,
            expirationDateTime: response.data.expirationDateTime,
            attempt: retryCount + 1,
          },
        );
      } else {
        throw new Error('Webhook created but no subscription ID returned');
      }
    } catch (error) {
      const isRetryableError = this.isRetryableWebhookError(error);
      if (retryCount < maxRetries && isRetryableError) {
        const delay = baseDelay * Math.pow(2, retryCount);
        this.logger.logAuthEvent(
          `Outlook webhook creation failed, retrying in ${delay}ms`,
          userId,
          {
            attempt: retryCount + 1,
            maxRetries,
            error: error.message,
            willRetry: true,
          },
        );
        setTimeout(async () => {
          await this.createOutlookWebhook(accessToken, userId, retryCount + 1);
        }, delay);
        return;
      }
      let errorDetails: any = {
        message: error.message,
        webhookUrl: `${process.env.FRONTEND_URL}/webhooks/outlook/handle-notification`,
        userId,
        attempt: retryCount + 1,
        finalAttempt: true,
      };
      if (error.response) {
        errorDetails = {
          ...errorDetails,
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          responseHeaders: error.response.headers,
        };
      }
      this.logger.error(
        'Error creating Outlook webhook subscription - all retries exhausted',
        undefined,
        LogCategory.WEBHOOK,
        errorDetails,
      );
      this.logger.logAuthEvent(
        'Continuing authentication without Outlook webhook',
        undefined,
        { error: error.message, finalAttempt: true },
      );
    }
  }

  private isRetryableWebhookError(error: any): boolean {
    if (!error.response) return true;
    const status = error.response.status;
    const retryableStatuses = [429, 500, 502, 503, 504];
    return retryableStatuses.includes(status);
  }

  private scheduleOutlookWebhookRenewal(
    userId: string,
    subscriptionId: string,
  ): void {
    const renewalTime = 4170 * 60 * 1000;
    setTimeout(async () => {
      await this.renewOutlookWebhook(userId, subscriptionId);
    }, renewalTime);
    this.logger.logAuthEvent('Outlook webhook renewal scheduled', undefined, {
      subscriptionId,
      renewalInMinutes: 4170,
    });
  }

  async renewOutlookWebhook(
    userId: string,
    subscriptionId: string,
  ): Promise<void> {
    try {
      const validToken = await this.getValidToken(userId, 'Microsoft_oauth2');
      if (!validToken) {
        this.logger.error(
          'Cannot renew Outlook webhook - no valid token',
          undefined,
          LogCategory.WEBHOOK,
          { userId, subscriptionId },
        );
        return;
      }
      const newExpiration = new Date(Date.now() + 4230 * 60 * 1000);
      const expirationDateTime = newExpiration.toISOString();
      const url = `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`;
      const body = { expirationDateTime };
      const response$ = this.httpService.patch(url, body, {
        headers: {
          Authorization: `Bearer ${validToken}`,
          'Content-Type': 'application/json',
        },
      });
      await firstValueFrom(response$);
      this.logger.logAuthEvent(
        'Outlook webhook renewed successfully',
        undefined,
        { subscriptionId, newExpirationDateTime: expirationDateTime },
      );
      this.scheduleOutlookWebhookRenewal(userId, subscriptionId);
    } catch (error) {
      this.logger.error(
        'Failed to renew Outlook webhook',
        undefined,
        LogCategory.WEBHOOK,
        { userId, subscriptionId, error: error.message },
      );
      try {
        const validToken = await this.getValidToken(userId, 'Microsoft_oauth2');
        if (validToken) {
          await this.createOutlookWebhook(validToken, userId);
        }
      } catch (recreateError) {
        this.logger.error(
          'Failed to recreate Outlook webhook after renewal failure',
          undefined,
          LogCategory.WEBHOOK,
          { userId, error: recreateError.message },
        );
      }
    }
  }

  async updateGoogleTokenWithHistoryId(
    userId: string,
    historyId: string,
  ): Promise<void> {
    try {
      const existingToken = await this.prisma.token.findFirst({
        where: { userId, name: 'Google_oauth2' },
      });
      if (existingToken) {
        await this.prisma.token.update({
          where: { id: existingToken.id },
          data: { externalId: historyId },
        });
        this.logger.logAuthEvent(
          'Google token updated with history ID',
          userId,
          { historyId },
        );
      } else {
        this.logger.warn(
          'No Google token found to update with history ID',
          LogCategory.AUTH,
          { userId, historyId },
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to update Google token with history ID',
        undefined,
        LogCategory.AUTH,
        { userId, historyId, error: error.message },
      );
    }
  }

  async updateMicrosoftTokenWithSubscription(
    userId: string,
    subscriptionId: string,
  ): Promise<void> {
    try {
      const existingToken = await this.prisma.token.findFirst({
        where: { userId, name: 'Microsoft_oauth2' },
      });
      if (existingToken) {
        await this.prisma.token.update({
          where: { id: existingToken.id },
          data: { externalId: subscriptionId },
        });
        this.logger.logAuthEvent(
          'Microsoft token updated with subscription ID',
          userId,
          { subscriptionId },
        );
      } else {
        this.logger.warn(
          'No Microsoft token found to update with subscription ID',
          LogCategory.AUTH,
          { userId, subscriptionId },
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to update Microsoft token with subscription ID',
        undefined,
        LogCategory.AUTH,
        { userId, subscriptionId, error: error.message },
      );
    }
  }

  calculateTokenExpiration(days: number): Date {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + days * 24);
    return expirationTime;
  }

  async saveTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    days: number,
    name: string,
  ): Promise<void> {
    const expirationTime = this.calculateTokenExpiration(days);
    const existingToken = await this.prisma.token.findFirst({
      where: { userId, name },
    });
    if (existingToken) {
      await this.prisma.token.update({
        where: { id: existingToken.id },
        data: { accessToken, refreshToken, tokenTimeValidity: expirationTime },
      });
    } else {
      await this.prisma.token.create({
        data: {
          name,
          accessToken,
          refreshToken,
          tokenTimeValidity: expirationTime,
          userId,
        },
      });
    }
  }

  async refreshMicrosoftToken(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken?: string } | null> {
    try {
      const existingToken = await this.prisma.token.findFirst({
        where: { userId, name: 'Microsoft_oauth2' },
      });
      if (!existingToken || !existingToken.refreshToken) {
        this.logger.warn(
          'No refresh token found for Microsoft user',
          LogCategory.AUTH,
          { userId },
        );
        return null;
      }
      const tokenUrl =
        'https://login.microsoftonline.com/common/oauth2/v2.0/token';
      const params = new URLSearchParams();
      params.append('client_id', process.env.MICROSOFT_CLIENT_ID);
      params.append('client_secret', process.env.MICROSOFT_CLIENT_SECRET);
      params.append('refresh_token', existingToken.refreshToken);
      params.append('grant_type', 'refresh_token');
      params.append(
        'scope',
        'openid profile offline_access User.Read Mail.Read',
      );
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      const { access_token, refresh_token, expires_in } = response.data;
      const expirationDays = expires_in
        ? Math.floor(expires_in / (24 * 60 * 60))
        : 60;
      await this.prisma.token.update({
        where: { id: existingToken.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token || existingToken.refreshToken,
          tokenTimeValidity: this.calculateTokenExpiration(expirationDays),
        },
      });
      this.logger.logAuthEvent(
        'Microsoft token refreshed successfully',
        userId,
      );
      return { accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      this.logger.error(
        'Failed to refresh Microsoft token',
        undefined,
        LogCategory.AUTH,
        { userId, error: error.message },
      );
      return null;
    }
  }

  async refreshGoogleToken(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken?: string } | null> {
    try {
      const existingToken = await this.prisma.token.findFirst({
        where: { userId, name: 'Google_oauth2' },
      });
      if (!existingToken || !existingToken.refreshToken) {
        this.logger.warn(
          'No refresh token found for Google user',
          LogCategory.AUTH,
          { userId },
        );
        return null;
      }
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const params = new URLSearchParams();
      params.append('client_id', process.env.GOOGLE_CLIENT_ID);
      params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
      params.append('refresh_token', existingToken.refreshToken);
      params.append('grant_type', 'refresh_token');
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      const { access_token, refresh_token, expires_in } = response.data;
      const expirationDays = expires_in
        ? Math.floor(expires_in / (24 * 60 * 60))
        : 60;
      await this.saveTokens(
        userId,
        access_token,
        refresh_token || existingToken.refreshToken,
        expirationDays,
        'Google_oauth2',
      );
      this.logger.logAuthEvent('Google token refreshed successfully', userId);
      return { accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      this.logger.error(
        'Failed to refresh Google token',
        undefined,
        LogCategory.AUTH,
        { userId, error: error.message },
      );
      return null;
    }
  }

  async getValidToken(
    userId: string,
    tokenName: 'Google_oauth2' | 'Microsoft_oauth2',
  ): Promise<string | null> {
    try {
      const token = await this.prisma.token.findFirst({
        where: { userId, name: tokenName },
      });
      if (!token) {
        this.logger.warn(
          `No ${tokenName} token found for user`,
          LogCategory.AUTH,
          { userId },
        );
        return null;
      }
      if (!token.accessToken || token.accessToken.trim() === '') {
        this.logger.warn(
          `Invalid or empty ${tokenName} token for user`,
          LogCategory.AUTH,
          { userId },
        );
        if (token.refreshToken && token.refreshToken.trim() !== '') {
          const refreshResult =
            tokenName === 'Microsoft_oauth2'
              ? await this.refreshMicrosoftToken(userId)
              : await this.refreshGoogleToken(userId);
          if (refreshResult?.accessToken) return refreshResult.accessToken;
        }
        return null;
      }
      if (tokenName === 'Microsoft_oauth2') {
        if (!this.isValidJwtFormat(token.accessToken)) {
          if (token.refreshToken && token.refreshToken.trim() !== '') {
            this.logger.warn(
              'Microsoft token has invalid JWT format, attempting refresh',
              LogCategory.AUTH,
              {
                userId,
                tokenPreview: token.accessToken.substring(0, 20) + '...',
                hasRefreshToken: !!token.refreshToken,
              },
            );
            const refreshResult = await this.refreshMicrosoftToken(userId);
            if (refreshResult?.accessToken) return refreshResult.accessToken;
          } else {
            this.logger.error(
              'Microsoft token has invalid JWT format and no valid refresh token',
              undefined,
              LogCategory.AUTH,
              { userId, action: 'token_requires_reauth' },
            );
          }
          return null;
        }
      }
      const now = new Date();
      const bufferTime = new Date(now.getTime() + 10 * 60 * 1000);
      if (token.tokenTimeValidity && token.tokenTimeValidity > bufferTime) {
        return token.accessToken;
      }
      this.logger.log(
        `${tokenName} token expired or expiring soon, attempting refresh`,
        LogCategory.AUTH,
        { userId, expiration: token.tokenTimeValidity },
      );
      const refreshResult =
        tokenName === 'Microsoft_oauth2'
          ? await this.refreshMicrosoftToken(userId)
          : await this.refreshGoogleToken(userId);
      if (refreshResult?.accessToken) return refreshResult.accessToken;
      this.logger.warn(
        `Failed to refresh ${tokenName} token for user`,
        LogCategory.AUTH,
        { userId, action: 'token_refresh_failed' },
      );
      return null;
    } catch (error) {
      this.logger.error(
        `Error getting valid ${tokenName} token`,
        undefined,
        LogCategory.AUTH,
        { userId, error: error.message },
      );
      return null;
    }
  }

  private isValidJwtFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    const parts = token.trim().split('.');
    return parts.length === 3 && parts.every((part) => part.length > 0);
  }

  async monitorWebhookHealth(): Promise<void> {
    try {
      const usersWithMicrosoftTokens = (await Promise.race([
        this.prisma.token.findMany({
          where: { name: 'Microsoft_oauth2' },
          include: { user: true },
          take: 10,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 5000),
        ),
      ])) as any[];
      for (let i = 0; i < usersWithMicrosoftTokens.length; i++) {
        const tokenRecord = usersWithMicrosoftTokens[i];
        try {
          if (tokenRecord.externalId) {
            const isActive = await this.checkWebhookSubscription(tokenRecord);
            if (!isActive) {
              this.logger.logAuthEvent(
                'Webhook subscription is inactive, attempting to recreate',
                tokenRecord.userId,
                { subscriptionId: tokenRecord.externalId },
              );
              const validToken = await this.getValidToken(
                tokenRecord.userId,
                'Microsoft_oauth2',
              );
              if (validToken) {
                await this.createOutlookWebhook(validToken, tokenRecord.userId);
              }
            }
          }
          if (i < usersWithMicrosoftTokens.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (tokenError) {
          this.logger.warn(
            'Error processing individual token in webhook monitoring',
            LogCategory.WEBHOOK,
            { userId: tokenRecord.userId, error: tokenError.message },
          );
          continue;
        }
      }
    } catch (error) {
      this.logger.error(
        'Error during webhook health monitoring',
        undefined,
        LogCategory.WEBHOOK,
        { error: error.message },
      );
    }
  }

  public async checkWebhookSubscription(tokenRecord: any): Promise<boolean> {
    try {
      const validToken = await this.getValidToken(
        tokenRecord.userId,
        'Microsoft_oauth2',
      );
      if (!validToken) return false;
      const url = `https://graph.microsoft.com/v1.0/subscriptions/${tokenRecord.externalId}`;
      const response$ = this.httpService.get(url, {
        headers: { Authorization: `Bearer ${validToken}` },
        timeout: 5000,
      });
      const response = await firstValueFrom(response$);
      if (response.data?.id && response.data?.expirationDateTime) {
        const expiration = new Date(response.data.expirationDateTime);
        const now = new Date();
        return expiration > now;
      }
      return false;
    } catch (error) {
      if (error.response?.status === 404) return false;
      this.logger.warn(
        'Failed to check webhook subscription status',
        LogCategory.WEBHOOK,
        { subscriptionId: tokenRecord.externalId, error: error.message },
      );
      return true;
    }
  }

  async initializeWebhookMonitoring(): Promise<void> {
    try {
      this.logger.log(
        'Initializing webhook monitoring system...',
        LogCategory.WEBHOOK,
      );
      await this.cleanupInvalidTokens();
      await this.initializeOutlookWebhookRenewals();
      setInterval(
        async () => {
          await this.monitorWebhookHealth();
          await this.cleanupInvalidTokens();
        },
        30 * 60 * 1000,
      );
      this.logger.log(
        'Webhook monitoring system initialized successfully',
        LogCategory.WEBHOOK,
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize webhook monitoring',
        undefined,
        LogCategory.WEBHOOK,
        { error: error.message },
      );
    }
  }

  async cleanupInvalidTokens(): Promise<void> {
    try {
      const microsoftTokens = (await Promise.race([
        this.prisma.token.findMany({
          where: { name: 'Microsoft_oauth2' },
          take: 20,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 5000),
        ),
      ])) as any[];
      let cleanedCount = 0;
      const tokensToDelete = [];
      for (const token of microsoftTokens) {
        try {
          const hasValidAccess =
            token.accessToken && this.isValidJwtFormat(token.accessToken);
          const hasValidRefresh =
            token.refreshToken && token.refreshToken.trim() !== '';
          if (!hasValidAccess && !hasValidRefresh) {
            tokensToDelete.push(token.id);
          }
        } catch (tokenError) {
          this.logger.warn(
            'Error validating token during cleanup',
            LogCategory.AUTH,
            { tokenId: token.id, error: tokenError.message },
          );
        }
      }
      if (tokensToDelete.length > 0) {
        try {
          await this.prisma.token.deleteMany({
            where: { id: { in: tokensToDelete } },
          });
          cleanedCount = tokensToDelete.length;
          this.logger.log(
            `Cleaned up ${cleanedCount} invalid Microsoft tokens`,
            LogCategory.AUTH,
          );
        } catch (deleteError) {
          this.logger.error(
            'Error deleting invalid tokens',
            undefined,
            LogCategory.AUTH,
            { error: deleteError.message, count: tokensToDelete.length },
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Error during token cleanup',
        undefined,
        LogCategory.AUTH,
        { error: error.message },
      );
    }
  }
}
