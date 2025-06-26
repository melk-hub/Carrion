import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, subDays, format } from 'date-fns';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics(userId: string) {
    const now = new Date();

    const sevenDaysAgo = subDays(now, 6);
    const thirtyDaysAgo = subDays(now, 29);

    const [
      totalApplications,
      applicationsToday,
      applicationsLast7Days,
      applicationsLast30Days,
      applicationsGroupedByDate,
      statusDistribution,
      contractDistribution,
      companyDistribution,
      locationDistribution,
      interviewCount,
      lastApplication,
    ] = await Promise.all([
      this.prisma.jobApply.count({ where: { userId: userId } }),
      this.prisma.jobApply.count({
        where: { userId: userId, createdAt: { gte: startOfDay(now) } },
      }),
      this.prisma.jobApply.count({
        where: { userId: userId, createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.jobApply.count({
        where: { userId: userId, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.getApplicationsGroupedByDate(userId),
      this.getGroupedCount(userId, 'status'),
      this.getGroupedCount(userId, 'contractType'),
      this.getGroupedCount(userId, 'company'),
      this.getGroupedCount(userId, 'location'),
      this.prisma.jobApply.count({
        where: { userId: userId, interviewDate: { not: null } },
      }),
      this.prisma.jobApply.findFirst({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const streakData = this.calculateStreaks(applicationsGroupedByDate);
    const milestones = {
      3: totalApplications >= 3,
      5: totalApplications >= 5,
      100: totalApplications >= 100,
      200: totalApplications >= 200,
    };

    const PERSONAL_GOAL = 10;
    const personalGoalAchieved = applicationsLast7Days >= PERSONAL_GOAL;

    return {
      totalApplications,
      applicationsToday,
      applicationsThisWeek: applicationsLast7Days,
      applicationsThisMonth: applicationsLast30Days,
      applicationsPerDay: applicationsGroupedByDate,
      statusDistribution,
      contractTypeDistribution: contractDistribution,
      companyDistribution,
      locationDistribution,
      interviewCount,
      lastApplicationDate: lastApplication?.createdAt ?? null,
      streak: streakData.currentStreak,
      bestStreak: streakData.bestStreak,
      milestones,
      personalGoal: {
        target: PERSONAL_GOAL,
        achieved: personalGoalAchieved,
        current: applicationsLast7Days,
      },
    };
  }

  private async getGroupedCount(
    userId: string,
    field: 'status' | 'contractType' | 'company' | 'location',
  ) {
    const raw = await this.prisma.jobApply.groupBy({
      by: [field],
      where: { userId: userId },
      _count: { _all: true },
    });

    return Object.fromEntries(
      raw.map((item) => [item[field] ?? 'Non renseigné', item._count._all]),
    );
  }

  private async getApplicationsGroupedByDate(userId: string) {
    const from = subDays(new Date(), 30);

    const results = await this.prisma.jobApply.groupBy({
      by: ['createdAt'],
      where: {
        userId: userId,
        createdAt: { gte: from },
      },
      _count: { _all: true },
    });

    const grouped = {};
    results.forEach(({ createdAt, _count }) => {
      const dateStr = format(createdAt, 'yyyy-MM-dd');
      grouped[dateStr] = (grouped[dateStr] || 0) + _count._all;
    });
    return grouped;
  }

  private calculateStreaks(groupedByDate: Record<string, number>) {
    let streak = 0;
    let bestStreak = 0;
    let currentDate = new Date();

    while (true) {
      const key = format(currentDate, 'yyyy-MM-dd');
      if (groupedByDate[key]) {
        streak++;
        bestStreak = Math.max(bestStreak, streak);
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    return {
      currentStreak: streak,
      bestStreak,
    };
  }

  async getApplicationLocations(userId: string) {
    const jobApplications = await this.prisma.jobApply.findMany({
      where: {
        userId: userId,
        location: {
          not: null,
        },
      },
      select: {
        id: true,
        location: true,
        company: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    // Group applications by location and add coordinates
    const locationData = this.groupApplicationsByLocation(jobApplications);

    return {
      totalLocations: locationData.length,
      locations: locationData,
    };
  }

  private groupApplicationsByLocation(applications: any[]) {
    const locationMap = new Map();

    applications.forEach((app) => {
      const location = app.location;
      if (!locationMap.has(location)) {
        locationMap.set(location, {
          location,
          count: 0,
          applications: [],
          // Mock coordinates - in production, you'd geocode these
          coordinates: this.getMockCoordinates(location),
        });
      }

      const locationData = locationMap.get(location);
      locationData.count++;
      locationData.applications.push({
        id: app.id,
        company: app.company,
        jobTitle: app.title,
        status: app.status,
        date: app.createdAt,
      });
    });

    return Array.from(locationMap.values());
  }

  private getMockCoordinates(location: string) {
    // Mock coordinates for major French cities
    const coordinates = {
      Paris: [48.8566, 2.3522],
      Lyon: [45.764, 4.8357],
      Marseille: [43.2965, 5.3698],
      Toulouse: [43.6047, 1.4442],
      Nice: [43.7102, 7.262],
      Nantes: [47.2184, -1.5536],
      Strasbourg: [48.5734, 7.7521],
      Montpellier: [43.611, 3.8767],
      Bordeaux: [44.8378, -0.5792],
      Lille: [50.6292, 3.0573],
      Rennes: [48.1173, -1.6778],
      Reims: [49.2583, 4.0317],
      'Le Havre': [49.4944, 0.1079],
      'Saint-Étienne': [45.4397, 4.3872],
      Toulon: [43.1242, 5.928],
      Grenoble: [45.1885, 5.7245],
      Dijon: [47.322, 5.0415],
      Angers: [47.4784, -0.5632],
      Nîmes: [43.8367, 4.3601],
      Villeurbanne: [45.7663, 4.8795],
    };

    return coordinates[location] || [48.8566, 2.3522]; // Default to Paris
  }
}
