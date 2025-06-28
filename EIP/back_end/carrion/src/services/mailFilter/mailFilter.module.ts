import { Module } from '@nestjs/common';
import { MailFilterService } from './mailFilter.service';
import { JobApplyService } from 'src/jobApply/jobApply.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JobApplyModule } from 'src/jobApply/jobApply.module';
import { UserModule } from 'src/user/user.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [PrismaModule, JobApplyModule, UserModule, NotificationModule],
  providers: [JobApplyService, MailFilterService, PrismaModule],
  exports: [JobApplyService, MailFilterService],
})
export class MailFilterModule {}
