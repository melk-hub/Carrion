import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OutlookController } from './outlook.controller';
import { OutlookService } from './outlook.service';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import microsoftOauthConfig from '@/auth/config/microsoft-oauth.config';
import refreshJwtConfig from '@/auth/config/refresh-jwt.config';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/user/user.module';
import { MailFilterModule } from '@/services/mailFilter/mailFilter.module';
import { MicrosoftStrategy } from '@/auth/strategies/microsoft.strategy';
import { MailFilterService } from '@/services/mailFilter/mailFilter.service';
import { CustomLoggingService } from '@/common/services/logging.service';
import { UserService } from '@/user/user.service';
import { AuthService } from '@/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { S3Module } from '@/aws/s3.module';

@Module({
  imports: [
    HttpModule,
    JwtModule,
    AuthModule,
    ConfigModule.forFeature(microsoftOauthConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    PrismaModule,
    UserModule,
    MailFilterModule,
    S3Module,
  ],
  controllers: [OutlookController],
  providers: [
    OutlookService,
    CustomLoggingService,
    MailFilterService,
    UserService,
    AuthService,
    MicrosoftStrategy,
  ],
})
export class OutlookModule {}
