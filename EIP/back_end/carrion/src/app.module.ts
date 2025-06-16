import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { JobApplyModule } from './jobApply/jobApply.module';
import { GmailModule } from './webhooks/google/gmail.module';
import { MailFilterModule } from './services/mailFilter/mailFilter.module';
import { MailFilterController } from './services/mailFilter/mailFilter.controller';
import { MailFilterService } from './services/mailFilter/mailFilter.service';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './utils/utils.module';
import { OutlookModule } from './webhooks/microsoft/outlook.module';
import { S3Module } from './aws/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    JobApplyModule,
    GmailModule,
    OutlookModule,
    MailFilterModule,
    UsersModule,
    UtilsModule,
    S3Module,
  ],
  controllers: [AppController, MailFilterController],
  providers: [AppService, MailFilterService],
})
export class AppModule {}
