"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "../app/(dashboard)/home/Home.module.css";
import Image from "next/image";

interface Application {
	id: string | number;
	createdAt: string;
	company: string;
	contractType?: string;
	title: string;
	status?: string;
	imageUrl?: string;
}

interface RecentApplicationsCardProps {
	className?: string;
}

const RecentApplicationsCard = ({
	className = "",
}: RecentApplicationsCardProps) => {
	const { t } = useLanguage();
	const router = useRouter();
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const API_URL = process.env.NEXT_PUBLIC_API_URL;

	useEffect(() => {
		const fetchRecentApplications = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch(`${API_URL}/job_applies/jobApply`, {
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error(`Erreur HTTP: ${response.status}`);
				}

				const data = await response.json();

				if (!Array.isArray(data)) {
					console.error("❌ Data is not an array:", data);
					setApplications([]);
					return;
				}

				const sortedApplications = data
					.filter((app) => app && app.createdAt)
					.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					)
					.slice(0, 3);

				setApplications(sortedApplications);
			} catch (error: unknown) {
				if (error instanceof Error) {
					setError(error.message);
				} else {
					setError("Unknown error");
				}
				setApplications([]);
			} finally {
				setLoading(false);
			}
		};

		fetchRecentApplications();
	}, [API_URL]);

	const formatTimeAgo = (dateString?: string): string => {
		if (!dateString)
			return (t("shared.time.unknown") as string) || "Date inconnue";

		const now = new Date();
		const applicationDate = new Date(dateString);

		if (isNaN(applicationDate.getTime())) {
			return (t("shared.time.unknown") as string) || "Date inconnue";
		}

		const diffInMinutes = Math.floor(
			(now.getTime() - applicationDate.getTime()) / (1000 * 60)
		);

		if (diffInMinutes < 1) {
			return (t("shared.time.now") as string) || "À l'instant";
		} else if (diffInMinutes < 60) {
			return (
				(t("shared.time.minutes", { minutes: diffInMinutes }) as string) ||
				`Il y a ${diffInMinutes} min`
			);
		} else if (diffInMinutes < 1440) {
			const hours = Math.floor(diffInMinutes / 60);
			return (
				(t("shared.time.hoursAgo", { count: hours }) as string) ||
				`Il y a ${hours}h`
			);
		} else {
			const days = Math.floor(diffInMinutes / 1440);
			return (
				(t("shared.time.daysAgo", { count: days }) as string) ||
				`Il y a ${days}j`
			);
		}
	};

	const getStatusText = (status?: string): string => {
		if (!status) return (t("shared.status.unknown") as string) || "Inconnu";
		const statusKey = `dashboard.statuses.${status}`;
		return (t(statusKey) as string) || status;
	};

	const getStatusClassKey = (status?: string) => {
		if (!status) return "";
		switch (status) {
			case "APPLIED":
				return "status-accepted"
			case "PENDING":
				return "status-pending"
			case "REJECTED_BY_COMPANY":
				return "status-refused"
			case "INTERVIEW_SCHEDULED":
				return "status-interview"
			case "OFFER_RECEIVED":
				return "status-offer"
			default:
				return "";
		}
	};

	const getCompanyInitial = (name: string) => {
		return name ? name.charAt(0).toUpperCase() : "?";
	};

	if (loading) {
		return (
			<div className={`${styles.card} ${styles.recentApplications} ${className}`}>
				<div className={styles.cardHeader}>
					<h3>{(t("home.recentApplications") as string) || "Dernières candidatures"}</h3>
					<button className={styles.seeAllBtn} onClick={() => router.push("/dashboard")}>
						{(t("home.seeAll") as string) || "Voir tout"}
					</button>
				</div>
				<div className={styles.applicationsList}>
					<div className={styles.applicationItem}>
						<div className={styles.applicationInfo}>
							<h4>{(t("shared.loading") as string) || "Chargement..."}</h4>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={`${styles.card} ${styles.recentApplications} ${className}`}>
				<div className={styles.cardHeader}>
					<h3>{(t("home.recentApplications") as string) || "Dernières candidatures"}</h3>
					<button className={styles.seeAllBtn} onClick={() => router.push("/dashboard")}>
						{(t("home.seeAll") as string) || "Voir tout"}
					</button>
				</div>
				<div className={styles.applicationsList}>
					<div className={styles.applicationItem}>
						<div className={styles.applicationInfo}>
							<h4>Erreur</h4>
							<p>{error}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (applications.length === 0) {
		return (
			<div className={`${styles.card} ${styles.recentApplications} ${className}`}>
				<div className={styles.cardHeader}>
					<h3>{(t("home.recentApplications") as string) || "Dernières candidatures"}</h3>
					<button className={styles.seeAllBtn} onClick={() => router.push("/dashboard")}>
						{(t("home.seeAll") as string) || "Voir tout"}
					</button>
				</div>
				<div className={styles.applicationsList}>
					<div className={styles.applicationItem}>
						<div className={styles.applicationInfo}>
							<h4>{(t("home.noApplications") as string) || "Aucune candidature"}</h4>
							<p>{(t("home.noApplicationsMessage") as string) || "Vos candidatures apparaîtront ici"}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`${styles.card} ${styles.recentApplications} ${className}`}>
			<div className={styles.cardHeader}>
				<h3>{(t("home.recentApplications") as string) || "Dernières candidatures"}</h3>
				<button className={styles.seeAllBtn} onClick={() => router.push("/dashboard")}>
					{(t("home.seeAll") as string) || "Voir tout"}
				</button>
			</div>

			<div className={styles.applicationsList}>
				{applications.map((application) => {
					const statusClassKey = getStatusClassKey(application.status);
					const statusClass = styles[statusClassKey];

					return (
						<div className={styles.applicationItem} key={application.id}>
							<div className={styles.companyLogo}>
								{application.imageUrl ? (
									<Image
										src={application.imageUrl}
										alt={application.company || "Company logo"}
										width={40}
										height={40}
										style={{ borderRadius: "8px", objectFit: "cover" }}
									/>
								) : (
									<div className={styles.placeholderLogo}>
										{getCompanyInitial(application.company)}
									</div>
								)}
							</div>

							<div className={styles.applicationInfo}>
								<h4>
									{application.company || (t("shared.unknown") as string) || "Entreprise inconnue"}
								</h4>
								<p>
									{application.contractType && `${application.contractType} - `}
									{application.title || (t("shared.unknownPosition") as string) || "Poste non précisé"}
								</p>

								<div className={`${styles.modernStatusBadge} ${statusClass}`}>
									<div className={styles.statusIndicator}></div>
									<span>{getStatusText(application.status)}</span>
								</div>
							</div>

							<div className={styles.applicationTime}>
								<span>{formatTimeAgo(application.createdAt)}</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default RecentApplicationsCard;