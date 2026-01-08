"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import Loading from "@/components/Loading/Loading";
import styles from "../Leaderboard.module.css";
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

export default function FriendsLeaderboardClient({
	initialUsersWithRank,
	initialTopThreeUsers,
	initialCurrentUser,
	error: initialError,
}: RankingClientProps) {
	const [allUsers, setAllUsers] = useState<User[]>(initialUsersWithRank);
	const [friends, setFriends] = useState<string[]>([]);
	const [friendsUsers, setFriendsUsers] = useState<User[]>([]);
	const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
	const [topThreeUsers, setTopThreeUsers] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User | null>(
		initialCurrentUser
	);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(initialError);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const { t } = useLanguage();
	const usersPerPage = 10;

	// Charger les amis depuis l'API au démarrage
	useEffect(() => {
		const loadFriends = async () => {
			try {
				const friendsList = await ApiService.get<Array<{ id: string }>>('/user/friends');
				if (friendsList && Array.isArray(friendsList)) {
					setFriends(friendsList.map(f => f.id));
				}
			} catch (e) {
				console.error("Error loading friends:", e);
			}
		};
		loadFriends();
	}, []);

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [searchResults, setSearchResults] = useState<User[]>([]);

	// Filtrer les utilisateurs pour ne garder que les amis + l'utilisateur actuel
	useEffect(() => {
		// Toujours inclure l'utilisateur actuel
		const friendsWithSelf = currentUser
			? [...new Set([...friends, currentUser.id])] // Utiliser Set pour éviter les doublons
			: friends;

		if (friendsWithSelf.length === 0) {
			setFriendsUsers([]);
			setTopThreeUsers([]);
			setPaginatedUsers([]);
			setTotalPages(1);
			return;
		}

		const filtered = allUsers.filter((user) =>
			friendsWithSelf.includes(user.id)
		);
		const sorted = [...filtered].sort(
			(a, b) => b.totalApplications - a.totalApplications
		);
		const withRank = sorted.map((user, index) => ({
			...user,
			rank: index + 1,
		}));

		setFriendsUsers(withRank);
		setTopThreeUsers(withRank.slice(0, 3));

		const total = Math.ceil(withRank.length / usersPerPage) || 1;
		setTotalPages(total);
		const startIndex = (currentPage - 1) * usersPerPage;
		const endIndex = startIndex + usersPerPage;
		setPaginatedUsers(withRank.slice(startIndex, endIndex));
	}, [friends, allUsers, currentPage, currentUser]);

	// Recherche d'amis potentiels
	const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (query.length < 2) {
			setSearchResults([]);
			return;
		}

		// Rechercher dans tous les utilisateurs (pas seulement les amis)
		const filtered = allUsers.filter(
			(user) =>
				(user.username.toLowerCase().includes(query.toLowerCase()) ||
					user.email.toLowerCase().includes(query.toLowerCase()) ||
					(user.firstName &&
						user.firstName.toLowerCase().includes(query.toLowerCase())) ||
					(user.lastName &&
						user.lastName.toLowerCase().includes(query.toLowerCase()))) &&
				user.id !== currentUser?.id && // Exclure l'utilisateur actuel
				!friends.includes(user.id) // Exclure les amis déjà ajoutés
		);
		setSearchResults(filtered);
	};

	// Ajouter un ami
	const addFriend = async (userId: string) => {
		if (friends.includes(userId)) return;

		try {
			await ApiService.post(`/user/friends/${userId}`, {});
			setFriends([...friends, userId]);
		} catch (e) {
			console.error("Error adding friend:", e);
		}
	};

	// Retirer un ami
	const removeFriend = async (userId: string) => {
		// Ne pas permettre de retirer l'utilisateur actuel
		if (userId === currentUser?.id) return;

		try {
			await ApiService.delete(`/user/friends/${userId}`, {});
			setFriends(friends.filter((id) => id !== userId));
		} catch (e) {
			console.error("Error removing friend:", e);
		}
	};

	const fetchRanking = async (page = 1) => {
		try {
			setLoading(true);
			setError(null);
			const response: User[] | null = await ApiService.get(
				"/user/all-users-ranking"
			);
			const currentUserResponse: UserProfile | null =
				await ApiService.get("/user/profile");

			if (!currentUserResponse)
				throw new Error(t("ranking.errors.fetchError") as string);

			if (!response || !Array.isArray(response))
				throw new Error(
					t("ranking.warnings.noUserDataReceived") as string
				);

			const sortedUsers = [...response].sort(
				(a, b) => b.totalApplications - a.totalApplications
			);
			const usersWithRank = sortedUsers.map((user, index) => ({
				...user,
				rank: index + 1,
			}));

			setAllUsers(usersWithRank);

			const currentUserWithRank = usersWithRank.find(
				(user) => user.id === currentUserResponse.id
			);
			if (currentUserWithRank) {
				setCurrentUser({
					...currentUserWithRank,
					page: Math.ceil(currentUserWithRank.rank / usersPerPage),
				});
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || (t("ranking.errors.fetchError") as string));
			}
		} finally {
			setLoading(false);
		}
	};

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			setCurrentPage(page);
		}
	};

	const goToMyPosition = () => {
		if (currentUser?.page && currentUser.page !== currentPage)
			goToPage(currentUser.page);
	};

	const getRankIcon = (user: User) => {
		switch (user.rank) {
			case 1:
				return t("ranking.positions.first");
			case 2:
				return t("ranking.positions.second");
			case 3:
				return t("ranking.positions.third");
			default:
				return t("ranking.positions.nth", { rank: user.rank });
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
						<div className={styles.rankingErrorIcon}>⚠️</div>
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

	// Même si pas d'amis, on affiche l'utilisateur actuel
	// Si l'utilisateur actuel n'est pas dans friendsUsers mais existe, on l'affiche quand même
	if (!loading && friendsUsers.length === 0 && currentUser) {
		// Afficher uniquement l'utilisateur actuel
		return (
			<div className={styles.rankingPage}>
				<div className={styles.rankingContainer}>
					{error && (
						<div className={styles.rankingErrorBanner}>
							<span>⚠️ {error}</span>
							<button onClick={() => setError(null)}>✕</button>
						</div>
					)}
					<div className={styles.rankingSection}>
						<div className={styles.rankingHeaderSection}>
							<div className={styles.rankingTitleWithRefresh}>
								<h2>
									{t("ranking.complete.title") as string} - {t("ranking.friends.title") as string}
								</h2>
								<button
									className={styles.rankingRefreshButton}
									onClick={() => fetchRanking(currentPage)}
									disabled={loading}
									title={t("ranking.complete.refreshTitle") as string}
								>
									{t("ranking.complete.refreshButton") as string}
								</button>
							</div>
							{/* Barre de recherche pour trouver des amis */}
							<div className={styles.searchContainer}>
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
											setSearchResults([]);
										}}
									>
										✕
									</button>
								)}
							</div>
							{/* Résultats de recherche */}
							{searchResults.length > 0 && (
								<div className={styles.searchResults}>
									<h3>{t("ranking.search.results") as string}</h3>
									{searchResults.map((user) => (
										<div key={user.id} className={styles.searchResultItem}>
											<div className={styles.searchResultInfo}>
												<Image
													src={user.avatar || "/assets/avatar.png"}
													alt="avatar"
													width={40}
													height={40}
													className={styles.roundedFull}
												/>
												<div>
													<h4>
														{user.firstName
															? `${user.firstName} ${user.lastName}`
															: user.username}
													</h4>
													<p>{user.email}</p>
												</div>
											</div>
											<button
												className={`${styles.addFriendButton} ${friends.includes(user.id) ? styles.friendAdded : ""
													}`}
												onClick={() =>
													friends.includes(user.id)
														? removeFriend(user.id)
														: addFriend(user.id)
												}
											>
												{friends.includes(user.id)
													? t("ranking.friends.remove")
													: t("ranking.friends.add")}
											</button>
										</div>
									))}
								</div>
							)}
							{/* Barre de recherche pour trouver des amis */}
							<div className={styles.searchContainer}>
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
											setSearchResults([]);
										}}
									>
										✕
									</button>
								)}
							</div>
							{/* Résultats de recherche */}
							{searchResults.length > 0 && (
								<div className={styles.searchResults}>
									<h3>{t("ranking.search.results") as string}</h3>
									{searchResults.map((user) => (
										<div key={user.id} className={styles.searchResultItem}>
											<div className={styles.searchResultInfo}>
												<Image
													src={user.avatar || "/assets/avatar.png"}
													alt="avatar"
													width={40}
													height={40}
													className={styles.roundedFull}
												/>
												<div>
													<h4>
														{user.firstName
															? `${user.firstName} ${user.lastName}`
															: user.username}
													</h4>
													<p>{user.email}</p>
												</div>
											</div>
											<button
												className={`${styles.addFriendButton} ${friends.includes(user.id) ? styles.friendAdded : ""
													}`}
												onClick={() =>
													friends.includes(user.id)
														? removeFriend(user.id)
														: addFriend(user.id)
												}
											>
												{friends.includes(user.id)
													? t("ranking.friends.remove")
													: t("ranking.friends.add")}
											</button>
										</div>
									))}
								</div>
							)}
						</div>
						<div className={styles.rankingList}>
							<div
								className={`${styles.rankingItem} ${getRankClass(currentUser)} ${styles.currentUser}`}
							>
								<div className={styles.rankingPosition}>
									<span className={styles.rankingRankNumber}>
										{getRankIcon(currentUser)}
									</span>
								</div>
								<div className={styles.rankingUserAvatar}>
									<Image
										src={currentUser.avatar || "/assets/avatar.png"}
										alt="avatar"
										width={40}
										height={40}
										className={styles.roundedFull}
									/>
								</div>
								<div className={styles.rankingUserInfo}>
									<h3>
										{currentUser.firstName
											? `${currentUser.firstName} ${currentUser.lastName}`
											: currentUser.username}
										<span className={styles.rankingYouBadge}>
											{t("ranking.badges.you") as string}
										</span>
									</h3>
									<p>{currentUser.email}</p>
								</div>
								<div className={styles.rankingUserStats}>
									<div className={styles.rankingStatItemPrimary}>
										<span className={styles.rankingStatNumber}>
											{currentUser.totalApplications}
										</span>
										<span className={styles.rankingStatLabel}>
											{t("ranking.stats.totalApplications") as string}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!loading && friendsUsers.length === 0 && !currentUser) {
		return (
			<div className={styles.rankingPage}>
				<div className={styles.rankingContainer}>
					<div className={styles.rankingEmptyState}>
						<h3>{t("ranking.friends.title") as string}</h3>
						<p>
							{t("ranking.friends.noFriendsData") ||
								"Aucun de vos amis n'a encore de candidatures."}
						</p>
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
						<span>⚠️ {error}</span>
						<button onClick={() => setError(null)}>✕</button>
					</div>
				)}
				{topThreeUsers.length > 0 && (
					<div className={styles.podiumSection}>
						<h2 className={styles.podiumTitle}>
							{t("ranking.podium.title") as string} - {t("ranking.friends.title") as string}
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
							<h2>
								{t("ranking.complete.title") as string} - {t("ranking.friends.title") as string}
							</h2>
							<button
								className={styles.rankingRefreshButton}
								onClick={() => fetchRanking(currentPage)}
								disabled={loading}
								title={t("ranking.complete.refreshTitle") as string}
							>
								{t("ranking.complete.refreshButton") as string}
							</button>
						</div>
						{currentUser && friends.includes(currentUser.id) && (
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

