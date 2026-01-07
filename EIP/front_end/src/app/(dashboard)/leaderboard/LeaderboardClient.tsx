"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Image from "next/image";
import {
	Trophy,
	Medal,
	RefreshCw,
	Search,
	X,
	AlertTriangle,
	Plus,
	Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Loading from "@/components/Loading/Loading";
import styles from "./Leaderboard.module.css";
import ApiService from "@/services/api";
import { UserProfile } from "@/interface/user.interface";

interface User {
	id: string;
	avatar?: string;
	firstName?: string;
	lastName?: string;
	username: string;
	email: string;
	totalApplications: number;
	rank: number;
	page?: number;
}

interface RankingClientProps {
	initialUsersWithRank: User[];
	initialTopThreeUsers: User[];
	initialCurrentUser: User | null;
	error: string | null;
}

function LeaderboardContent({
	initialUsersWithRank,
	initialTopThreeUsers,
	initialCurrentUser,
	error: initialError,
}: RankingClientProps) {
	const [allUsers, setAllUsers] = useState<User[]>(initialUsersWithRank);
	const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
	const [topThreeUsers, setTopThreeUsers] =
		useState<User[]>(initialTopThreeUsers);
	const [currentUser, setCurrentUser] = useState<User | null>(
		initialCurrentUser
	);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(initialError);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [friends, setFriends] = useState<string[]>([]);
	const { t } = useLanguage();
	const usersPerPage = 10;

	const applyFilters = useCallback(
		(usersData: User[], page: number, query: string) => {
			let filtered = usersData;

			if (query && query.length >= 2) {
				filtered = usersData.filter(
					(user) =>
						user.username.toLowerCase().includes(query.toLowerCase()) ||
						user.email.toLowerCase().includes(query.toLowerCase()) ||
						(user.firstName &&
							user.firstName.toLowerCase().includes(query.toLowerCase())) ||
						(user.lastName &&
							user.lastName.toLowerCase().includes(query.toLowerCase()))
				);
			}

			const sorted = [...filtered].sort(
				(a, b) => b.totalApplications - a.totalApplications
			);
			const withRank = sorted.map((user, index) => ({
				...user,
				rank: index + 1,
			}));

			const total = Math.ceil(withRank.length / usersPerPage) || 1;
			setTotalPages(total);
			const startIndex = (page - 1) * usersPerPage;
			const endIndex = startIndex + usersPerPage;
			setPaginatedUsers(withRank.slice(startIndex, endIndex));
			setCurrentPage(page);
		},
		[usersPerPage]
	);

	const processAndSetUsers = useCallback(
		(usersData: User[], page: number) => {
			setAllUsers(usersData);
			applyFilters(usersData, page, searchQuery);
		},
		[applyFilters, searchQuery]
	);

	useEffect(() => {
		if (initialUsersWithRank.length > 0) {
			processAndSetUsers(initialUsersWithRank, 1);
		}
	}, [initialUsersWithRank, processAndSetUsers]);

	const fetchRanking = async (page = 1) => {
		try {
			setLoading(true);
			setError(null);

			const response = await ApiService.get<User[]>("/user/all-users-ranking");
			const currentUserResponse = await ApiService.get<UserProfile>(
				"/user/profile"
			);

			if (!currentUserResponse)
				throw new Error(t("ranking.errors.fetchError") as string);

			if (!response || !Array.isArray(response))
				throw new Error(t("ranking.warnings.noUserDataReceived") as string);

			const sortedUsers = [...response].sort(
				(a, b) => b.totalApplications - a.totalApplications
			);

			const usersWithRank: User[] = sortedUsers.map((user, index) => ({
				...user,
				rank: index + 1,
			}));

			setTopThreeUsers(usersWithRank.slice(0, 3));

			const currentUserWithRank = usersWithRank.find(
				(user) => user.id === currentUserResponse.id
			);
			if (currentUserWithRank) {
				setCurrentUser({
					...currentUserWithRank,
					page: Math.ceil(currentUserWithRank.rank / usersPerPage),
				});
			}
			processAndSetUsers(usersWithRank, page);
			return usersWithRank;
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || (t("ranking.errors.fetchError") as string));
			}
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			applyFilters(allUsers, page, searchQuery);
		}
	};

	const goToMyPosition = () => {
		if (currentUser?.page && currentUser.page !== currentPage)
			goToPage(currentUser.page);
	};

	useEffect(() => {
		const loadFriends = async () => {
			try {
				const friendsList = await ApiService.get<Array<{ id: string }>>(
					"/user/friends"
				);
				if (friendsList && Array.isArray(friendsList)) {
					setFriends(friendsList.map((f) => f.id));
				}
			} catch (e) {
				console.error(e);
			}
		};
		loadFriends();
	}, []);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		applyFilters(allUsers, 1, query);
	};

	const addFriend = async (userId: string) => {
		if (friends.includes(userId)) return;

		try {
			await ApiService.post(`/user/friends/${userId}`, {});
			setFriends([...friends, userId]);
		} catch (e) {
			console.error(e);
		}
	};

	const removeFriend = async (userId: string) => {
		try {
			await ApiService.delete(`/user/friends/${userId}`, {});
			setFriends(friends.filter((id) => id !== userId));
		} catch (e) {
			console.error(e);
		}
	};

	const getRankIcon = (user: User) => {
		switch (user.rank) {
			case 1:
				return <Trophy color="#FFD700" size={24} />;
			case 2:
				return <Trophy color="#C0C0C0" size={24} />;
			case 3:
				return <Trophy color="#CD7F32" size={24} />;
			default:
				return <Medal size={20} />;
		}
	};

	const getRankClass = (user: User) => {
		switch (user.rank) {
			case 1:
				return "rankGold";
			case 2:
				return "rankSilver";
			case 3:
				return "rankBronze";
			default:
				return "rankDefault";
		}
	};

	if (loading) return <Loading message={t("ranking.loading.text") as string} />;

	if (error && allUsers.length === 0) {
		return (
			<div className={styles.rankingErrorState}>
				<div className={styles.rankingContainer}>
					<div className={styles.rankingErrorState}>
						<div className={styles.rankingErrorIcon}>
							<AlertTriangle size={48} />
						</div>
						<h3>{t("ranking.error.title") as string}</h3>
						<p>{error}</p>
						<button
							className={styles.rankingRetryButton}
							onClick={() => fetchRanking(1)}
						>
							{t("ranking.error.retryButton") as string}
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!loading && allUsers.length === 0) {
		return (
			<div className={styles.rankingPage}>
				<div className={styles.rankingContainer}>
					<div className={styles.rankingEmptyState}>
						<h3>{t("ranking.empty.title") as string}</h3>
						<p>{t("ranking.empty.description") as string}</p>
						<p>{t("ranking.empty.futureInfo") as string}</p>
						<button
							className={styles.rankingRetryButton}
							onClick={() => fetchRanking(1)}
						>
							{t("ranking.empty.refreshButton") as string}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.rankingPage}>
			<div className={styles.rankingContainer}>
				{error && (
					<div className={styles.rankingErrorBanner}>
						<span>
							<AlertTriangle size={20} /> {error}
						</span>
						<button onClick={() => setError(null)}>
							<X size={14} />
						</button>
					</div>
				)}
				{topThreeUsers.length > 0 && (
					<div className={styles.podiumSection}>
						<h2 className={styles.podiumTitle}>
							{t("ranking.podium.title") as string}
						</h2>
						<div className={styles.rankingPodium}>
							{topThreeUsers[1] && (
								<div
									className={`${styles.podiumItem} ${styles.rankSilver} ${currentUser?.id === topThreeUsers[1].id
										? styles.currentUser
										: ""
										}`}
								>
									<div className={styles.podiumRank}>
										{getRankIcon(topThreeUsers[1])}
									</div>
									<div className={styles.podiumAvatar}>
										<Image
											src={topThreeUsers[1].avatar || "/assets/avatar.png"}
											alt="avatar"
											width={80}
											height={80}
											className={styles.roundedFull}
										/>
									</div>
									<h3>
										{topThreeUsers[1].firstName || topThreeUsers[1].username}
									</h3>
									<span className={styles.podiumStatNumber}>
										{topThreeUsers[1].totalApplications}
									</span>
								</div>
							)}
							{topThreeUsers[0] && (
								<div
									className={`${styles.podiumItem} ${styles.rankGold} ${currentUser?.id === topThreeUsers[0].id
										? styles.currentUser
										: ""
										}`}
								>
									<div className={styles.podiumRank}>
										{getRankIcon(topThreeUsers[0])}
									</div>
									<div className={styles.podiumAvatar}>
										<Image
											src={topThreeUsers[0].avatar || "/assets/avatar.png"}
											alt="avatar"
											width={100}
											height={100}
											className={styles.roundedFull}
										/>
									</div>
									<h3>
										{topThreeUsers[0].firstName || topThreeUsers[0].username}
									</h3>
									<span className={styles.podiumStatNumber}>
										{topThreeUsers[0].totalApplications}
									</span>
								</div>
							)}
							{topThreeUsers[2] && (
								<div
									className={`${styles.podiumItem} ${styles.rankBronze} ${currentUser?.id === topThreeUsers[2].id
										? styles.currentUser
										: ""
										}`}
								>
									<div className={styles.podiumRank}>
										{getRankIcon(topThreeUsers[2])}
									</div>
									<div className={styles.podiumAvatar}>
										<Image
											src={topThreeUsers[2].avatar || "/assets/avatar.png"}
											alt="avatar"
											width={80}
											height={80}
											className={styles.roundedFull}
										/>
									</div>
									<h3>
										{topThreeUsers[2].firstName || topThreeUsers[2].username}
									</h3>
									<span className={styles.podiumStatNumber}>
										{topThreeUsers[2].totalApplications}
									</span>
								</div>
							)}
						</div>
					</div>
				)}
				<div className={styles.rankingSection}>
					<div className={styles.rankingHeaderSection}>
						<div className={styles.rankingTitleWithRefresh}>
							<h2>{t("ranking.complete.title") as string}</h2>
							<button
								className={styles.rankingRefreshButton}
								onClick={() => fetchRanking(currentPage)}
								disabled={loading}
								title={t("ranking.complete.refreshTitle") as string}
							>
								<RefreshCw size={16} />
							</button>
						</div>
						<div className={styles.searchContainer}>
							<div className={styles.searchIconWrapper}>
								<Search size={16} />
							</div>
							<input
								type="text"
								className={styles.searchInput}
								placeholder={t("ranking.search.placeholder") as string}
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
							/>
							{searchQuery && (
								<button
									className={styles.searchClearButton}
									onClick={() => {
										setSearchQuery("");
										applyFilters(allUsers, 1, "");
									}}
								>
									<X size={14} />
								</button>
							)}
						</div>
						{currentUser && (
							<div className={styles.rankingUserPositionInfo}>
								<span>
									{t("ranking.userPosition.text", { rank: currentUser.rank })}
								</span>
								{currentUser.page !== currentPage && (
									<button
										className={styles.rankingGoToPositionButton}
										onClick={goToMyPosition}
									>
										{t("ranking.userPosition.goToButton") as string}
									</button>
								)}
							</div>
						)}
					</div>
					<div className={styles.rankingList}>
						{paginatedUsers.map((user) => (
							<div
								key={user.id}
								className={`${styles.rankingItem} ${getRankClass(user)} ${currentUser?.id === user.id ? styles.currentUser : ""
									}`}
							>
								<div className={styles.rankingPosition}>
									<span className={styles.rankingRankNumber}>
										{getRankIcon(user)}
									</span>
								</div>
								<div className={styles.rankingUserAvatar}>
									<Image
										src={user.avatar || "/assets/avatar.png"}
										alt="avatar"
										width={40}
										height={40}
										className={styles.roundedFull}
									/>
								</div>
								<div className={styles.rankingUserInfo}>
									<h3>
										{user.firstName
											? `${user.firstName} ${user.lastName}`
											: user.username}
										{currentUser?.id === user.id && (
											<span className={styles.rankingYouBadge}>
												{t("ranking.badges.you") as string}
											</span>
										)}
									</h3>
									<p>{user.email}</p>
								</div>
								<div className={styles.rankingUserStats}>
									<div className={styles.rankingStatItemPrimary}>
										<span className={styles.rankingStatNumber}>
											{user.totalApplications}
										</span>
										<span className={styles.rankingStatLabel}>
											{t("ranking.stats.totalApplications") as string}
										</span>
									</div>
								</div>
								{user.id !== currentUser?.id && (
									<button
										className={`${styles.addFriendButtonCard} ${friends.includes(user.id) ? styles.friendAdded : ""
											}`}
										onClick={() =>
											friends.includes(user.id)
												? removeFriend(user.id)
												: addFriend(user.id)
										}
										title={
											friends.includes(user.id)
												? (t("ranking.friends.remove") as string)
												: (t("ranking.friends.add") as string)
										}
									>
										{friends.includes(user.id) ? (
											<Check size={16} />
										) : (
											<Plus size={16} />
										)}
									</button>
								)}
							</div>
						))}
					</div>
					{totalPages > 1 && (
						<div className={styles.rankingPagination}>
							<button
								className={styles.rankingPaginationButton}
								onClick={() => goToPage(currentPage - 1)}
								disabled={currentPage === 1}
							>
								← {t("ranking.pagination.previous") as string}
							</button>
							<div className={styles.rankingPaginationNumbers}>
								{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
									let pageNumber;
									if (totalPages <= 5) pageNumber = i + 1;
									else if (currentPage <= 3) pageNumber = i + 1;
									else if (currentPage >= totalPages - 2)
										pageNumber = totalPages - 4 + i;
									else pageNumber = currentPage - 2 + i;
									return (
										<button
											key={pageNumber}
											className={`${styles.rankingPaginationNumber} ${currentPage === pageNumber ? styles.active : ""
												}`}
											onClick={() => goToPage(pageNumber)}
										>
											{pageNumber}
										</button>
									);
								})}
							</div>
							<button
								className={styles.rankingPaginationButton}
								onClick={() => goToPage(currentPage + 1)}
								disabled={currentPage === totalPages}
							>
								{t("ranking.pagination.next") as string} →
							</button>
						</div>
					)}
					<div className={styles.rankingPaginationInfo}>
						{t("ranking.pagination.info", {
							currentPage,
							totalPages,
							usersShown: paginatedUsers.length,
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function LeaderboardClient(props: RankingClientProps) {
	return (
		<Suspense fallback={<Loading />}>
			<LeaderboardContent {...props} />
		</Suspense>
	);
}