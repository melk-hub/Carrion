import { cookies } from "next/headers";
import ApiService from "@/services/api";
import {
  UserProfile,
  UserRankingInfo,
  UserStats,
} from "@/interface/user.interface";

import HomeClient from "./HomeClient";

interface Stats {
  totalApplications: number;
  applicationsToday: number;
}

interface Notification {
  id: string;
  type: "POSITIVE" | "WARNING" | "NEGATIVE" | "INFO";
  titleKey?: string;
  title?: string;
  message?: string;
  variables?: { company?: string; jobTitle?: string };
  createdAt: string;
}

async function getHomeData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    return {
      hasProfile: false,
      stats: null,
      userRanking: null,
      notifications: [],
      error: "Utilisateur non authentifié.",
    };
  }

  const headers = { Cookie: `${token.name}=${token.value}` };

  try {
    const [profileCheckRes, statsRes, usersRes, profileRes, notificationsRes] =
      await Promise.all([
        ApiService.get<boolean>("/utils/hasProfile", {
          headers,
          cache: "no-store",
        }),
        ApiService.get<Stats>("/statistics", { headers, cache: "no-store" }),
        ApiService.get<UserStats[]>("/user/all-users", {
          headers,
          cache: "no-store",
        }),
        ApiService.get<UserProfile>("/user/profile", {
          headers,
          cache: "no-store",
        }),
        ApiService.get<Notification[]>("/notification", {
          headers,
          cache: "no-store",
        }),
      ]);

    let userRanking: UserRankingInfo | null = null;
    if (usersRes && Array.isArray(usersRes) && profileRes) {
      const sortedUsers = [...usersRes].sort(
        (a, b) => (b.totalApplications || 0) - (a.totalApplications || 0)
      );
      const userIndex = sortedUsers.findIndex(
        (user) => user.id === profileRes.id
      );
      if (userIndex !== -1) {
        userRanking = {
          rank: userIndex + 1,
          totalUsers: usersRes.length,
        };
      }
    }

    return {
      hasProfile: profileCheckRes,
      stats: statsRes,
      userRanking,
      notifications: notificationsRes || [],
      error: null,
    };
  } catch (error: unknown) {
    console.error("Failed to fetch home data on server:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Impossible de charger les données de la page d'accueil.";
    return {
      hasProfile: false,
      stats: null,
      userRanking: null,
      notifications: [],
      error: errorMessage,
    };
  }
}

export default async function HomePage() {
  const homeData = await getHomeData();

  return <HomeClient {...homeData} />;
}
