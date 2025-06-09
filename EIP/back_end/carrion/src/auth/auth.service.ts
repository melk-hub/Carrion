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
import { CustomLoggingService, LogCategory } from 'src/common/services/logging.service';

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
    // Initialize webhook renewals only once
    if (!AuthService.webhookRenewalInitialized) {
      AuthService.webhookRenewalInitialized = true;
      this.initializeOutlookWebhookRenewals();
    }
  }

  async initializeOutlookWebhookRenewals(): Promise<void> {
    try {
      // Find all Microsoft tokens with subscription IDs
      const microsoftTokens = await this.prisma.token.findMany({
        where: {
          name: 'Microsoft_oauth2',
          externalId: {
            not: null,
          },
        },
        include: {
          user: true,
        },
      });

      this.logger.logAuthEvent(
        `Initializing webhook renewals for ${microsoftTokens.length} Outlook subscriptions`,
        undefined,
      );

      for (const token of microsoftTokens) {
        // Check if the subscription is still valid and schedule renewal
        try {
          const validToken = await this.getValidToken(
            token.userId,
            'Microsoft_oauth2',
          );
          if (validToken && token.externalId) {
            // Check subscription status and schedule renewal
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
      // Check if subscription exists and get its expiration
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

        // If expiring within 1 hour, renew immediately
        if (timeDiff <= 60 * 60 * 1000) {
          this.logger.logAuthEvent(
            'Outlook subscription expiring soon, renewing immediately',
            undefined,
            { subscriptionId, expirationDateTime: subscription.expirationDateTime },
          );
          await this.renewOutlookWebhook(userId, subscriptionId);
        } else {
          // Schedule renewal 1 hour before expiration
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

      // If subscription is invalid, try to create a new one
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
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async signUp(createUserDto: CreateUserDto) {
    const existingUserByEmail = await this.userService.findByIdentifier(
      createUserDto.email,
      true,
    );
    const existingUser = await this.userService.findByIdentifier(
      createUserDto.username,
      false,
    );
    if (existingUserByEmail || existingUser)
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
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const userToken = await this.prisma.token.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!userToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    const refreshTokenMatches = await argon2.verify(
      userToken.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    return { id: userId };
  }

  async validateCookie(token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      if (!decoded || !decoded.sub) {
        return null;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true },
      });

      return user || null;
    } catch (error) {
      this.logger.error('Token validation error', undefined, LogCategory.AUTH, { error: error.message });
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

  async validateOAuthUser(OAuthUser: CreateUserDto) {
    // Search by email first
    const existingUser = await this.userService.findByIdentifier(
      OAuthUser.email,
      true,
    );
    if (existingUser) {
      this.logger.logAuthEvent('User found with email', undefined, { email: OAuthUser.email });
      return existingUser;
    }

    // If no user with this email, check the username too
    const existingUserByUsername = await this.userService.findByIdentifier(
      OAuthUser.username,
      false,
    );
    // If username already exists, generate a unique name
    let finalUsername = OAuthUser.username;
    if (existingUserByUsername) {
      // Generate a unique username by adding a suffix
      const timestamp = Date.now().toString().slice(-6); // The last 6 digits of the timestamp
      finalUsername = `${OAuthUser.username}_${timestamp}`;
      this.logger.logAuthEvent('Username already exists', undefined, { username: OAuthUser.username });
    }

    try {
      // Create the user with the potentially changed username
      const newUser = await this.userService.create({
        ...OAuthUser,
        username: finalUsername,
      });
      this.logger.logAuthEvent('New OAuth user created', newUser.id, { email: OAuthUser.email, username: finalUsername });
      return newUser;
    } catch (error) {
      this.logger.error('Failed to create OAuth user', undefined, LogCategory.AUTH, { error: error.message });
      
      if (error.message?.includes('already exists')) {
        const uniqueUsername = `${OAuthUser.username}_${Date.now()}`;
        this.logger.logAuthEvent('Retrying with unique username', undefined, { uniqueUsername });
        return await this.userService.create({
          ...OAuthUser,
          username: uniqueUsername,
        });
      }
      throw error;
    }
  }

  async googleLogin(userId: string, refreshToken: string) {
    let hashedRefreshToken: string;
    if (refreshToken) {
      hashedRefreshToken = await argon2.hash(refreshToken);
      await this.userService.updateHashedRefreshToken(
        userId,
        hashedRefreshToken,
      );
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
      
      // Store the historyId with the Gmail token
      await this.updateGoogleTokenWithHistoryId(userId, response.data['historyId']);
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

  async createOutlookWebhook(accessToken: string, userId: string) {
    // Skip webhook creation in development (HTTP URLs not supported by Microsoft)
    const webhookUrl = `${process.env.BACK}/webhook/outlook`;
    
    this.logger.logAuthEvent(
      'Starting Outlook webhook creation',
      undefined,
      {
        webhookUrl,
        userId,
        backEnv: process.env.BACK,
      },
    );

    if (webhookUrl.startsWith('http://')) {
      this.logger.logAuthEvent(
        'Skipping Outlook webhook creation in development (HTTP not supported by Microsoft Graph API)',
        undefined,
        { webhookUrl },
      );
      return;
    }

    const url = 'https://graph.microsoft.com/v1.0/subscriptions';
    const headers = { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      // First check existing subscriptions
      this.logger.logAuthEvent(
        'Checking existing Outlook subscriptions',
        undefined,
        { url },
      );

    const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          'Failed to fetch existing subscriptions',
          undefined,
          LogCategory.WEBHOOK,
          {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          },
        );
      }

    const data = await response.json();
      const existing = data.value?.find(
      (sub) =>
        sub.resource === "me/mailFolders('inbox')/messages" &&
          sub.notificationUrl === webhookUrl,
    );

    if (existing) {
        this.logger.logAuthEvent(
          'Outlook subscription already exists',
          undefined,
          { subscriptionId: existing.id },
        );
        // Store the existing subscription ID
        await this.updateMicrosoftTokenWithSubscription(userId, existing.id);
      return;
    }

      // Set expiration to maximum allowed (4230 minutes = ~3 days)
      const expiration = new Date(Date.now() + 4230 * 60 * 1000);
    const expirationDateTime = expiration.toISOString();

    const body = {
      changeType: 'created',
        notificationUrl: webhookUrl,
      resource: "me/mailFolders('inbox')/messages",
      expirationDateTime,
      clientState: `${process.env.WEBHOOK_VALIDATION_TOKEN}`,
    };

      this.logger.logAuthEvent(
        'Creating new Outlook webhook subscription',
        undefined,
        {
          body,
          webhookUrl,
          expirationDateTime,
        },
      );

      const response$ = this.httpService.post(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const webhookResponse = await firstValueFrom(response$);
      const subscriptionId = webhookResponse.data['id'];

      // Store the subscriptionId with the Microsoft token
      await this.updateMicrosoftTokenWithSubscription(userId, subscriptionId);

      // Schedule automatic renewal
      this.scheduleOutlookWebhookRenewal(userId, subscriptionId);

      this.logger.logAuthEvent(
        'Outlook webhook created successfully',
        undefined,
        {
          subscriptionId,
          expirationDateTime,
        },
      );
    } catch (error) {
      // Enhanced error logging
      let errorDetails = {
        message: error.message,
        webhookUrl,
        userId,
      };

      // If it's an HTTP error, get more details
      if (error.response) {
        errorDetails = {
          ...errorDetails,
          // status: error.response.status,
          // statusText: error.response.statusText,
          // data: error.response.data,
          // responseHeaders: error.response.headers,
        };
      }

      this.logger.error(
        'Error creating Outlook webhook subscription',
        undefined,
        LogCategory.WEBHOOK,
        errorDetails,
      );

      this.logger.logAuthEvent(
        'Continuing authentication without Outlook webhook',
        undefined,
        { error: error.message },
      );
    }
  }

  private scheduleOutlookWebhookRenewal(
    userId: string,
    subscriptionId: string,
  ): void {
    // Schedule renewal 1 hour before expiration (4230 minutes - 60 minutes = 4170 minutes)
    const renewalTime = 4170 * 60 * 1000;

    setTimeout(async () => {
      await this.renewOutlookWebhook(userId, subscriptionId);
    }, renewalTime);

    this.logger.logAuthEvent(
      'Outlook webhook renewal scheduled',
      undefined,
      {
        subscriptionId,
        renewalInMinutes: 4170,
      },
    );
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

      // Extend the subscription for another maximum period
      const newExpiration = new Date(Date.now() + 4230 * 60 * 1000);
      const expirationDateTime = newExpiration.toISOString();

      const url = `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`;
      const body = {
        expirationDateTime,
      };

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
        {
          subscriptionId,
          newExpirationDateTime: expirationDateTime,
        },
      );

      // Schedule the next renewal
      this.scheduleOutlookWebhookRenewal(userId, subscriptionId);
    } catch (error) {
      this.logger.error(
        'Failed to renew Outlook webhook',
        undefined,
        LogCategory.WEBHOOK,
        {
          userId,
          subscriptionId,
          error: error.message,
        },
      );

      // If renewal fails, try to create a new webhook
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
          {
            userId,
            error: recreateError.message,
          },
        );
      }
    }
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
        // Update the token with the historyId
        await this.prisma.token.update({
          where: { id: existingToken.id },
          data: {
            externalId: historyId,
          },
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
        {
          userId,
          historyId,
          error: error.message,
        },
      );
    }
  }

  async updateMicrosoftTokenWithSubscription(
    userId: string,
    subscriptionId: string,
  ): Promise<void> {
    try {
      // Find the Microsoft token for this user
      const existingToken = await this.prisma.token.findFirst({
        where: {
          userId,
          name: 'Microsoft_oauth2',
        },
      });

      if (existingToken) {
        // Update the token with the subscriptionId
        await this.prisma.token.update({
          where: { id: existingToken.id },
          data: {
            externalId: subscriptionId,
          },
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
        {
          userId,
          subscriptionId,
          error: error.message,
        },
      );
    }
  }

  calculateTokenExpiration(days: number): Date {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getDate() + days);
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
      where: {
        userId,
        name,
      },
    });
    if (existingToken) {
      await this.prisma.token.update({
        where: { id: existingToken.id },
        data: {
          accessToken,
          refreshToken,
          tokenTimeValidity: expirationTime,
        },
      });
    } else {
      await this.prisma.token.create({
        data: {
          name: name,
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
      // Get the current Microsoft token from database
      const existingToken = await this.prisma.token.findFirst({
        where: {
          userId,
          name: 'Microsoft_oauth2',
        },
      });

      if (!existingToken || !existingToken.refreshToken) {
        this.logger.warn(
          'No refresh token found for Microsoft user',
          LogCategory.AUTH,
          { userId },
        );
        return null;
      }

      // Microsoft Graph API endpoint for token refresh
      const tokenUrl =
        'https://login.microsoftonline.com/common/oauth2/v2.0/token';

      const params = new URLSearchParams();
      params.append('client_id', process.env.MICROSOFT_CLIENT_ID);
      params.append('client_secret', process.env.MICROSOFT_CLIENT_SECRET);
      params.append('refresh_token', existingToken.refreshToken);
      params.append('grant_type', 'refresh_token');
      params.append(
        'scope',
        'openid profile offline_access User.Read Mail.Read https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read',
      );

      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate expiration (expires_in is in seconds)
      const expirationDays = expires_in
        ? Math.floor(expires_in / (24 * 60 * 60))
        : 60; // Default to 60 days

      // Update the existing token (preserve the externalId)
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

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
      };
    } catch (error) {
      this.logger.error(
        'Failed to refresh Microsoft token',
        undefined,
        LogCategory.AUTH,
        {
          userId,
          error: error.message,
        },
      );
      return null;
    }
  }

  async refreshGoogleToken(userId: string): Promise<{ accessToken: string; refreshToken?: string } | null> {
    try {
      // Get the current Google token from database
      const existingToken = await this.prisma.token.findFirst({
        where: {
          userId,
          name: 'Google_oauth2',
        },
      });

      if (!existingToken || !existingToken.refreshToken) {
        this.logger.warn('No refresh token found for Google user', LogCategory.AUTH, { userId });
        return null;
      }

      // Google OAuth2 endpoint for token refresh
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const params = new URLSearchParams();
      params.append('client_id', process.env.GOOGLE_CLIENT_ID);
      params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
      params.append('refresh_token', existingToken.refreshToken);
      params.append('grant_type', 'refresh_token');

      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      const { access_token, refresh_token, expires_in } = response.data;
      // Calculate expiration (expires_in is in seconds)
      const expirationDays = expires_in ? Math.floor(expires_in / (24 * 60 * 60)) : 60; // Default to 60 days
      // Save the new tokens
      await this.saveTokens(
        userId,
        access_token,
        refresh_token || existingToken.refreshToken, // Use new refresh token if provided, otherwise keep the old one
        expirationDays,
        'Google_oauth2',
      );

      this.logger.logAuthEvent('Google token refreshed successfully', userId);

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
      };
    } catch (error) {
      this.logger.error(
        'Failed to refresh Google token',
        undefined,
        LogCategory.AUTH,
        {
          userId,
          error: error.message,
        },
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
        where: {
          userId,
          name: tokenName,
        },
      });

      if (!token) {
        this.logger.warn(
          `No ${tokenName} token found for user`,
          LogCategory.AUTH,
          { userId },
        );
        return null;
      }

      // Check if token is still valid (with 5 minute buffer)
      const now = new Date();
      const bufferTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer

      if (token.tokenTimeValidity && token.tokenTimeValidity > bufferTime) {
        // Token is still valid
        return token.accessToken;
      }

      // Token is expired or expiring soon, try to refresh
      this.logger.log(
        `${tokenName} token expired or expiring soon, attempting refresh`,
        LogCategory.AUTH,
        { userId },
      );

      const refreshResult =
        tokenName === 'Microsoft_oauth2'
          ? await this.refreshMicrosoftToken(userId)
          : await this.refreshGoogleToken(userId);

      if (refreshResult) {
        return refreshResult.accessToken;
      }

      this.logger.warn(
        `Failed to refresh ${tokenName} token for user`,
        LogCategory.AUTH,
        { userId },
      );
      return null;
    } catch (error) {
      this.logger.error(
        `Error getting valid ${tokenName} token`,
        undefined,
        LogCategory.AUTH,
        {
          userId,
          error: error.message,
        },
      );
      return null;
    }
  }
}
