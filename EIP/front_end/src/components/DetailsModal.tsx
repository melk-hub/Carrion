"use client";
import React from "react";
import styles from "./AddApplicationModal/Modal.module.css";
import { useLanguage } from "../contexts/LanguageContext";
import { ApplicationStatus } from "@/enum/application-status.enum";
import Image from "next/image";
import { JobApply } from "@/interface/job-apply.interface";
import {
	X,
	Building2,
	MapPin,
	Calendar,
	Euro,
	Briefcase,
	CheckCircle2,
	Clock,
	XCircle,
	CalendarClock,
	Trophy
} from "lucide-react";

function DetailsModal({
	application,
	onClose,
	statusMap,
}: {
	application: JobApply;
	onClose: () => void;
	statusMap: Record<ApplicationStatus, string>;
}) {
	const { t } = useLanguage();

	const getStatusConfig = (status: ApplicationStatus) => {
		switch (status) {
			case ApplicationStatus.APPLIED:
				return { class: "status-accepted", icon: <CheckCircle2 size={16} /> };
			case ApplicationStatus.PENDING:
				return { class: "status-pending", icon: <Clock size={16} /> };
			case ApplicationStatus.REJECTED_BY_COMPANY:
				return { class: "status-refused", icon: <XCircle size={16} /> };
			case ApplicationStatus.INTERVIEW_SCHEDULED:
				return { class: "status-interview", icon: <CalendarClock size={16} /> };
			case ApplicationStatus.OFFER_RECEIVED:
				return { class: "status-offer", icon: <Trophy size={16} /> };
			default:
				return { class: "", icon: null };
		}
	};

	const statusConfig = getStatusConfig(application.status);

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>

				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>{t("dashboard.details.details")}</h2>
					<button className={styles.modalCloseBtn} onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				<div className={styles.modalContent}>
					<div className={styles.detailsHeaderSection}>
						<div className={styles.detailsLogoWrapper}>
							{application.imageUrl ? (
								<Image
									src={application.imageUrl}
									alt={`${application.company} logo`}
									className={styles.detailsCompanyLogo}
									width={80}
									height={80}
									unoptimized
								/>
							) : (
								<div className={styles.detailsLogoPlaceholder}>
									<Building2 size={32} strokeWidth={1.5} />
								</div>
							)}
						</div>

						<div className={styles.detailsTitleGroup}>
							<h3 className={styles.detailsJobTitle}>{application.title || "Poste inconnu"}</h3>
							<p className={styles.detailsCompanyName}>{application.company || "Entreprise inconnue"}</p>

							<div className={`${styles.detailsStatusBadge} ${styles[statusConfig.class]}`}>
								{statusConfig.icon}
								<span>{statusMap[application.status] || "Statut inconnu"}</span>
							</div>
						</div>
					</div>

					<div className={styles.separator} />

					<div className={styles.detailsGrid}>

						<div className={styles.detailCardItem}>
							<div className={styles.detailIconWrapper}>
								<MapPin size={18} />
							</div>
							<div className={styles.detailTextContent}>
								<span className={styles.detailLabel}>{t("dashboard.details.location")}</span>
								<span className={styles.detailValue}>{application.location || "Non spécifié"}</span>
							</div>
						</div>

						<div className={styles.detailCardItem}>
							<div className={styles.detailIconWrapper}>
								<Calendar size={18} />
							</div>
							<div className={styles.detailTextContent}>
								<span className={styles.detailLabel}>{t("dashboard.details.date")}</span>
								<span className={styles.detailValue}>
									{new Date(application.createdAt).toLocaleDateString("fr-FR", {
										day: "numeric", month: "long", year: "numeric"
									})}
								</span>
							</div>
						</div>

						<div className={styles.detailCardItem}>
							<div className={styles.detailIconWrapper}>
								<Euro size={18} />
							</div>
							<div className={styles.detailTextContent}>
								<span className={styles.detailLabel}>{t("dashboard.details.salary")}</span>
								<span className={styles.detailValue}>
									{application.salary
										? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(application.salary)
										: "Non spécifié"}
								</span>
							</div>
						</div>

						<div className={styles.detailCardItem}>
							<div className={styles.detailIconWrapper}>
								<Briefcase size={18} />
							</div>
							<div className={styles.detailTextContent}>
								<span className={styles.detailLabel}>{t("dashboard.details.contractType") || "Contrat"}</span>
								<span className={styles.detailValue}>{application.contractType || "Non spécifié"}</span>
							</div>
						</div>

					</div>
				</div>

				<div className={styles.modalFooter}>
					<button className={`${styles.modalButton} ${styles.primary}`} onClick={onClose}>
						{t("dashboard.details.close")}
					</button>
				</div>
			</div>
		</div>
	);
}

export default DetailsModal;