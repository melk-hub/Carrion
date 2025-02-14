import { Module } from '@nestjs/common';
import { GmailController } from './gmail.controller';
import { GmailService } from './gmail.service';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleStrategy } from 'src/auth/strategies/google.strategy';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from 'src/auth/config/google-oauth.config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { MailFilterModule } from 'src/services/mailFilter/mailFilter.module';
import { MailFilterService } from 'src/services/mailFilter/mailFilter.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forFeature(googleOauthConfig),
    PrismaModule,
    UserModule,
    MailFilterModule,
  ],
  controllers: [GmailController],
  providers: [GmailService, GoogleStrategy, MailFilterService],
})
export class GmailModule {}
