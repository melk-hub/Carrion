import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ApiService from "@/services/api";
import {
	UserProfile,
	UserRankingInfo,
	UserStats,
} from "@/interface/user.interface";

import HomeClient, { HomeClientProps } from "./HomeClient";

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
		redirect("/home");
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
				ApiService.get<Notification[]>("/notifications", {
					headers,
					cache: "no-store",
				}),
			]);

		return {
			profileCheckRes,
			statsRes,
			usersRes,
			profileRes,
			notificationsRes,
			error: null,
		};
	} catch (error: unknown) {
		if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}

		const errorMessage =
			error instanceof Error
				? error.message
				: "Impossible de charger les données.";
		return {
			profileCheckRes: false,
			statsRes: null,
			usersRes: null,
			profileRes: null,
			notificationsRes: [],
			error: errorMessage,
		};
	}
}

export default async function HomePage() {
	const rawData = await getHomeData();

	let userRanking: UserRankingInfo | null = null;
	if (
		rawData.usersRes &&
		Array.isArray(rawData.usersRes) &&
		rawData.profileRes
	) {
		const sortedUsers = [...rawData.usersRes].sort(
			(a, b) => (b.totalApplications || 0) - (a.totalApplications || 0)
		);
		const userIndex = sortedUsers.findIndex(
			(user) => user.id === rawData.profileRes!.id
		);
		if (userIndex !== -1) {
			userRanking = {
				rank: userIndex + 1,
				totalUsers: rawData.usersRes.length,
			};
		}
	}

	const homeData: HomeClientProps = {
		hasProfile: rawData.profileCheckRes ?? false,
		stats: rawData.statsRes,
		userRanking: userRanking,
		notifications: rawData.notificationsRes || [],
		error: rawData.error,
	};

	return <HomeClient {...homeData} />;
}