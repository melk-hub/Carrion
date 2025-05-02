import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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

@ApiTags('mailFilter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiCookieAuth('access_token')
@Controller('mailFilter')
export class MailFilterController {
  constructor(private readonly mailFilterService: MailFilterService) {}

  @Post('extract-information')
  @ApiOperation({ summary: 'Extract mail information' })
  @ApiResponse({
    status: 200,
    description: 'Extract information successfully',
    type: String,
  })
  @ApiResponse({ status: 400, description: "Can't extract information" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async extractInformation(
    @Body() extractInfoDto: ExtractInfoDto,
  ): Promise<string> {
    return this.mailFilterService.getInformationFromText(
      extractInfoDto.text,
      '',
    );
  }
}
