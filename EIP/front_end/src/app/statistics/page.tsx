import { cookies } from "next/headers";
import ApiService from "@/services/api";
import StatisticsClient from "@/components/StatisticsClient";
import { UserProfile } from "@/interface/user.interface";
import { GoalSettings } from "@/interface/misc.interface";
import { StatisticsData, UserRankingInfo } from "@/interface/statistics.interface";

async function getStatisticsPageData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    return { 
      stats: null, 
      goalSettings: null, 
      userRanking: null, 
      error: "Utilisateur non authentifié." 
    };
  }

  const headers = { Cookie: `${token.name}=${token.value}` };

  try {
    // On lance tous les appels en parallèle pour une performance maximale
    const [statsRes, goalsRes, usersRes, profileRes] = await Promise.all([
      ApiService.get<StatisticsData>('/statistics', { headers }),
      ApiService.get<GoalSettings>('/settings/goal', { headers }),
      ApiService.get<any[]>('/user/all-users', { headers }),
      ApiService.get<UserProfile>('/user/profile', { headers })
    ]);

    let userRanking: UserRankingInfo | null = null;
    if (usersRes && Array.isArray(usersRes) && profileRes) {
      const sortedUsers = [...usersRes].sort((a, b) => (b.totalApplications || 0) - (a.totalApplications || 0));
      const userIndex = sortedUsers.findIndex(user => user.id === profileRes.id);
      if (userIndex !== -1) {
        userRanking = {
          rank: userIndex + 1,
          totalUsers: usersRes.length,
        };
      }
    }

    return {
      stats: statsRes,
      goalSettings: goalsRes,
      userRanking: userRanking,
      error: null,
    };

  } catch (error: unknown) {
    console.error("Failed to fetch statistics data on server:", error);
    const errorMessage = error instanceof Error ? error.message : "Impossible de charger les statistiques.";
    return {
      stats: null,
      goalSettings: null,
      userRanking: null,
      error: errorMessage,
    };
  }
}

export default async function StatisticsPage() {
  const pageData = await getStatisticsPageData();
  
  return <StatisticsClient {...pageData} />;
}