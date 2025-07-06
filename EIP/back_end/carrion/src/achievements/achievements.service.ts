import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async getAllAchievements() {
    return this.prisma.carrionAchievement.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        type: true,
        threshold: true,
        condition: true,
        points: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: [{ category: 'asc' }, { points: 'asc' }],
    });
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            type: true,
            threshold: true,
            condition: true,
            points: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  async checkAndUnlockAchievements(userId: string, statsData: any) {
    const userAchievements = await this.getUserAchievements(userId);
    const unlockedAchievementIds = userAchievements.map(
      (ua) => ua.achievementId,
    );

    const availableAchievements = await this.prisma.carrionAchievement.findMany(
      {
        where: {
          isActive: true,
          id: { notIn: unlockedAchievementIds },
        },
      },
    );

    const newlyUnlocked = [];

    for (const achievement of availableAchievements) {
      if (this.checkAchievementCondition(achievement, statsData)) {
        const userAchievement = await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            unlockedAt: new Date(),
          },
          include: {
            achievement: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                type: true,
                threshold: true,
                condition: true,
                points: true,
                isActive: true,
                createdAt: true,
              },
            },
          },
        });

        newlyUnlocked.push(userAchievement);
      }
    }

    return newlyUnlocked;
  }

  private checkAchievementCondition(achievement: any, statsData: any): boolean {
    // Logique simple pour vérifier les conditions
    switch (achievement.type) {
      case 'CUMULATIVE':
        if (achievement.condition.includes('applications_count')) {
          return statsData.applicationsCount >= achievement.threshold;
        }
        if (achievement.condition.includes('interviews_count')) {
          return statsData.interviewsCount >= achievement.threshold;
        }
        if (achievement.condition.includes('offers_count')) {
          return statsData.offersCount >= achievement.threshold;
        }
        break;

      case 'CONSECUTIVE':
        if (achievement.condition.includes('consecutive_days')) {
          return statsData.consecutiveDays >= achievement.threshold;
        }
        break;

      case 'PERCENTAGE':
        if (achievement.condition.includes('interview_rate')) {
          return statsData.interviewRate >= achievement.threshold;
        }
        if (achievement.condition.includes('response_rate')) {
          return statsData.responseRate >= achievement.threshold;
        }
        break;

      case 'ACTION':
        if (achievement.condition.includes('registration')) {
          return true; // L'utilisateur existe, donc il est inscrit
        }
        break;

      default:
        return false;
    }

    return false;
  }

  async getUserStats(userId: string) {
    const achievements = await this.getUserAchievements(userId);
    const totalPoints = achievements.reduce(
      (sum, ua) => sum + ua.achievement.points,
      0,
    );

    return {
      totalAchievements: achievements.length,
      totalPoints,
      achievements: achievements.map((ua) => ua.achievement),
    };
  }
}
