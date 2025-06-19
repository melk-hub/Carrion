import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfWeek, startOfMonth } from 'date-fns';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics(userId: string) {
    const now = new Date();

    const [
      totalApplications,
      applicationsThisWeek,
      applicationsThisMonth,
      statusDistribution,
      contractDistribution,
      companyDistribution,
      locationDistribution,
      interviewCount,
      lastApplication,
    ] = await Promise.all([
      this.prisma.jobApply.count({ where: { UserId: userId } }),

      this.prisma.jobApply.count({
        where: {
          UserId: userId,
          createdAt: { gte: startOfWeek(now) },
        },
      }),

      this.prisma.jobApply.count({
        where: {
          UserId: userId,
          createdAt: { gte: startOfMonth(now) },
        },
      }),

      this.getGroupedCount(userId, 'status'),
      this.getGroupedCount(userId, 'contractType'),
      this.getGroupedCount(userId, 'Company'),
      this.getGroupedCount(userId, 'Location'),

      this.prisma.jobApply.count({
        where: {
          UserId: userId,
          interviewDate: { not: null },
        },
      }),

      this.prisma.jobApply.findFirst({
        where: { UserId: userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      totalApplications,
      applicationsThisWeek,
      applicationsThisMonth,
      statusDistribution,
      contractTypeDistribution: contractDistribution,
      companyDistribution,
      locationDistribution,
      interviewCount,
      lastApplicationDate: lastApplication?.createdAt ?? null,
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
}
