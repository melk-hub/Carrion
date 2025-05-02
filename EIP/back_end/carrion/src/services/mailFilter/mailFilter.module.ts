import { Module } from '@nestjs/common';
import { MailFilterService } from './mailFilter.service';
import { JobApplyService } from 'src/jobApply/jobApply.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JobApplyModule } from 'src/jobApply/jobApply.module';

@Module({
  imports: [PrismaModule, JobApplyModule],
  providers: [JobApplyService, MailFilterService, PrismaModule],
  exports: [JobApplyService],
})
export class MailFilterModule {}
