import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JobApplyModule } from './jobApply/jobApply.module';

@Module({
  imports: [AuthModule, JobApplyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
