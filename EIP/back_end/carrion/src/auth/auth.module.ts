import { Module, forwardRef, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import refreshJwtConfig from './config/refresh-jwt.config';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt/jwt-auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import googleOauthConfig from './config/google-oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import microsoftOauthConfig from './config/microsoft-oauth.config';
import { UserModule } from 'src/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { UserProfileModule } from 'src/userProfile/user-profile.module';
import { CustomLoggingService } from 'src/common/services/logging.service';

@Global()
@Module({
  imports: [
    forwardRef(() => UserModule),
    PrismaModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(microsoftOauthConfig),
    HttpModule,
    forwardRef(() => UserProfileModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CustomLoggingService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, CustomLoggingService],
})
export class AuthModule {}
