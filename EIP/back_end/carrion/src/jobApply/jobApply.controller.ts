import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JobApplyService } from './jobApply.service';
import { JobApplyDto } from './dto/jobApply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';

@ApiTags('jobApply')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('job-applies')
export class JobApplyController {
  constructor(private readonly jobApplyService: JobApplyService) {}

  @Get('jobApply')
  @ApiOperation({ summary: 'Get jobApply information' })
  @ApiResponse({ status: 201, description: 'Get successfully jobApply' })
  @ApiResponse({ status: 400, description: "Can't get jobApply error" })
  async getAllJobApplies(@Request() req): Promise<JobApplyDto[]> {
    const userId = req.user.id;
    return this.jobApplyService.getAllJobApplies(userId);
  }
}
