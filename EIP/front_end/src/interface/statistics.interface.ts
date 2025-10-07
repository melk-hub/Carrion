export interface StatisticsData {
  totalApplications: number;
  applicationsToday: number;
  streak: number;
  bestStreak: number;
  interviewCount: number;
  lastApplicationDate: string;
  applicationsPerDay: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export interface UserRankingInfo {
  rank: number;
  totalUsers: number;
}
