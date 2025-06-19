import {
  Controller,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserStatistics(@Request() req) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User ID not found in request');
    }
    return this.statisticsService.getStatistics(req.user.id);
  }
}
