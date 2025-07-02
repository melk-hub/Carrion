import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OutlookController } from './outlook.controller';
import { OutlookService } from './outlook.service';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import microsoftOauthConfig from 'src/auth/config/microsoft-oauth.config';
import refreshJwtConfig from 'src/auth/config/refresh-jwt.config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { MailFilterModule } from 'src/services/mailFilter/mailFilter.module';
import { MicrosoftStrategy } from 'src/auth/strategies/microsoft.strategy';
import { MailFilterService } from 'src/services/mailFilter/mailFilter.service';
import { CustomLoggingService } from 'src/common/services/logging.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { S3Module } from 'src/aws/s3.module';

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
