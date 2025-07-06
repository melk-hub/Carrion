import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';
import { UpdateGoalDto } from './dto/update-goal.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('goal')
  @ApiOperation({ summary: 'Get user goal settings' })
  @ApiResponse({
    status: 200,
    description: 'Goal settings retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async getGoalSettings(@Request() req) {
    return this.settingsService.getGoalSettings(req.user.id);
  }

  @Get('goal/weekly')
  @ApiOperation({ summary: 'Get user weekly goal' })
  @ApiResponse({
    status: 200,
    description: 'Weekly goal retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async getWeeklyGoal(@Request() req) {
    return this.settingsService.getWeeklyGoal(req.user.id);
  }

  @Put('goal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user goal settings' })
  @ApiResponse({
    status: 200,
    description: 'Goal settings updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid goal value' })
  async updateGoalSettings(
    @Request() req,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.settingsService.updateGoalSettings(
      req.user.id,
      updateGoalDto.weeklyGoal,
      updateGoalDto.monthlyGoal,
    );
  }

  @Put('goal/weekly')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user weekly goal' })
  @ApiResponse({ status: 200, description: 'Weekly goal updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid goal value' })
  async updateWeeklyGoal(@Request() req, @Body() updateGoalDto: UpdateGoalDto) {
    return this.settingsService.updateWeeklyGoal(
      req.user.id,
      updateGoalDto.weeklyGoal,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all user settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getUserSettings(@Request() req) {
    return this.settingsService.getUserSettings(req.user.id);
  }
}
