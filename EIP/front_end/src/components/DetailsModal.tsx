"use client";
import React from "react";
import styles from "./AddApplicationModal/Modal.module.css";
import { useLanguage } from "../contexts/LanguageContext";
import { ApplicationStatus } from "@/enum/application-status.enum";
import Image from "next/image";
import { JobApply } from "@/interface/job-apply.interface";

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
  const getStatusClass = (status: ApplicationStatus) => {
    switch (status) {
      case "APPLIED":
        return "status-accepted";
      case "PENDING":
        return "status-pending";
      case "REJECTED_BY_COMPANY":
        return "status-refused";
      default:
        return "";
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t("dashboard.details.details")}</h2>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.detailsLogo}>
            {application.imageUrl ? (
              <Image
                src={application.imageUrl || "/placeholder.svg"}
                alt={`${application.company} logo`}
                className={styles.companyLogo}
                width={100}
                height={100}
              />
            ) : (
              <div className={styles.logoPlaceholder}>🏢</div>
            )}
          </div>

          <div className={styles.detailsInfo}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("dashboard.details.company")}
              </span>
              <span className={styles.detailValue}>
                {application.company || "Non spécifié"}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("dashboard.details.position")}
              </span>
              <span className={styles.detailValue}>
                {application.title || "Non spécifié"}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("dashboard.details.status")}
              </span>
              <span
                className={`${styles.detailValue} ${getStatusClass(application.status)}`}
              >
                {statusMap[application.status] || "Non spécifié"}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("dashboard.details.date")}
              </span>
              <span className={styles.detailValue}>
                {new Date(application.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>

            {application.location && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>
                  {t("dashboard.details.location")}
                </span>
                <span className={styles.detailValue}>{application.location}</span>
              </div>
            )}

            {application.salary && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>
                  {t("dashboard.details.salary")}
                </span>
                <span className={styles.detailValue}>{application.salary} €</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.modalButton + " " + styles.confirm} onClick={onClose}>
            {t("dashboard.details.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailsModal;
