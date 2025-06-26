import { Module } from '@nestjs/common';
import { JobApplyService } from './jobApply.service';
import { JobApplyController } from './jobApply.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [JobApplyController],
  providers: [JobApplyService],
})
export class JobApplyModule {}
