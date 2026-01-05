import { cookies } from "next/headers";
import ApiService from "@/services/api";
import FriendsLeaderboardClient from "./FriendsLeaderboardClient";

interface UserStats {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  totalApplications: number;
}

interface UserProfile {
  id: string;
}

async function getFriendsRankingData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    return {
      initialUsersWithRank: [],
      initialTopThreeUsers: [],
      initialCurrentUser: null,
      error: "Utilisateur non authentifié.",
    };
  }

  const headers = { Cookie: `${token.name}=${token.value}` };

  try {
    const [usersResponse, profileResponse] = await Promise.all([
      ApiService.get<UserStats[]>("/user/all-users-ranking", { headers }),
      ApiService.get<UserProfile>("/user/profile", { headers }),
    ]);
    const allUsers = usersResponse || [];
    const currentUserProfile = profileResponse;

    // Filtrer pour ne garder que les amis (sera fait côté client avec localStorage)
    const sortedUsers = [...allUsers].sort(
      (a, b) => b.totalApplications - a.totalApplications
    );
    const usersWithRank = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    const topThreeUsers = usersWithRank.slice(0, 3);
    const currentUser = usersWithRank.find(
      (user) => user.id === currentUserProfile!.id
    );

    return {
      initialUsersWithRank: usersWithRank,
      initialTopThreeUsers: topThreeUsers,
      initialCurrentUser: currentUser
        ? { ...currentUser, page: Math.ceil(currentUser.rank / 10) }
        : null,
      error: null,
    };
  } catch (error: unknown) {
    console.error("Failed to fetch ranking on server:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Impossible de charger le classement.";
    return {
      initialUsersWithRank: [],
      initialTopThreeUsers: [],
      initialCurrentUser: null,
      error: errorMessage,
    };
  }
}

export default async function FriendsLeaderboardPage() {
  const rankingData = await getFriendsRankingData();

  return <FriendsLeaderboardClient {...rankingData} />;
}


