import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getWeeklyGoal(userId: string) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId: userId },
      select: { weeklyGoal: true },
    });

    if (!settings) {
      // Créer les paramètres par défaut si ils n'existent pas
      const newSettings = await this.prisma.settings.create({
        data: {
          userId: userId,
          weeklyGoal: 10,
          monthlyGoal: 30,
          document: [],
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
      // Créer les paramètres par défaut si ils n'existent pas
      const newSettings = await this.prisma.settings.create({
        data: {
          userId: userId,
          weeklyGoal: 10,
          monthlyGoal: 30,
          document: [],
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
      // Vérifier si les paramètres existent
      const existingSettings = await this.prisma.settings.findUnique({
        where: { userId: userId },
      });

      if (!existingSettings) {
        // Créer les paramètres si ils n'existent pas
        return await this.prisma.settings.create({
          data: {
            userId: userId,
            weeklyGoal,
            monthlyGoal: 30,
            document: [],
          },
          select: { weeklyGoal: true },
        });
      }

      // Mettre à jour l'objectif existant
      return await this.prisma.settings.update({
        where: { userId: userId },
        data: { weeklyGoal },
        select: { weeklyGoal: true },
      });
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
      // Vérifier si les paramètres existent
      const existingSettings = await this.prisma.settings.findUnique({
        where: { userId: userId },
      });

      const updateData: any = {};
      if (weeklyGoal !== undefined) updateData.weeklyGoal = weeklyGoal;
      if (monthlyGoal !== undefined) updateData.monthlyGoal = monthlyGoal;

      if (!existingSettings) {
        // Créer les paramètres si ils n'existent pas
        return await this.prisma.settings.create({
          data: {
            userId: userId,
            weeklyGoal: weeklyGoal || 10,
            monthlyGoal: monthlyGoal || 30,
            document: [],
          },
          select: { weeklyGoal: true, monthlyGoal: true },
        });
      }

      // Mettre à jour les objectifs existants
      return await this.prisma.settings.update({
        where: { userId: userId },
        data: updateData,
        select: { weeklyGoal: true, monthlyGoal: true },
      });
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
      // Créer les paramètres par défaut si ils n'existent pas
      return await this.prisma.settings.create({
        data: {
          userId: userId,
          weeklyGoal: 10,
          monthlyGoal: 30,
          document: [],
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
