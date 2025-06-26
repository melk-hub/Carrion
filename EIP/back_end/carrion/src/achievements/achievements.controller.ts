import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  async getUserAchievements(@Request() req) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Get('all')
  async getAllAchievements() {
    return this.achievementsService.getAllAchievements();
  }

  @Post('check')
  async checkAchievements(@Request() req) {
    // Pour l'instant, on passe des données vides - cela devrait être connecté aux vraies stats
    const mockStatsData = {
      applicationsCount: 0,
      interviewsCount: 0,
      offersCount: 0,
      consecutiveDays: 0,
      interviewRate: 0,
      responseRate: 0,
    };
    return this.achievementsService.checkAndUnlockAchievements(
      req.user.id,
      mockStatsData,
    );
  }

  @Get('stats')
  async getUserStats(@Request() req) {
    return this.achievementsService.getUserStats(req.user.id);
  }
} 