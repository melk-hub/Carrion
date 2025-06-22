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
      this.prisma.jobApply.count({ where: { UserId: userId } }),
      this.prisma.jobApply.count({
        where: { UserId: userId, createdAt: { gte: startOfDay(now) } },
      }),
      this.prisma.jobApply.count({
        where: { UserId: userId, createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.jobApply.count({
        where: { UserId: userId, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.getApplicationsGroupedByDate(userId),
      this.getGroupedCount(userId, 'status'),
      this.getGroupedCount(userId, 'contractType'),
      this.getGroupedCount(userId, 'Company'),
      this.getGroupedCount(userId, 'Location'),
      this.prisma.jobApply.count({
        where: { UserId: userId, interviewDate: { not: null } },
      }),
      this.prisma.jobApply.findFirst({
        where: { UserId: userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const streak = this.calculateStreak(applicationsGroupedByDate);
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
      streak,
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
    field: 'status' | 'contractType' | 'Company' | 'Location',
  ) {
    const raw = await this.prisma.jobApply.groupBy({
      by: [field],
      where: { UserId: userId },
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
        UserId: userId,
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

  private calculateStreak(groupedByDate: Record<string, number>) {
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const key = format(currentDate, 'yyyy-MM-dd');
      if (groupedByDate[key]) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    return streak;
  }
}
