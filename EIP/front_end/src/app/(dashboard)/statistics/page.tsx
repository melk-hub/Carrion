import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ApiService from "@/services/api";
import { UserProfile, UserProfileJobApply } from "@/interface/user.interface";
import { GoalSettings } from "@/interface/misc.interface";
import {
	StatisticsData,
	UserRankingInfo,
} from "@/interface/statistics.interface";

import StatisticsClient from "./StatisticsClient";

async function getStatisticsPageData() {
	const cookieStore = await cookies();
	const token = cookieStore.get("access_token");

	if (!token) {
		redirect("/statistics");
	}

	const headers = { Cookie: `${token.name}=${token.value}` };

	try {
		const [statsRes, goalsRes, usersRes, profileRes] = await Promise.all([
			ApiService.get<StatisticsData>("/statistics", { headers }),
			ApiService.get<GoalSettings>("/settings/goal", { headers }),
			ApiService.get<UserProfileJobApply[]>("/user/all-users", { headers }),
			ApiService.get<UserProfile>("/user/profile", { headers }),
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
			stats: statsRes,
			goalSettings: goalsRes,
			userRanking: userRanking,
			error: null,
		};
	} catch (error: unknown) {
		if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}

		const errorMessage =
			error instanceof Error
				? error.message
				: "Impossible de charger les statistiques.";
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