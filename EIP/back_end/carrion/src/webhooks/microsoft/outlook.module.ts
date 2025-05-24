import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OutlookController } from './outlook.controller';
import { OutlookService } from './outlook.service';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import microsoftOauthConfig from 'src/auth/config/microsoft-oauth.config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { MailFilterModule } from 'src/services/mailFilter/mailFilter.module';
import { MicrosoftStrategy } from 'src/auth/strategies/microsoft.strategy';
import { MailFilterService } from 'src/services/mailFilter/mailFilter.service';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    ConfigModule.forFeature(microsoftOauthConfig),
    PrismaModule,
    UserModule,
    MailFilterModule
  ],
  controllers: [OutlookController],
  providers: [OutlookService, MicrosoftStrategy, MailFilterService],
})
export class OutlookModule {}
