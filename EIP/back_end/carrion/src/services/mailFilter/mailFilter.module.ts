import { Module } from '@nestjs/common';
import { MailFilterService } from './mailFilter.service';
import { JobApplyService } from '@/jobApply/jobApply.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { JobApplyModule } from '@/jobApply/jobApply.module';
import { UserModule } from '@/user/user.module';
import { NotificationModule } from '@/notification/notification.module';
import { EmailPreFilterService } from './prefilter.service';
import { DashboardMailController } from './dashboard.controller';

@Module({
  imports: [PrismaModule, JobApplyModule, UserModule, NotificationModule],
  controllers: [DashboardMailController],
  providers: [JobApplyService, MailFilterService, EmailPreFilterService],
  exports: [JobApplyService, MailFilterService, EmailPreFilterService],
})
export class MailFilterModule {}
