"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./Dashboardcard.module.css";
import { ApplicationStatus } from "@/enum/application-status.enum";
import { JobApply } from "@/interface/job-apply.interface";
import { FiMapPin, FiCalendar, FiDollarSign } from "react-icons/fi";

interface ApplicationCardProps {
	application: JobApply;
	statusMap: Record<ApplicationStatus, string>;
	onEdit: (application: JobApply) => void;
	onDetails: (application: JobApply) => void;
	onDelete: (id: string) => void;
	onArchive: (id: string) => void;
}

function ApplicationCard({
	application,
	statusMap,
	onEdit,
	onDetails,
	onDelete,
	onArchive,
}: ApplicationCardProps) {
	const { t } = useLanguage();
	const pathname = usePathname();

	const getStatusLabel = (status: ApplicationStatus) => {
		return statusMap[status] || t("dashboard.unknownStatus");
	};

	const getStatusClass = (status: ApplicationStatus) => {
		switch (status) {
			case ApplicationStatus.APPLIED:
				return "status-accepted";
			case ApplicationStatus.PENDING:
				return "status-pending";
			case ApplicationStatus.REJECTED_BY_COMPANY:
				return "status-refused";
			case ApplicationStatus.INTERVIEW_SCHEDULED:
				return "status-interview";
			case ApplicationStatus.OFFER_RECEIVED:
				return "status-offer";
			default:
				return "";
		}
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const formatSalary = (salary: number | null) => {
		if (!salary) return null;
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "EUR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(salary);
	};

	const isArchivePage = pathname?.includes("/archives");

	return (
		<div
			className={`${styles.modernApplicationCard} ${getStatusClass(
				application.status
			)}`}
		>
			<div className={styles.modernCardHeader}>
				<div className={styles.companyLogoSection}>
					{application.imageUrl ? (
						<Image
							src={application.imageUrl}
							alt={`${application.company} logo`}
							className={styles.modernCompanyLogo}
							width={48}
							height={48}
							unoptimized
						/>
					) : (
						<div className={styles.modernLogoPlaceholder}>
							<span className={styles.logoInitial}>
								{application.company ? application.company.charAt(0).toUpperCase() : "?"}
							</span>
						</div>
					)}
				</div>

				<div className={styles.companyInfoSection}>
					<div className={styles.headerTopRow}>
						<h3 className={styles.modernCompanyName}>
							{application.company || t("dashboard.unknownCompany")}
						</h3>
						{application.contractType && (
							<span className={styles.contractTypeBadge}>
								{application.contractType}
							</span>
						)}
					</div>

					<p className={styles.modernJobTitle}>
						{application.title || t("dashboard.unknownPosition")}
					</p>

					<div
						className={`${styles.modernStatusBadge} ${getStatusClass(
							application.status
						)}`}
					>
						<div className={styles.statusIndicator}></div>
						<span className={styles.statusText}>
							{getStatusLabel(application.status)}
						</span>
					</div>
				</div>
			</div>

			<div className={styles.modernCardContent}>
				<div className={styles.infoGrid}>
					<div className={styles.infoItem}>
						<FiMapPin className={styles.infoIcon} />
						<span>{application.location || t("common.noLocation")}</span>
					</div>

					<div className={styles.infoItem}>
						<FiCalendar className={styles.infoIcon} />
						<span>{formatDate(application.createdAt)}</span>
					</div>

					{application.salary && (
						<div className={styles.infoItem}>
							<FiDollarSign className={styles.infoIcon} />
							<span>{formatSalary(application.salary)}</span>
						</div>
					)}
				</div>
			</div>

			<div className={styles.modernCardActions}>
				<button
					className={`${styles.modernActionButton} ${styles.primary}`}
					onClick={() => onDetails(application)}
					title={t("common.details") as string}
				>
					{t("common.details")}
				</button>

				<div className={styles.secondaryActions}>
					<button
						className={`${styles.modernActionButton} ${styles.secondary}`}
						onClick={() => onEdit(application)}
						title={t("common.edit") as string}
					>
						{t("common.edit")}
					</button>

					<button
						className={`${styles.modernActionButton} ${styles.secondary}`}
						onClick={() => onArchive(application.id)}
						title={isArchivePage ? t("common.unarchive") as string : t("common.archive") as string}
					>
						{isArchivePage ? t("common.unarchive") : t("common.archive")}
					</button>

					<button
						className={`${styles.modernActionButton} ${styles.danger}`}
						onClick={() => onDelete(application.id)}
						title={t("common.delete") as string}
					>
						{t("common.delete")}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ApplicationCard;