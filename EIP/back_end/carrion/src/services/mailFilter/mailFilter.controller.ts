import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { MailFilterService } from './mailFilter.service';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import { ExtractInfoDto } from './dto/mailFilter.dto';
import { JobApplyDto } from 'src/jobApply/dto/jobApply.dto';

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
}
