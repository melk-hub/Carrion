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
import { User } from '@prisma/client';

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
    public readonly logger: CustomLoggingService,
  ) {
    if (!AuthService.webhookRenewalInitialized) {
      AuthService.webhookRenewalInitialized = true;
      this.initializeWebhookMonitoring();
    }
  }

  async validateOAuthUser(
    provider: 'Google_oauth2' | 'Microsoft_oauth2',
    providerId: string,
    oauthProfile: CreateUserDto,
    loggedInUserId?: string,
  ): Promise<User> {
    const providerNameDisplay =
      provider === 'Google_oauth2' ? 'Google' : 'Microsoft';

    const existingTokenLink = await this.prisma.token.findUnique({
      where: { name_providerId: { name: provider, providerId } },
      include: { user: true },
    });

    if (existingTokenLink) {
      if (loggedInUserId && existingTokenLink.userId !== loggedInUserId) {
        throw new ConflictException(
          `This ${providerNameDisplay} account is already linked to another user.`,
        );
      }
      this.logger.log(
        `Login successful for user ${existingTokenLink.userId} via existing provider link.`,
      );
      return existingTokenLink.user;
    }

    if (loggedInUserId) {
      const userWithOauthEmail = await this.userService.findByIdentifier(
        oauthProfile.email,
        true,
      );
      if (userWithOauthEmail && userWithOauthEmail.id !== loggedInUserId) {
        throw new ConflictException(
          `The email address ${oauthProfile.email} is already used by another account.`,
        );
      }
      return this.prisma.user.findUnique({ where: { id: loggedInUserId } });
    }

    const userWithOauthEmail = await this.userService.findByIdentifier(
      oauthProfile.email,
      true,
    );
    if (userWithOauthEmail) {
      this.logger.log(
        `User with email ${oauthProfile.email} exists. Logging in and linking new provider.`,
      );
      return userWithOauthEmail;
    }

    this.logger.log(`Creating new user with email ${oauthProfile.email}.`);
    const { firstName, lastName, ...coreUserData } = oauthProfile;
    const newUser = await this.userService.create({
      ...coreUserData,
      password: '',
    });
    if (firstName || lastName) {
      await this.prisma.userProfile.create({
        data: { userId: newUser.id, firstName, lastName },
      });
    }
    return newUser;
  }

  async saveTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    days: number,
    name: 'Google_oauth2' | 'Microsoft_oauth2',
    providerId: string,
  ): Promise<void> {
    const expirationTime = this.calculateTokenExpiration(days);

    await this.prisma.token.upsert({
      where: { name_providerId: { name, providerId } },
      update: {
        accessToken,
        refreshToken,
        tokenTimeValidity: expirationTime,
        userId,
      },
      create: {
        name,
        providerId,
        accessToken,
        refreshToken,
        tokenTimeValidity: expirationTime,
        userId,
      },
    });
  }

  async initializeOutlookWebhookRenewals(): Promise<void> {
    try {
      const microsoftTokens = await this.prisma.token.findMany({
        where: { name: 'Microsoft_oauth2', externalId: { not: null } },
        include: { user: true },
      });
      this.logger.logAuthEvent(
        `Initializing webhook renewals for ${microsoftTokens.length} Outlook subscriptions`,
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
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      const subscription = response.data;
      if (subscription && subscription.expirationDateTime) {
        const expirationDate = new Date(subscription.expirationDateTime);
        const now = new Date();
        const timeDiff = expirationDate.getTime() - now.getTime();
        if (timeDiff <= 60 * 60 * 1000) {
          await this.renewOutlookWebhook(userId, subscriptionId);
        } else {
          const renewalDelay = Math.max(timeDiff - 60 * 60 * 1000, 0);
          setTimeout(
            () => this.renewOutlookWebhook(userId, subscriptionId),
            renewalDelay,
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
        const newSubscriptionId = await this.createOutlookWebhook(
          accessToken,
          userId,
        );
        if (newSubscriptionId) {
          await this.updateMicrosoftTokenWithSubscription(
            userId,
            newSubscriptionId,
          );
        }
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

  async validateUser(
    identifier: string,
    password: string,
    isEmail: boolean,
  ): Promise<any> {
    const user = await this.userService.findByIdentifier(identifier, isEmail);
    if (!user) return null;
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;
    return user;
  }

  async login(userId: string): Promise<any> {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return { id: userId, accessToken, refreshToken };
  }

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    const existingUserByEmail = await this.userService.findByIdentifier(
      createUserDto.email,
      true,
    );
    const existingUsername = await this.userService.findByIdentifier(
      createUserDto.username,
      false,
    );
    if (existingUserByEmail || existingUsername) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.login(user.id);
  }

  async generateTokens(userId: string): Promise<any> {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<any> {
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
      await this.userService.updateHashedRefreshToken(
        userId,
        await argon2.hash(tokens.refreshToken),
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

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<any> {
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

  async validateCookie(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      if (!decoded || !decoded.sub) return null;
      return await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true },
      });
    } catch (error) {
      this.logger.error('Token validation error', undefined, LogCategory.AUTH, {
        error: error.message,
      });
      return null;
    }
  }

  async signOut(userId: string): Promise<void> {
    await this.userService.updateHashedRefreshToken(userId, null);
  }

  async validateJwtUser(userId: string): Promise<any> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    return { id: user.id, role: user.role as Role };
  }

  async createGmailWebhook(accessToken: string, userId: string): Promise<void> {
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
    }
  }

  async createOutlookWebhook(
    accessToken: string,
    userId: string,
    retryCount: number = 0,
  ): Promise<string | undefined> {
    const maxRetries = 3;
    const baseDelay = 2000;
    try {
      const webhookUrl = `${process.env.FRONT}/webhooks/outlook/handle-notification`;
      const expirationDateTime = new Date(Date.now() + 4230 * 60 * 1000);
      const response = await firstValueFrom(
        this.httpService.post(
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
        ),
      );
      if (response.data?.id) {
        this.logger.logAuthEvent(
          'Outlook webhook subscription created successfully',
          userId,
          { subscriptionId: response.data.id },
        );
        return response.data.id;
      }
      throw new Error('Webhook created but no subscription ID returned');
    } catch (error) {
      if (this.isRetryableWebhookError(error) && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        this.logger.logAuthEvent(
          `Outlook webhook creation failed, retrying in ${delay}ms`,
          userId,
          { attempt: retryCount + 1, error: error.message },
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.createOutlookWebhook(accessToken, userId, retryCount + 1);
      }
      this.logger.error(
        'Error creating Outlook webhook subscription - all retries exhausted',
        undefined,
        LogCategory.WEBHOOK,
        { error: error.response?.data || error.message },
      );
    }
    return undefined;
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
    const renewalTime = 4170 * 60 * 1000; // 69.5 hours
    setTimeout(
      () => this.renewOutlookWebhook(userId, subscriptionId),
      renewalTime,
    );
  }

  async renewOutlookWebhook(
    userId: string,
    subscriptionId: string,
  ): Promise<void> {
    try {
      const validToken = await this.getValidToken(userId, 'Microsoft_oauth2');
      if (!validToken) throw new Error('No valid token for webhook renewal');
      const newExpiration = new Date(Date.now() + 4230 * 60 * 1000);
      await firstValueFrom(
        this.httpService.patch(
          `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`,
          { expirationDateTime: newExpiration.toISOString() },
          {
            headers: {
              Authorization: `Bearer ${validToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      this.logger.logAuthEvent('Outlook webhook renewed successfully', userId, {
        subscriptionId,
      });
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
          const newSubscriptionId = await this.createOutlookWebhook(
            validToken,
            userId,
          );
          if (newSubscriptionId)
            await this.updateMicrosoftTokenWithSubscription(
              userId,
              newSubscriptionId,
            );
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
      await this.prisma.token.updateMany({
        where: { userId, name: 'Google_oauth2' },
        data: { externalId: historyId },
      });
    } catch (error) {
      this.logger.error(
        'Failed to update Google token with history ID',
        undefined,
        LogCategory.AUTH,
        { error: error.message },
      );
    }
  }

  async updateMicrosoftTokenWithSubscription(
    userId: string,
    subscriptionId: string,
  ): Promise<void> {
    try {
      await this.prisma.token.updateMany({
        where: { userId, name: 'Microsoft_oauth2' },
        data: { externalId: subscriptionId },
      });
    } catch (error) {
      this.logger.error(
        'Failed to update Microsoft token with subscription ID',
        undefined,
        LogCategory.AUTH,
        { error: error.message },
      );
    }
  }

  calculateTokenExpiration(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  async refreshMicrosoftToken(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken?: string } | null> {
    const token = await this.prisma.token.findFirst({
      where: { userId, name: 'Microsoft_oauth2' },
    });
    if (!token?.refreshToken) return null;
    try {
      const params = new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        refresh_token: token.refreshToken,
        grant_type: 'refresh_token',
        scope: 'openid profile offline_access User.Read Mail.Read',
      });
      const response = await firstValueFrom(
        this.httpService.post(
          'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          params,
        ),
      );
      const { access_token, refresh_token, expires_in } = response.data;
      await this.saveTokens(
        userId,
        access_token,
        refresh_token || token.refreshToken,
        expires_in / 86400,
        'Microsoft_oauth2',
        token.providerId,
      );
      return { accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      this.logger.error(
        'Failed to refresh Microsoft token',
        undefined,
        LogCategory.AUTH,
        { error: error.response?.data || error.message },
      );
      return null;
    }
  }

  async refreshGoogleToken(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken?: string } | null> {
    const token = await this.prisma.token.findFirst({
      where: { userId, name: 'Google_oauth2' },
    });
    if (!token?.refreshToken) return null;
    try {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: token.refreshToken,
        grant_type: 'refresh_token',
      });
      const response = await firstValueFrom(
        this.httpService.post('https://oauth2.googleapis.com/token', params),
      );
      const { access_token, refresh_token, expires_in } = response.data;
      await this.saveTokens(
        userId,
        access_token,
        refresh_token || token.refreshToken,
        expires_in / 86400,
        'Google_oauth2',
        token.providerId,
      );
      return { accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      this.logger.error(
        'Failed to refresh Google token',
        undefined,
        LogCategory.AUTH,
        { error: error.response?.data || error.message },
      );
      return null;
    }
  }

  async getValidToken(
    userId: string,
    tokenName: 'Google_oauth2' | 'Microsoft_oauth2',
  ): Promise<string | null> {
    const token = await this.prisma.token.findFirst({
      where: { userId, name: tokenName },
    });
    if (!token) return null;
    if (
      new Date(token.tokenTimeValidity) > new Date(Date.now() + 5 * 60 * 1000)
    ) {
      return token.accessToken;
    }
    const refreshed =
      tokenName === 'Microsoft_oauth2'
        ? await this.refreshMicrosoftToken(userId)
        : await this.refreshGoogleToken(userId);
    return refreshed?.accessToken || null;
  }

  private isValidJwtFormat(token: string): boolean {
    return token?.split('.').length === 3;
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
            const isActive = await this.checkWebhookSubscription(
              tokenRecord.userId,
              tokenRecord.externalId,
            );
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
                const newSubscriptionId = await this.createOutlookWebhook(
                  validToken,
                  tokenRecord.userId,
                );
                if (newSubscriptionId) {
                  await this.updateMicrosoftTokenWithSubscription(
                    tokenRecord.userId,
                    newSubscriptionId,
                  );
                }
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

  public async checkWebhookSubscription(
    userId: string,
    subscriptionId: string,
  ): Promise<boolean> {
    try {
      const validToken = await this.getValidToken(userId, 'Microsoft_oauth2');
      if (!validToken) return false;
      const url = `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${validToken}` },
          timeout: 5000,
        }),
      );
      if (response.data?.id && response.data?.expirationDateTime) {
        return new Date(response.data.expirationDateTime) > new Date();
      }
      return false;
    } catch (error) {
      if (error.response?.status === 404) return false;
      this.logger.warn(
        'Failed to check webhook subscription status',
        LogCategory.WEBHOOK,
        { subscriptionId, error: error.message },
      );
      return true;
    }
  }

  async cleanupInvalidTokens(): Promise<void> {
    try {
      const tokens = await this.prisma.token.findMany({
        where: { name: 'Microsoft_oauth2' },
        take: 20,
      });
      const tokensToDelete = tokens
        .filter(
          (token) =>
            !(token.accessToken && this.isValidJwtFormat(token.accessToken)) &&
            !(token.refreshToken && token.refreshToken.trim() !== ''),
        )
        .map((token) => token.id);

      if (tokensToDelete.length > 0) {
        await this.prisma.token.deleteMany({
          where: { id: { in: tokensToDelete } },
        });
        this.logger.log(
          `Cleaned up ${tokensToDelete.length} invalid Microsoft tokens`,
          LogCategory.AUTH,
        );
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
