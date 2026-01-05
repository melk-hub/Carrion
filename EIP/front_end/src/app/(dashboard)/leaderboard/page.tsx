import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import ApiService from '@/services/api';
import LeaderboardClient from './LeaderboardClient';
import { User, UserStats } from '@/interface/user.interface';
import { Suspense } from 'react';
import Loading from '@/components/Loading/Loading';

export const dynamic = "force-dynamic";

interface UserProfile {
	id: string;
}

async function getRankingData() {
	const cookieStore = await cookies();
	const token = cookieStore.get('access_token');

	if (!token) {
		redirect("/auth/signin");
	}

	const headers = { Cookie: `${token.name}=${token.value}` };

	try {
		const [usersResponse, profileResponse] = await Promise.all([
			ApiService.get<UserStats[]>('/user/all-users-ranking', { headers }),
			ApiService.get<UserProfile>('/user/profile', { headers })
		]);

		const allUsers = usersResponse || [];
		const currentUserProfile = profileResponse;

		const sortedUsers = [...allUsers].sort((a, b) => b.totalApplications - a.totalApplications);

		const usersWithRank: User[] = sortedUsers.map((user, index) => ({
			...user,
			rank: index + 1,
		}));

		const topThreeUsers = usersWithRank.slice(0, 3);
		const currentUser = usersWithRank.find(user => user.id === currentUserProfile?.id);

		return {
			initialUsersWithRank: usersWithRank,
			initialTopThreeUsers: topThreeUsers,
			initialCurrentUser: currentUser ? { ...currentUser, page: Math.ceil(currentUser.rank / 10) } : null,
			error: null,
		};
	} catch (error: unknown) {
		if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}
		const errorMessage = error instanceof Error ? error.message : "Impossible de charger le classement.";
		return {
			initialUsersWithRank: [],
			initialTopThreeUsers: [],
			initialCurrentUser: null,
			error: errorMessage,
		};
	}
}

export default async function LeaderboardPage() {
	const rankingData = await getRankingData();

	return (
		<Suspense fallback={<Loading />}>
			<LeaderboardClient {...rankingData} />
		</Suspense>
	);
}