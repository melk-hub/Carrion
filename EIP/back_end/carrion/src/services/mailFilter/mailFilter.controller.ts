import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { MailFilterService } from './mailFilter.service';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt/jwt-auth.guard';
import { ExtractInfoDto } from './dto/mailFilter.dto';
import { JobApplyDto } from '@/jobApply/dto/jobApply.dto';

@ApiTags('mailFilter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiCookieAuth('access_token')
@Controller('mailFilter')
export class MailFilterController {
  constructor(private readonly mailFilterService: MailFilterService) {}

  @Post('extract-information')
  @ApiOperation({
    summary: 'Extract mail information and create job application',
  })
  @ApiResponse({
    status: 201,
    description:
      'Information extracted and job application created successfully.',
    type: JobApplyDto,
  })
  @ApiResponse({
    status: 201,
    description:
      'Information extracted and job application created successfully.',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: "Can't extract information or bad request",
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async extractInformation(
    @Req() req: Request,
    @Body() extractInfoDto: ExtractInfoDto,
  ): Promise<string> {
    const userId = req['user'].id;

    if (!userId) {
      throw new UnauthorizedException('User ID not found in token.');
    }

    return this.mailFilterService.processEmailAndCreateJobApplyFromGmail(
      extractInfoDto.text,
      userId,
    );
  }

  @Get('metrics')
  getMetrics() {
    return this.mailFilterService.getPerformanceMetrics();
  }

  @Get('recommendations')
  async getRecommendations() {
    return await this.mailFilterService.getPerformanceRecommendations();
  }

  @Get('health')
  async getHealth() {
    const metrics = this.mailFilterService.getPerformanceMetrics();
    const recommendations =
      await this.mailFilterService.getPerformanceRecommendations();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      concurrencyLimit: await this.mailFilterService.getConcurrentEmailLimit(),
      performance: {
        cacheHitRate: metrics.cacheHitRate,
        errorRate: recommendations.currentPerformance.errorRate,
        avgLatency: recommendations.currentPerformance.avgLatency,
        status: recommendations.currentPerformance.status,
      },
      recommendations: recommendations.recommendations,
    };
  }
}
