import { Module } from '@nestjs/common';
import { JobApplyService } from './jobApply.service';
import { JobApplyController } from './jobApply.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [JobApplyController],
  providers: [JobApplyService],
})
export class JobApplyModule {}
