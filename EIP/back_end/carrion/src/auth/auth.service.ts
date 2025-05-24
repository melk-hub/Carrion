import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CurrentUser } from './types/current-user';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

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
      console.error('Token validation error:', error);
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
    const user = await this.userService.findByIdentifier(OAuthUser.email, true);
    if (user) return user;
    return await this.userService.create(OAuthUser);
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
      this.userService.updateHistoryIdOfUser(
        userId,
        response.data['historyId'],
      );
    } catch (error) {
      console.error('Erreur lors de la création du webhook Gmail:', error);
      throw new Error('Failed to set up Gmail webhook');
    }
  }

  async createOutlookWebhook(accessToken: string, userId: string) {

  const url = 'https://graph.microsoft.com/v1.0/subscriptions';
  const headers = { Authorization: `Bearer ${accessToken}` };

  const response = await fetch(url, { headers });
  const data = await response.json();

  const existing = data.value.find(sub =>
    sub.resource === "me/mailFolders('inbox')/messages" &&
    sub.notificationUrl === `${process.env.BACK}/webhook/outlook`
  );

  if (existing) {
    console.log('Subscription already exists:', existing.id);
    return;
  }

    const expiration = new Date(Date.now() + 60 * 60 * 1000 * 3);
    const expirationDateTime = expiration.toISOString();

    const body = {
      changeType: 'created',
      notificationUrl: `${process.env.BACK}/webhook/outlook`,
      resource: "me/mailFolders('inbox')/messages",
      expirationDateTime,
      clientState: 'mySecretValidationToken',
    };

    try {
      const response$ = this.httpService.post(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const response = await firstValueFrom(response$);
      this.userService.updateHistoryIdOfUser(
        userId,
        response.data['id'],
      );
      console.log('Outlook mail subscription created');
    } catch (error: any) {
      const msg = error?.response?.data || error?.message || 'Unknown error';
      console.error('Error creating Outlook subscription:', msg);
      throw new HttpException('Failed to create Outlook subscription', HttpStatus.BAD_REQUEST);
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
}
