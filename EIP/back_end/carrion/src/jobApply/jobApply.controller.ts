import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobApplyService } from './jobApply.service';
import { JobApplyDto } from './dto/jobApply.dto';

@ApiTags('jobApply')
@Controller('job-applies')
export class JobApplyController {
  constructor(private readonly jobApplyService: JobApplyService) {}

  @Get('jobApply')
  @ApiOperation({ summary: 'Get jobApply information' })
  @ApiResponse({ status: 201, description: 'Get successfully jobApply' })
  @ApiResponse({ status: 400, description: "Can't get jobApply error" })
  async getAllJobApplies(): Promise<JobApplyDto[]> {
    return this.jobApplyService.getAllJobApplies();
  }
}
