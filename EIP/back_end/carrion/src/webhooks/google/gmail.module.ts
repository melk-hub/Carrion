import { Module } from '@nestjs/common';
import { GmailController } from './gmail.controller';
import { GmailService } from './gmail.service';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleStrategy } from 'src/auth/strategies/google.strategy';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from 'src/auth/config/google-oauth.config';

@Module({
  imports: [AuthModule, ConfigModule.forFeature(googleOauthConfig),],
  controllers: [GmailController],
  providers: [GmailService, GoogleStrategy],
})
export class GmailModule {}
