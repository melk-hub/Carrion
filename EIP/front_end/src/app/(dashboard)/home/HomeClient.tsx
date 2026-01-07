"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import apiService from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import {
	CheckCircle2,
	AlertTriangle,
	XCircle,
	Info,
	Activity
} from "lucide-react";

import WeeklyGoalCard from "@/components/WeeklyGoalCard/WeeklyGoalCard";
import DailyTipCard from "@/components/DailyTipCard";
import RecentApplicationsCard from "@/components/RecentApplicationsCard";
import AddApplicationModal, {
	ApplicationFormData,
} from "@/components/AddApplicationModal/AddApplicationModal";
import Loading from "@/components/Loading/Loading";
import SetupModal from "@/components/SetupModal/SetupModal";

import candidature from "../../../../public/assets/candidate-profile.png";
import newApplicationIcon from "../../../../public/assets/plus.png";
import statistics from "../../../../public/assets/pie-chart.png";
import settings from "../../../../public/assets/settings.png";
import styles from "./Home.module.css";
import dynamic from "next/dynamic";

const InfosModal = dynamic(() => import("@/components/InfosModal/InfosModal"), {
	ssr: false,
});

interface Stats {
	totalApplications: number;
	applicationsToday: number;
}
interface UserRankingInfo {
	rank: number;
	totalUsers: number;
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

export interface HomeClientProps {
	hasProfile: boolean;
	stats: Stats | null;
	userRanking: UserRankingInfo | null;
	notifications: Notification[];
	error: string | null;
}

export default function HomeClient({
	hasProfile,
	stats,
	userRanking,
	notifications,
	error,
}: HomeClientProps) {
	const { t } = useLanguage();
	const router = useRouter();
	const { userProfile, loadingAuth } = useAuth();
	const [showAddModal, setShowAddModal] = useState(false);
	const [isInfosModalOpen, setIsInfosModalOpen] = useState(false);
	const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
	const [hasSeenSetup, setHasSeenSetup] = useState(false);

	useEffect(() => {
		const seen = sessionStorage.getItem('hasSeenSetupModal');
		if (seen) setHasSeenSetup(true);
	}, []);

	useEffect(() => {
		if (loadingAuth) return;
		if (!hasProfile) {
			const timer = setTimeout(() => {
				setIsInfosModalOpen(true);
			}, 500);
			return () => clearTimeout(timer);
		}
		if (hasProfile && userProfile && !hasSeenSetup) {
			const isLinked = userProfile.tokens.length > 0;
			if (!isLinked) {
				const timer = setTimeout(() => {
					setIsSetupModalOpen(true);
				}, 500);
				return () => clearTimeout(timer);
			}
		}
	}, [hasProfile, userProfile, loadingAuth, hasSeenSetup]);

	const handleCloseInfosModal = () => {
		setIsInfosModalOpen(false);
		router.refresh();
	};

	const handleCloseSetupModal = () => {
		setIsSetupModalOpen(false);

		sessionStorage.setItem('hasSeenSetupModal', 'true');
		setHasSeenSetup(true);
		router.refresh();
	};

	const formatRanking = (ranking: UserRankingInfo | null): string => {
		if (!ranking) return t("home.ranking.noRank") as string;
		const { rank } = ranking;
		const ordinalKey = `home.ranking.ordinals.${rank}`;
		const ordinalTranslation = t(ordinalKey) as string;
		return ordinalTranslation !== ordinalKey
			? ordinalTranslation
			: `${rank}${t("home.ranking.suffix") as string}`;
	};

	const formatTimestamp = (createdAt: string): string => {
		if (!createdAt) return t("notifications.time.unknown") as string;
		const now = new Date();
		const notificationTime = new Date(createdAt);
		if (isNaN(notificationTime.getTime())) return t("notifications.time.unknown") as string;
		const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
		if (diffInMinutes < 1) return t("notifications.time.now") as string;
		if (diffInMinutes < 60) return t("notifications.time.minutes", { minutes: diffInMinutes }) as string;
		if (diffInMinutes < 1440) {
			const hours = Math.floor(diffInMinutes / 60);
			return t("notifications.time.hours", { hours }) as string;
		}
		const days = Math.floor(diffInMinutes / 1440);
		return t("notifications.time.days", { days }) as string;
	};

	const getNotificationIcon = (type: Notification["type"]) => {
		switch (type) {
			case "POSITIVE": return <CheckCircle2 size={18} />;
			case "WARNING": return <AlertTriangle size={18} />;
			case "NEGATIVE": return <XCircle size={18} />;
			case "INFO": default: return <Info size={18} />;
		}
	};

	const getSimplifiedTitle = (notification: Notification): string => {
		if (notification.titleKey?.includes("application.updated")) return t("notifications.titles.application.updated") as string;
		if (notification.titleKey?.includes("application.created")) return t("notifications.titles.application.created") as string;
		if (notification.titleKey?.includes("interview")) return t("notifications.titles.interview") as string;
		return notification.title || (t("notifications.default") as string);
	};

	const getRecentNotifications = () => {
		return [...notifications]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 3);
	};
	const recentNotifications = getRecentNotifications();

	const handleSaveNewApplication = async (applicationData: ApplicationFormData) => {
		try {
			await apiService.post("/job_applies", applicationData);
			closeAddModal();
			router.refresh();
		} catch (err) {
			console.error(t("dashboard.errors.addError"), err);
		}
	};

	const statusMap = {
		APPLIED: t("dashboard.statuses.APPLIED") as string,
		PENDING: t("dashboard.statuses.PENDING") as string,
		REJECTED_BY_COMPANY: t("dashboard.statuses.REJECTED_BY_COMPANY") as string,
		INTERVIEW_SCHEDULED: t("dashboard.statuses.INTERVIEW_SCHEDULED") as string,
		OFFER_RECEIVED: t("dashboard.statuses.OFFER_RECEIVED") as string,
	};

	const openAddModal = () => setShowAddModal(true);
	const closeAddModal = () => setShowAddModal(false);
	const navigate = (path: string) => router.push(path);

	if (error) {
		return <div className={styles.homeErrorState}>{error}</div>;
	}

	if (!stats || !userRanking) {
		return <Loading />;
	}

	return (
		<div className={styles.homeContainer}>
			{isInfosModalOpen && (
				<InfosModal
					isOpen={isInfosModalOpen}
					onClose={handleCloseInfosModal}
				/>
			)}

			{isSetupModalOpen && (
				<SetupModal
					isOpen={isSetupModalOpen}
					onClose={handleCloseSetupModal}
				/>
			)}

			<div className={styles.welcomeSection}>
				<div className={styles.welcomeContent}>
					<h1 className={styles.welcomeTitle}>{t("home.welcome") as string}</h1>
					<p className={styles.welcomeSubtitle}>
						{t("home.welcomeMessage") as string}
					</p>
				</div>
				<div className={styles.welcomeStats}>
					<div className={styles.statItem}>
						<span className={styles.statNumber}>
							{stats?.totalApplications ?? 0}
						</span>
						<span className={styles.statLabel}>
							{t("home.stats.totalApplications") as string}
						</span>
					</div>
					<div className={styles.statItem}>
						<span className={styles.statNumber}>
							{stats?.applicationsToday ?? 0}
						</span>
						<span className={styles.statLabel}>
							{t("home.stats.todayApplications") as string}
						</span>
					</div>
					<div className={styles.statItem}>
						<span className={styles.statNumber}>
							{formatRanking(userRanking)}
						</span>
						<span className={styles.statLabel}>
							{t("home.stats.userRanking") as string}
						</span>
					</div>
				</div>
			</div>

			<div className={styles.mainGrid}>
				<div className={`${styles.card} ${styles.quickActions}`}>
					<div className={styles.cardHeader}>
						<h3>{t("home.quickAccess") as string}</h3>
					</div>
					<div className={styles.actionsGrid}>
						<button
							className={`${styles.actionBtn} ${styles.primary}`}
							onClick={() => navigate("/dashboard")}
						>
							<Image src={candidature} alt="Candidature" width={30} height={30} />
							<span>{t("home.myApplications") as string}</span>
						</button>
						<button
							className={`${styles.actionBtn} ${styles.primary}`}
							onClick={openAddModal}
						>
							<Image src={newApplicationIcon} alt="Nouvelle Candidature" width={30} height={30} />
							<span>{t("home.newApplications") as string}</span>
						</button>
						<button
							className={`${styles.actionBtn} ${styles.primary}`}
							onClick={() => navigate("/statistics")}
						>
							<Image src={statistics} alt="Statistiques" width={30} height={30} />
							<span>{t("home.statistics") as string}</span>
						</button>
						<button
							className={`${styles.actionBtn} ${styles.primary}`}
							onClick={() => navigate("/settings")}
						>
							<Image src={settings} alt="Paramètres" width={30} height={30} />
							<span>{t("home.myInformation") as string}</span>
						</button>
					</div>
				</div>

				<div className={`${styles.card} ${styles.activityTimeline}`}>
					<div className={styles.cardHeader}>
						<h3>{t("home.recentActivity") as string}</h3>
						<button
							className={styles.seeAllBtn}
							onClick={() => navigate("/notification")}
						>
							{t("home.seeMore") as string}
						</button>
					</div>
					<div className={styles.timeline}>
						{recentNotifications.length > 0 ? (
							recentNotifications.map((notification) => (
								<div className={styles.timelineItem} key={notification.id}>
									{/* Mise à jour ici pour gérer l'icone React */}
									<div className={`${styles.timelineDot} ${styles[notification.type.toLowerCase()]}`}>
										{getNotificationIcon(notification.type)}
									</div>
									<div className={styles.timelineContent}>
										<h4>{getSimplifiedTitle(notification)}</h4>
										<p>{notification.message?.substring(0, 60)}</p>
										<span className={styles.timelineTime}>
											{formatTimestamp(notification.createdAt)}
										</span>
									</div>
								</div>
							))
						) : (
							<div className={styles.timelineItem}>
								<div className={styles.timelineDot}>
									<Activity size={18} />
								</div>
								<div className={styles.timelineContent}>
									<h4>{t("home.noActivity") as string}</h4>
								</div>
							</div>
						)}
					</div>
				</div>

				<WeeklyGoalCard showGoToStatsButton={true} />
				<DailyTipCard />
				<RecentApplicationsCard />
			</div>

			{showAddModal && (
				<AddApplicationModal
					onAdd={handleSaveNewApplication}
					onClose={closeAddModal}
					statusMap={statusMap}
				/>
			)}
		</div>
	);
}