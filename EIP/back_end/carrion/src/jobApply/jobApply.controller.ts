import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
  Delete,
  Patch,
  Put,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { JobApplyService } from './jobApply.service';
import {
  CreateJobApplyDto,
  JobApplyDto,
  UpdateJobApplyDto,
} from './dto/jobApply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';

@ApiTags('jobApply')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiCookieAuth('access_token')
@Controller('job_applies')
export class JobApplyController {
  constructor(private readonly jobApplyService: JobApplyService) {}

  @Get('jobApply')
  @ApiOperation({ summary: 'Get jobApply information' })
  @ApiResponse({ status: 200, description: 'Get successfully get jobApply' })
  @ApiResponse({ status: 400, description: "Can't get jobApply error" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllJobApplies(@Request() req): Promise<JobApplyDto[]> {
    const userId = req.user.id;
    return this.jobApplyService.getAllJobApplies(userId);
  }

  @Post('jobApply')
  @ApiOperation({ summary: 'Add new job application' })
  @ApiResponse({
    status: 200,
    description: 'Job application added successfully',
  })
  @ApiResponse({ status: 400, description: "Can't add job application" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addNewJobApply(
    @Request() req,
    @Body() createJobApplyDto: CreateJobApplyDto,
  ): Promise<JobApplyDto> {
    const userId = req.user.id;
    return this.jobApplyService.createJobApply(userId, createJobApplyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job application' })
  @ApiResponse({
    status: 200,
    description: 'Job application deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  async deleteJob(@Param('id') jobApplyId: string, @Request() req) {
    return this.jobApplyService.deleteJobApply(jobApplyId, req.user.id);
  }

  @Delete(':id/archived')
  @ApiOperation({ summary: 'Delete a job application' })
  @ApiResponse({
    status: 200,
    description: 'Job application deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  async deleteArchivedJob(@Param('id') jobApplyId: string, @Request() req) {
    return this.jobApplyService.deleteArchivedJobApply(jobApplyId, req.user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update job application (PUT method)' })
  @ApiResponse({
    status: 200,
    description: 'Job application updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  async updateJobApplicationPut(
    @Param('id') jobApplyId: string,
    @Body() updateJobApplyDto: UpdateJobApplyDto,
    @Request() req,
  ) {
    return this.jobApplyService.updateJobApplyByData(
      jobApplyId,
      req.user.id,
      updateJobApplyDto,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update job application status' })
  @ApiResponse({
    status: 200,
    description: 'Job application status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  async updateJobStatus(
    @Param('id') jobApplyId: string,
    @Body() updateJobApplyDto: UpdateJobApplyDto,
    @Request() req,
  ) {
    return this.jobApplyService.updateJobApplyByData(
      jobApplyId,
      req.user.id,
      updateJobApplyDto,
    );
  }

  @Put(':id/archived-status')
  @ApiOperation({ summary: 'Update job application status' })
  @ApiResponse({
    status: 200,
    description: 'Job application status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  async updateArchivedJobStatus(
    @Param('id') archivedJobApplyId: string,
    @Body() updateJobApplyDto: UpdateJobApplyDto,
    @Request() req,
  ) {
    return this.jobApplyService.updateArchivedJobApplyByData(
      archivedJobApplyId,
      req.user.id,
      updateJobApplyDto,
    );
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a job application' })
  @ApiResponse({
    status: 200,
    description: 'Successfully archived the job application',
  })
  @ApiResponse({
    status: 400,
    description: "Can't archive job application error",
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async archiveJobApplication(@Param('id') jobApplyId: string, @Request() req) {
    const userId = req.user.id;
    return this.jobApplyService.archiveJobApplication(jobApplyId, userId);
  }

  @Post(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a job application' })
  @ApiResponse({
    status: 200,
    description: 'Successfully unarchived the job application',
  })
  @ApiResponse({
    status: 400,
    description: "Can't unarchive job application error",
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async unarchiveJobApplication(
    @Param('id') archivedJobId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.jobApplyService.unarchiveJobApplication(archivedJobId, userId);
  }

  @Get('get_archivedJobApply')
  @ApiOperation({ summary: 'Get archivedJobApply information' })
  @ApiResponse({
    status: 200,
    description: 'Successfully get archivedJobApply',
  })
  @ApiResponse({ status: 400, description: "Can't get archivedJobApply error" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllArchivedJobApplies(@Request() req) {
    const userId = req.user.id;
    return this.jobApplyService.getAllArchivedJobApplies(userId);
  }
}
