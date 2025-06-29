import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async getWeeklyGoal(userId: string) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId: userId },
      select: { weeklyGoal: true },
    });

    if (!settings) {
      const newSettings = await this.prisma.settings.create({
        data: {
          userId: userId,
          weeklyGoal: 10,
          monthlyGoal: 30,
        },
        select: { weeklyGoal: true },
      });
      return newSettings;
    }

    return settings;
  }

  async getGoalSettings(userId: string) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId: userId },
      select: { weeklyGoal: true, monthlyGoal: true },
    });

    if (!settings) {
      const newSettings = await this.prisma.settings.create({
        data: {
          userId: userId,
          weeklyGoal: 10,
          monthlyGoal: 30,
        },
        select: { weeklyGoal: true, monthlyGoal: true },
      });
      return newSettings;
    }

    return settings;
  }

  async updateWeeklyGoal(userId: string, weeklyGoal: number) {
    if (weeklyGoal < 1 || weeklyGoal > 100) {
      throw new BadRequestException('Weekly goal must be between 1 and 100');
    }

    try {
      const existingSettings = await this.prisma.settings.findUnique({
        where: { userId: userId },
      });

      const oldWeeklyGoal = existingSettings?.weeklyGoal || 10;

      if (!existingSettings) {
        // Créer les paramètres si ils n'existent pas
        const result = await this.prisma.settings.create({
          data: {
            userId: userId,
            weeklyGoal,
            monthlyGoal: 30,
          },
          select: { weeklyGoal: true },
        });

        // Notification pour création initiale
        await this.notificationService.createNotification({
          userId: userId,
          titleKey: 'notifications.titles.goal.weekly',
          messageKey: 'notifications.goal.weekly.created',
          type: 'INFO',
          variables: {
            weeklyGoal,
          },
        });

        return result;
      }

      // Mettre à jour l'objectif existant
      const result = await this.prisma.settings.update({
        where: { userId: userId },
        data: { weeklyGoal },
        select: { weeklyGoal: true },
      });

      // Notification pour modification si la valeur a changé
      if (oldWeeklyGoal !== weeklyGoal) {
        await this.notificationService.createNotification({
          userId: userId,
          titleKey: 'notifications.titles.goal.weekly.updated',
          messageKey: 'notifications.goal.weekly.updated',
          type: 'INFO',
          variables: {
            oldGoal: oldWeeklyGoal,
            newGoal: weeklyGoal,
          },
        });
      }

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to update weekly goal: ${error.message}`,
      );
    }
  }

  async updateGoalSettings(
    userId: string,
    weeklyGoal?: number,
    monthlyGoal?: number,
  ) {
    if (weeklyGoal !== undefined && (weeklyGoal < 1 || weeklyGoal > 100)) {
      throw new BadRequestException('Weekly goal must be between 1 and 100');
    }

    if (monthlyGoal !== undefined && (monthlyGoal < 1 || monthlyGoal > 500)) {
      throw new BadRequestException('Monthly goal must be between 1 and 500');
    }

    try {
      const existingSettings = await this.prisma.settings.findUnique({
        where: { userId: userId },
      });

      const oldWeeklyGoal = existingSettings?.weeklyGoal || 10;
      const oldMonthlyGoal = existingSettings?.monthlyGoal || 30;

      const updateData: any = {};
      if (weeklyGoal !== undefined) updateData.weeklyGoal = weeklyGoal;
      if (monthlyGoal !== undefined) updateData.monthlyGoal = monthlyGoal;

      if (!existingSettings) {
        const result = await this.prisma.settings.create({
          data: {
            userId: userId,
            weeklyGoal: weeklyGoal || 10,
            monthlyGoal: monthlyGoal || 30,
          },
          select: { weeklyGoal: true, monthlyGoal: true },
        });

        // Notifications pour création initiale
        if (weeklyGoal !== undefined) {
          await this.notificationService.createNotification({
            userId: userId,
            titleKey: 'notifications.titles.goal.weekly',
            messageKey: 'notifications.goal.weekly.created',
            type: 'INFO',
            variables: {
              weeklyGoal,
            },
          });
        }

        if (monthlyGoal !== undefined) {
          await this.notificationService.createNotification({
            userId: userId,
            titleKey: 'notifications.titles.goal.monthly',
            messageKey: 'notifications.goal.monthly.created',
            type: 'INFO',
            variables: {
              monthlyGoal,
            },
          });
        }

        return result;
      }

      const result = await this.prisma.settings.update({
        where: { userId: userId },
        data: updateData,
        select: { weeklyGoal: true, monthlyGoal: true },
      });

      // Notifications pour modifications si les valeurs ont changé
      if (weeklyGoal !== undefined && oldWeeklyGoal !== weeklyGoal) {
        await this.notificationService.createNotification({
          userId: userId,
          titleKey: 'notifications.titles.goal.weekly.updated',
          messageKey: 'notifications.goal.weekly.updated',
          type: 'INFO',
          variables: {
            oldGoal: oldWeeklyGoal,
            newGoal: weeklyGoal,
          },
        });
      }

      if (monthlyGoal !== undefined && oldMonthlyGoal !== monthlyGoal) {
        await this.notificationService.createNotification({
          userId: userId,
          titleKey: 'notifications.titles.goal.monthly.updated',
          messageKey: 'notifications.goal.monthly.updated',
          type: 'INFO',
          variables: {
            oldGoal: oldMonthlyGoal,
            newGoal: monthlyGoal,
          },
        });
      }

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to update goal settings: ${error.message}`,
      );
    }
  }

  async getUserSettings(userId: string) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId: userId },
    });

    if (!settings) {
      return await this.prisma.settings.create({
        data: {
          userId: userId,
          weeklyGoal: 10,
          monthlyGoal: 30,
        },
      });
    }

    return settings;
  }

  async createOrUpdateSettings(userId: string, data: any) {
    try {
      const existingSettings = await this.prisma.settings.findUnique({
        where: { userId: userId },
      });

      if (!existingSettings) {
        return await this.prisma.settings.create({
          data: {
            UserId: userId,
            ...data,
          },
        });
      }

      return await this.prisma.settings.update({
        where: { userId: userId },
        data,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to update settings: ${error.message}`,
      );
    }
  }
}
