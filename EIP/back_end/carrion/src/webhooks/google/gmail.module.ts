import { Module } from '@nestjs/common';
import { GmailController } from './gmail.controller';
import { GmailService } from './gmail.service';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleStrategy } from 'src/auth/strategies/google.strategy';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from 'src/auth/config/google-oauth.config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forFeature(googleOauthConfig),
    PrismaModule,
    UserModule,
  ],
  controllers: [GmailController],
  providers: [GmailService, GoogleStrategy],
})
export class GmailModule {}
