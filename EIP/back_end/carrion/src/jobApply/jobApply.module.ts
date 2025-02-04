import { Module } from '@nestjs/common';
import { JobApplyService } from './jobApply.service';
import { JobApplyController } from './jobApply.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobApplyController],
  providers: [JobApplyService],
})
export class JobApplyModule {}
