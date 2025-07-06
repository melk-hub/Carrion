import { Module } from '@nestjs/common';
import { MailFilterService } from './mailFilter.service';
import { JobApplyService } from 'src/jobApply/jobApply.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JobApplyModule } from 'src/jobApply/jobApply.module';
import { UserModule } from 'src/user/user.module';
import { NotificationModule } from 'src/notification/notification.module';
import { EmailPreFilterService } from './prefilter.service';
import { DashboardMailController } from './dashboard.controller';

@Module({
  imports: [PrismaModule, JobApplyModule, UserModule, NotificationModule],
  controllers: [DashboardMailController],
  providers: [JobApplyService, MailFilterService, EmailPreFilterService],
  exports: [JobApplyService, MailFilterService, EmailPreFilterService],
})
export class MailFilterModule {}
