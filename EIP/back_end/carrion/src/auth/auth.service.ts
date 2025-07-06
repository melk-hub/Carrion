import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
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
import { User, Token } from '@prisma/client';
import * as crypto from 'crypto';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

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

  initializeWebhookMonitoring(): void {
    this.logger.log('CRON job for webhook renewal is scheduled.');
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'webhook_renewal' })
  async handleWebhookRenewalCron() {
    this.logger.log(
      'Running daily webhook renewal CRON job...',
      LogCategory.CRON,
    );
    const thirtySixHoursFromNow = new Date(Date.now() + 36 * 60 * 60 * 1000);
    const expiringTokens = await this.prisma.token.findMany({
      where: { webhookExpiry: { lte: thirtySixHoursFromNow } },
    });

    if (expiringTokens.length === 0) {
      this.logger.log(
        'CRON job complete. No webhooks needed renewal.',
        LogCategory.CRON,
      );
      return;
    }

    this.logger.log(
      `CRON job found ${expiringTokens.length} webhook(s) to renew.`,
    );
    for (const token of expiringTokens) {
      try {
        const validAccessToken = await this.getValidToken(
          token.userId,
          token.name as any,
        );
        if (validAccessToken) {
          if (token.name === 'Google_oauth2') {
            await this.createGmailWebhook(validAccessToken, token.userId);
          } else if (token.name === 'Microsoft_oauth2' && token.externalId) {
            await this.renewOutlookWebhook(
              token.userId,
              token.externalId,
              validAccessToken,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `Error during CRON renewal for user ${token.userId}`,
          error.stack,
          LogCategory.CRON,
        );
      }
    }
  }

  async checkAndRenewWebhook(
    tokenRecord: Token,
    accessToken: string,
  ): Promise<void> {
    const isWebhookExpiringSoon =
      !tokenRecord.webhookExpiry ||
      new Date(tokenRecord.webhookExpiry) <
        new Date(Date.now() + 36 * 60 * 60 * 1000);
    if (!isWebhookExpiringSoon) return;

    this.logger.log(
      `Proactively renewing webhook for ${tokenRecord.name} user ${tokenRecord.userId}.`,
      LogCategory.WEBHOOK,
    );
    try {
      if (tokenRecord.name === 'Google_oauth2')
        await this.createGmailWebhook(accessToken, tokenRecord.userId);
      else if (tokenRecord.name === 'Microsoft_oauth2') {
        if (tokenRecord.externalId)
          await this.renewOutlookWebhook(
            tokenRecord.userId,
            tokenRecord.externalId,
            accessToken,
          );
        else await this.createOutlookWebhook(accessToken, tokenRecord.userId);
      }
    } catch (error) {
      this.logger.error(
        `On-demand webhook renewal failed for user ${tokenRecord.userId}`,
        error.stack,
        LogCategory.WEBHOOK,
      );
    }
  }

  private async updateTokenWebhookData(
    userId: string,
    provider: 'Google_oauth2' | 'Microsoft_oauth2',
    data: { externalId?: string; webhookExpiry?: Date },
  ) {
    await this.prisma.token.updateMany({
      where: { userId, name: provider },
      data: data,
    });
  }

  async updateGoogleTokenWithHistoryId(
    userId: string,
    historyId: string,
  ): Promise<void> {
    await this.updateTokenWebhookData(userId, 'Google_oauth2', {
      externalId: historyId,
    });
  }

  async updateMicrosoftTokenWithSubscription(
    userId: string,
    subscriptionId: string,
  ): Promise<void> {
    await this.updateTokenWebhookData(userId, 'Microsoft_oauth2', {
      externalId: subscriptionId,
    });
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
      if (loggedInUserId && existingTokenLink.userId !== loggedInUserId)
        throw new ConflictException(
          `This ${providerNameDisplay} account is already linked to another user.`,
        );
      return existingTokenLink.user;
    }
    if (loggedInUserId) {
      const userWithOauthEmail = await this.userService.findByIdentifier(
        oauthProfile.email,
        true,
      );
      if (userWithOauthEmail && userWithOauthEmail.id !== loggedInUserId)
        throw new ConflictException(
          `The email address ${oauthProfile.email} is already used by another account.`,
        );
      const user = await this.prisma.user.findUnique({
        where: { id: loggedInUserId },
      });
      if (!user) throw new UnauthorizedException('Logged in user not found.');
      return user;
    }
    const userWithOauthEmail = await this.userService.findByIdentifier(
      oauthProfile.email,
      true,
    );
    if (userWithOauthEmail) return userWithOauthEmail;
    const { firstName, lastName, ...coreUserData } = oauthProfile;
    const newUser = await this.userService.create({
      ...coreUserData,
      password: '',
    });
    if (firstName || lastName)
      await this.prisma.userProfile.create({
        data: { userId: newUser.id, firstName, lastName },
      });
    return newUser;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const passwordResetExpires = new Date(Date.now() + 3600000);
    await this.prisma.user.update({
      where: { email },
      data: { passwordResetToken, passwordResetExpires },
    });
    try {
      const resetUrl = `${process.env.FRONT}/reset-password/${resetToken}`;
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      apiInstance.setApiKey(
        SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY,
      );
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = 'Your Password Reset Request';
      sendSmtpEmail.htmlContent = `<p>Click here to reset: <a href="${resetUrl}">Reset Password</a></p>`;
      sendSmtpEmail.sender = {
        name: 'Carrion',
        email: 'your-validated-sender@example.com',
      };
      sendSmtpEmail.to = [{ email: user.email, name: user.username }];
      await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      await this.prisma.user.update({
        where: { email },
        data: { passwordResetToken: null, passwordResetExpires: null },
      });
      throw new Error('Could not send reset password email.');
    }
  }

  async resetPassword(
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: hashedToken },
    });
    if (!user || user.passwordResetExpires < new Date())
      throw new UnauthorizedException('Invalid or expired token.');
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        hashedRefreshToken: null,
      },
    });
  }

  async saveTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    days: number,
    name: 'Google_oauth2' | 'Microsoft_oauth2',
    providerId: string,
    userEmail: string,
  ): Promise<void> {
    const expirationTime = this.calculateTokenExpiration(days);
    const refreshTokenExpires =
      name === 'Microsoft_oauth2'
        ? this.calculateTokenExpiration(90)
        : new Date('9999-12-31T23:59:59Z');
    await this.prisma.token.upsert({
      where: { name_providerId: { name, providerId } },
      update: {
        accessToken,
        refreshToken,
        userEmail,
        accessTokenValidity: expirationTime,
        tokenTimeValidity: refreshTokenExpires,
      },
      create: {
        userId,
        name,
        providerId,
        accessToken,
        refreshToken,
        userEmail,
        accessTokenValidity: expirationTime,
        tokenTimeValidity: refreshTokenExpires,
      },
    });
  }

  async validateUser(
    identifier: string,
    password: string,
    isEmail: boolean,
  ): Promise<any> {
    const user = await this.userService.findByIdentifier(identifier, isEmail);
    if (user && (await bcrypt.compare(password, user.password))) return user;
    return null;
  }

  async login(
    userId: string,
    rememberMe = false,
  ): Promise<{ id: string; accessToken: string; refreshToken: string }> {
    const tokens = await this.generateTokens(userId, rememberMe);
    await this.userService.updateHashedRefreshToken(
      userId,
      await argon2.hash(tokens.refreshToken),
    );
    return { id: userId, ...tokens };
  }

  async generateTokens(
    userId: string,
    rememberMe = false,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId };
    const accessTokenExpiresIn = rememberMe ? '15d' : '1d';
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: accessTokenExpiresIn,
      }),
      refreshToken: await this.jwtService.signAsync(
        payload,
        this.refreshTokenConfig,
      ),
    };
  }

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    if (await this.userService.findByIdentifier(createUserDto.email, true))
      throw new ConflictException('A user with this email already exists.');
    if (await this.userService.findByIdentifier(createUserDto.username, false))
      throw new ConflictException('A user with this username already exists.');
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.login(user.id);
  }

  async refreshTokens(refreshToken: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.refreshTokenConfig.secret,
      });
      if (!decoded?.sub) return null;
      const user = await this.userService.findOne(decoded.sub);
      if (
        !user ||
        !user.hashedRefreshToken ||
        !(await argon2.verify(user.hashedRefreshToken, refreshToken))
      )
        return null;
      const tokens = await this.generateTokens(user.id);
      await this.userService.updateHashedRefreshToken(
        user.id,
        await argon2.hash(tokens.refreshToken),
      );
      return { ...tokens, userId: user.id };
    } catch {
      return null;
    }
  }

  async signOut(userId: string): Promise<void> {
    await this.userService.updateHashedRefreshToken(userId, null);
  }

  async validateCookie(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      if (!decoded || !decoded.sub) return null;
      return await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true },
      });
    } catch {
      return null;
    }
  }

  async validateJwtUser(userId: string): Promise<any> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    return { id: user.id, role: user.role as Role };
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<any> {
    const user = await this.userService.findOne(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('Access Denied');
    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');
    return { id: user.id, email: user.email, role: user.role };
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
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .toPromise();
      const expiration = new Date(parseInt(response.data.expiration, 10));
      await this.updateTokenWebhookData(userId, 'Google_oauth2', {
        webhookExpiry: expiration,
      });
    } catch (error) {
      if (error.response?.status >= 400 && error.response?.status < 500)
        await this.handleTokenRevocation(userId, 'Google_oauth2');
      throw error;
    }
  }

  async createOutlookWebhook(
    accessToken: string,
    userId: string,
  ): Promise<string | void> {
    const webhookUrl = `${process.env.BACK}/webhook/outlook`;
    const expirationDateTime = new Date(Date.now() + 4230 * 60 * 1000);
    try {
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
          { headers: { Authorization: `Bearer ${accessToken}` } },
        ),
      );
      const subscriptionId = response.data.id;
      const actualExpiration = new Date(response.data.expirationDateTime);
      await this.updateTokenWebhookData(userId, 'Microsoft_oauth2', {
        externalId: subscriptionId,
        webhookExpiry: actualExpiration,
      });
      return subscriptionId;
    } catch (error) {
      if (error.response?.status >= 400 && error.response?.status < 500)
        await this.handleTokenRevocation(userId, 'Microsoft_oauth2');
      throw error;
    }
  }

  async renewOutlookWebhook(
    userId: string,
    subscriptionId: string,
    accessToken: string,
  ): Promise<void> {
    const newExpiration = new Date(Date.now() + 4230 * 60 * 1000);
    try {
      await firstValueFrom(
        this.httpService.patch(
          `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`,
          { expirationDateTime: newExpiration.toISOString() },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        ),
      );
      await this.updateTokenWebhookData(userId, 'Microsoft_oauth2', {
        webhookExpiry: newExpiration,
      });
    } catch {
      await this.createOutlookWebhook(accessToken, userId);
    }
  }

  private async handleTokenRevocation(
    userId: string,
    provider: 'Google_oauth2' | 'Microsoft_oauth2',
  ) {
    await this.prisma.token.deleteMany({ where: { userId, name: provider } });
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
      token.accessTokenValidity &&
      new Date(token.accessTokenValidity) > new Date(Date.now() + 5 * 60 * 1000)
    ) {
      return token.accessToken;
    }
    try {
      const refreshed =
        tokenName === 'Microsoft_oauth2'
          ? await this.refreshMicrosoftToken(userId)
          : await this.refreshGoogleToken(userId);
      return refreshed?.accessToken || null;
    } catch {
      await this.handleTokenRevocation(userId, tokenName);
      return null;
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
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      refresh_token: token.refreshToken,
      grant_type: 'refresh_token',
      scope: 'openid profile offline_access User.Read Mail.Read',
    });
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          params,
        ),
      );
      const { access_token, refresh_token } = response.data;
      await this.saveTokens(
        userId,
        access_token,
        refresh_token || token.refreshToken,
        25 / (60 * 24),
        'Microsoft_oauth2',
        token.providerId,
        token.userEmail,
      );
      return { accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      await this.handleTokenRevocation(userId, 'Microsoft_oauth2');
      throw error;
    }
  }

  async refreshGoogleToken(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken?: string } | null> {
    const token = await this.prisma.token.findFirst({
      where: { userId, name: 'Google_oauth2' },
    });
    if (!token?.refreshToken) return null;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: token.refreshToken,
      grant_type: 'refresh_token',
    });
    try {
      const response = await firstValueFrom(
        this.httpService.post('https://oauth2.googleapis.com/token', params),
      );
      const { access_token, refresh_token } = response.data;
      await this.saveTokens(
        userId,
        access_token,
        refresh_token || token.refreshToken,
        25 / (60 * 24),
        'Google_oauth2',
        token.providerId,
        token.userEmail,
      );
      return { accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      await this.handleTokenRevocation(userId, 'Google_oauth2');
      throw error;
    }
  }
}
