import { Module } from '@nestjs/common';
import { GmailController } from './gmail.controller';
import { GmailService } from './gmail.service';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from '@/auth/config/google-oauth.config';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/user/user.module';
import { MailFilterModule } from '@/services/mailFilter/mailFilter.module';

import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '@/auth/config/jwt.config';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forFeature(googleOauthConfig),
    PrismaModule,
    UserModule,
    MailFilterModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [GmailController],
  providers: [GmailService],
})
export class GmailModule {}
