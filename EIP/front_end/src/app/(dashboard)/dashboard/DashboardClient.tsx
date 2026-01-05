"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import apiService from "@/services/api";
import ApplicationCard from "@/components/Card/Dashboardcard";
import ApplicationList from "@/components/List/DashboardList";
import EditApplicationModal from "@/components/EditApplicationModal";
import DetailsModal from "@/components/DetailsModal";
import AddApplicationModal, {
	ApplicationFormData,
} from "@/components/AddApplicationModal/AddApplicationModal";
import { Application } from "@/interface/application.interface";
import { JobApply } from "@/interface/job-apply.interface";
import { ApplicationStatus } from "@/enum/application-status.enum";
import styles from "./Dashboard.module.css";

interface DashboardClientProps {
	initialApplications: Application[];
	error: string | null;
}

export default function DashboardClient({
	initialApplications,
	error: initialError,
}: DashboardClientProps) {
	const { t } = useLanguage();
	const [applications, setApplications] =
		useState<Application[]>(initialApplications);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [sortBy, setSortBy] = useState<"date" | "status">("date");
	const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
		new Set()
	);
	const [selectedApplication, setSelectedApplication] =
		useState<Application | null>(null);
	const [popupType, setPopupType] = useState<"add" | "edit" | "details" | null>(
		null
	);
	const [error] = useState<string | null>(initialError);

	const statusMap = useMemo(
		() => ({
			APPLIED: t("dashboard.statuses.APPLIED") as string,
			PENDING: t("dashboard.statuses.PENDING") as string,
			INTERVIEW_SCHEDULED: t(
				"dashboard.statuses.INTERVIEW"
			) as string,
			OFFER_RECEIVED: t("dashboard.statuses.OFFER") as string,
			REJECTED_BY_COMPANY: t(
				"dashboard.statuses.REJECTED_BY_COMPANY"
			) as string,
		}),
		[t]
	);

	const handleSaveNewApplication = async (
		applicationData: ApplicationFormData
	) => {
		try {
			const newApplication = await apiService.post<Application>(
				"/job_applies/jobApply",
				applicationData
			);
			if (newApplication) {
				setApplications((prev) => [newApplication, ...prev]);
			}
			closePopup();
		} catch (err: unknown) {
			console.error(t("dashboard.errors.addError"), err);
		}
	};

	const handleUpdateApplication = async () => {
		if (!selectedApplication) return;
		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, createdAt, ...updateData } = selectedApplication;
			const updatedApp = await apiService.put<Application>(
				`/job_applies/${selectedApplication.id}/status`,
				updateData
			);
			if (updatedApp) {
				setApplications((prev) =>
					prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
				);
			}
			closePopup();
		} catch (err: unknown) {
			console.error(t("dashboard.errors.updateError"), err);
		}
	};

	const handleArchiveApplication = async (id: string) => {
		try {
			await apiService.post(`/job_applies/${id}/archive`, {});
			setApplications((prev) => prev.filter((app) => app.id !== id));
		} catch (err: unknown) {
			console.error(t("dashboard.errors.archiveError"), err);
		}
	};

	const handleDeleteApplication = async (id: string) => {
		try {
			await apiService.delete(`/job_applies/${id}`, {});
			setApplications((prev) => prev.filter((app) => app.id !== id));
		} catch (err: unknown) {
			console.error(t("dashboard.errors.deleteError"), err);
		}
	};

	const handleStatusChange = (statusKey: string) => {
		setSelectedStatuses((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(statusKey)) {
				newSet.delete(statusKey);
			} else {
				newSet.add(statusKey);
			}

			return newSet;
		});
	};

	const sortedAndFilteredApplications = useMemo(() => {
		const lowercasedSearchTerm = searchTerm.toLowerCase();
		return applications
			.filter(
				(app) =>
					(selectedStatuses.size === 0 || selectedStatuses.has(app.status)) &&
					(app.company?.toLowerCase().includes(lowercasedSearchTerm) ||
						app.title?.toLowerCase().includes(lowercasedSearchTerm))
			)
			.sort((a, b) => {
				if (sortBy === "date")
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				if (sortBy === "status")
					return statusMap[a.status as keyof typeof statusMap].localeCompare(
						statusMap[b.status as keyof typeof statusMap]
					);
				return 0;
			});
	}, [applications, selectedStatuses, sortBy, searchTerm, statusMap]);

	const openAddPopup = () => setPopupType("add");
	const openEditPopup = (application: Application) => {
		setSelectedApplication(application);
		setPopupType("edit");
	};
	const openDetailsPopup = (application: Application) => {
		setSelectedApplication(application);
		setPopupType("details");
	};
	const closePopup = () => {
		setSelectedApplication(null);
		setPopupType(null);
	};

	const stats = useMemo(
		() => ({
			total: applications.length,
			pending: applications.filter((app) => app.status === "PENDING").length,
			interview: applications.filter(
				(app) => app.status === "INTERVIEW_SCHEDULED"
			).length,
			offer: applications.filter((app) => app.status === "OFFER_RECEIVED")
				.length,
			refused: applications.filter(
				(app) => app.status === "REJECTED_BY_COMPANY"
			).length,
		}),
		[applications]
	);

	if (error) {
		return (
			<main className={styles.dashboardErrorState}>
				<p>{error}</p>
			</main>
		);
	}

	return (
		<main className={styles.mainContent}>
			<div className={styles.container}>
				<header className={styles.banner}>
					<div className={styles.bannerContent}>
						<h1 className={styles.bannerTitle}>
							{t("dashboard.title") as string}
						</h1>
						<p className={styles.bannerText}>
							{t("dashboard.description") as string}
						</p>
					</div>
					<div className={styles.bannerActions}>
						<button className={styles.addApplicationBtn} onClick={openAddPopup}>
							+ {t("dashboard.addApplication") as string}
						</button>
						<div className={styles.searchContainer} role="search">
							<input
								type="search"
								className={styles.searchInput}
								placeholder={t("dashboard.search.placeholder") as string}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								aria-label={t("dashboard.search.label") as string}
							/>
							<span className={styles.searchIcon} aria-hidden="true">
								🔍
							</span>
						</div>
					</div>
				</header>

				<section
					aria-labelledby="stats-title"
					className={styles.statsContainer}
				>
					<h2 id="stats-title" className={styles.visuallyHidden}>
						Statistiques des candidatures actives
					</h2>
					<div className={styles.statCard}>
						<h3 className={styles.statTitle}>
							{t("shared.stats.totalApplications") as string}
						</h3>
						<p className={styles.statValue}>{stats.total}</p>
					</div>
					<div className={`${styles.statCard} ${styles.pending}`}>
						<h3 className={styles.statTitle}>
							{t("shared.stats.pending") as string}
						</h3>
						<p className={styles.statValue}>{stats.pending}</p>
					</div>
					<div className={`${styles.statCard} ${styles.offer}`}>
						<h3 className={styles.statTitle}>
							{t("shared.stats.offers") as string}
						</h3>
						<p className={styles.statValue}>{stats.offer}</p>
					</div>
					<div className={`${styles.statCard} ${styles.interview}`}>
						<h3 className={styles.statTitle}>
							{t("shared.stats.interviews") as string}
						</h3>
						<p className={styles.statValue}>{stats.interview}</p>
					</div>
					<div className={`${styles.statCard} ${styles.refused}`}>
						<h3 className={styles.statTitle}>
							{t("shared.stats.refused") as string}
						</h3>
						<p className={styles.statValue}>{stats.refused}</p>
					</div>
				</section>

				<section
					aria-labelledby="controls-title"
					className={styles.controlsContainer}
				>
					<h2 id="controls-title" className={styles.visuallyHidden}>
						Contrôles de filtrage, tri et affichage
					</h2>
					<div className={styles.filterContainer}>
						{Object.keys(statusMap).map((statusKey) => (
							<label key={statusKey} className={styles.filterCheckbox}>
								<input
									type="checkbox"
									checked={selectedStatuses.has(statusKey)}
									onChange={() => handleStatusChange(statusKey)}
								/>
								<span className={styles.checkboxLabel}>
									{statusMap[statusKey as keyof typeof statusMap]}
								</span>
							</label>
						))}
					</div>
					<div className={styles.controlsRight}>
						<div className={styles.sortContainer}>
							<label htmlFor="sort-select" className={styles.sortLabel}>
								{t("shared.sorting.label") as string} :
							</label>
							<select
								id="sort-select"
								className={styles.sortSelect}
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as "date" | "status")}
							>
								<option value="date">
									{t("shared.sorting.date") as string}
								</option>
								<option value="status">
									{t("shared.sorting.status") as string}
								</option>
							</select>
						</div>
						<div
							className={styles.viewToggle}
							role="group"
							aria-label={t("shared.viewModes.label") as string}
						>
							<button
								className={`${styles.toggleButton} ${viewMode === "grid" ? styles.active : ""
									}`}
								onClick={() => setViewMode("grid")}
								aria-pressed={viewMode === "grid"}
							>
								{t("shared.viewModes.grid") as string}
							</button>
							<button
								className={`${styles.toggleButton} ${viewMode === "list" ? styles.active : ""
									}`}
								onClick={() => setViewMode("list")}
								aria-pressed={viewMode === "list"}
							>
								{t("shared.viewModes.list") as string}
							</button>
						</div>
					</div>
				</section>

				<section aria-labelledby="applications-list-title">
					<h2 id="applications-list-title" className={styles.visuallyHidden}>
						Liste des candidatures
					</h2>
					{viewMode === "grid" ? (
						<div className={styles.applicationsGrid}>
							{sortedAndFilteredApplications.length > 0 ? (
								sortedAndFilteredApplications.map((app) => (
									<ApplicationCard
										key={app.id}
										application={app as JobApply}
										statusMap={statusMap as Record<ApplicationStatus, string>}
										onEdit={openEditPopup as (application: JobApply) => void}
										onArchive={handleArchiveApplication}
										onDelete={handleDeleteApplication}
										onDetails={
											openDetailsPopup as (application: JobApply) => void
										}
									/>
								))
							) : (
								<div className={styles.emptyState}>
									<div className={styles.emptyIcon}>📂</div>
									<h3 className={styles.emptyTitle}>
										{t("dashboard.empty.title") as string}
									</h3>
									<p className={styles.emptyText}>
										{t("dashboard.empty.text") as string}
									</p>
								</div>
							)}
						</div>
					) : (
						<div className={styles.applicationsList}>
							{sortedAndFilteredApplications.length > 0 ? (
								sortedAndFilteredApplications.map((app) => (
									<ApplicationList
										key={app.id}
										application={app as JobApply}
										statusMap={statusMap as Record<ApplicationStatus, string>}
										onEdit={openEditPopup as (application: JobApply) => void}
										onArchive={handleArchiveApplication}
										onDelete={handleDeleteApplication}
										onDetails={
											openDetailsPopup as (application: JobApply) => void
										}
									/>
								))
							) : (
								<div className={styles.emptyState}>
									<div className={styles.emptyIcon}>📂</div>
									<h3 className={styles.emptyTitle}>
										{t("dashboard.empty.title") as string}
									</h3>
									<p className={styles.emptyText}>
										{t("dashboard.empty.text") as string}
									</p>
								</div>
							)}
						</div>
					)}
				</section>
			</div>

			{popupType === "add" && (
				<AddApplicationModal
					onAdd={handleSaveNewApplication}
					onClose={closePopup}
					statusMap={statusMap}
				/>
			)}
			{popupType === "edit" && selectedApplication && (
				<EditApplicationModal
					application={selectedApplication as JobApply}
					setApplication={
						setSelectedApplication as (application: JobApply) => void
					}
					onUpdate={handleUpdateApplication}
					onClose={closePopup}
					statusMap={statusMap as Record<ApplicationStatus, string>}
				/>
			)}
			{popupType === "details" && selectedApplication && (
				<DetailsModal
					application={selectedApplication as JobApply}
					onClose={closePopup}
					statusMap={statusMap as Record<ApplicationStatus, string>}
				/>
			)}
		</main>
	);
}
