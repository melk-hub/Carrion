"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./DashboardList.module.css";
import Image from "next/image";
import { ApplicationStatus } from "@/enum/application-status.enum";
import { JobApply } from "@/interface/job-apply.interface";
import {
	Eye,
	Pencil,
	Archive,
	Trash2,
	MapPin,
	Calendar,
	DollarSign,
	Building2,
	ArchiveRestore
} from "lucide-react";

function ApplicationList({
	application,
	statusMap,
	onEdit,
	onDetails,
	onDelete,
	onArchive,
}: {
	application: JobApply;
	statusMap: Record<ApplicationStatus, string>;
	onEdit: (application: JobApply) => void;
	onDetails: (application: JobApply) => void;
	onDelete: (id: string) => void;
	onArchive: (id: string) => void;
}) {
	const { t } = useLanguage();
	const pathname = usePathname();

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

	const statusClassName = styles[getStatusClass(application.status)];

	const formatDate = (date: string) => {
		if (!date) return null;
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

	const isArchivePage = pathname.includes("archives");

	return (
		<div className={`${styles.modernApplicationListItem} ${statusClassName || ''}`}>

			<div className={styles.modernListContent}>

				<div className={styles.modernListLogo}>
					{application.imageUrl ? (
						<Image
							src={application.imageUrl}
							alt={`${application.company} logo`}
							className={styles.modernCompanyLogoList}
							width={48}
							height={48}
							unoptimized
						/>
					) : (
						<div className={styles.modernLogoPlaceholderList}>
							<Building2 size={20} />
						</div>
					)}
				</div>

				<div className={styles.modernListInfo}>
					<h3 className={styles.modernCompanyNameList}>
						{application.company || t("dashboard.unknownCompany")}
					</h3>
					<p className={styles.modernJobTitleList}>
						{application.title || t("dashboard.unknownPosition")}
					</p>
				</div>

				<div className={styles.modernStatusBadgeList}>
					<div className={styles.statusIndicatorList}></div>
					<span className={styles.statusTextList}>
						{statusMap[application.status] || t("dashboard.unknownStatus")}
					</span>
				</div>

				<div className={styles.modernListDetails}>

					<div className={styles.detailItemModern}>
						<Calendar size={16} className={styles.detailIcon} />
						<span className={styles.detailText}>
							{formatDate(application.createdAt)}
						</span>
					</div>

					<div className={styles.detailItemModern}>
						<MapPin size={16} className={styles.detailIcon} />
						<span className={styles.detailText}>
							{application.location || t("dashboard.notSpecified")}
						</span>
					</div>

					<div className={styles.detailItemModern}>
						<DollarSign size={16} className={styles.detailIcon} />
						<span className={styles.detailText}>
							{application.salary
								? formatSalary(application.salary)
								: t("dashboard.notSpecified")}
						</span>
					</div>
				</div>

				<div className={styles.modernListActions}>
					<button
						className={`${styles.modernListButton} ${styles.primary}`}
						onClick={() => onDetails(application)}
						title={t("common.details") as string}
					>
						<Eye size={18} />
					</button>

					<button
						className={`${styles.modernListButton} ${styles.secondary}`}
						onClick={() => onEdit(application)}
						title={t("common.edit") as string}
					>
						<Pencil size={18} />
					</button>

					<button
						className={`${styles.modernListButton} ${styles.secondary}`}
						onClick={() => onArchive(application.id)}
						title={isArchivePage ? t("common.unarchive") as string : t("common.archive") as string}
					>
						{isArchivePage ? <ArchiveRestore size={18} /> : <Archive size={18} />}
					</button>

					<button
						className={`${styles.modernListButton} ${styles.danger}`}
						onClick={() => onDelete(application.id)}
						title={t("common.delete") as string}
					>
						<Trash2 size={18} />
					</button>
				</div>

			</div>
		</div>
	);
}

export default ApplicationList;