"use client";
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./Dashboardcard.module.css";
import Image from "next/image";
import { ApplicationStatus } from "@/enum/application-status.enum";
import { JobApply } from "@/interface/job-apply.interface";

function ApplicationCard({
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

  return (
    <div
      className={`${styles.modernApplicationCard} ${getStatusClass(
        application.status
      )}`}
    >
      {/* Header avec logo et infos principales */}
      <div className={styles.modernCardHeader}>
        <div className={styles.companyLogoSection}>
          {application.imageUrl ? (
            <Image
              src={application.imageUrl || "/placeholder.svg"}
              alt={`${application.company} logo`}
              className={styles.modernCompanyLogo}
              width={40}
              height={40}
            />
          ) : (
            <div className={styles.modernLogoPlaceholder}>
              {/* Emplacement pour icône entreprise */}
              <Image
                src="/assets/avatar.png"
                alt="Company"
                className={styles.iconPlaceholder}
                width={32}
                height={32}
              />
            </div>
          )}
        </div>

        <div className={styles.companyInfoSection}>
          <h3 className={styles.modernCompanyName}>
            {application.company || t("dashboard.unknownCompany")}
          </h3>
          <p className={styles.modernJobTitle}>
            {application.title || t("dashboard.unknownPosition")}
          </p>
          <div className={styles.contractTypeBadge}>{application.contractType}</div>
          <div
            className={`${styles.modernStatusBadge} ${getStatusClass(
              application.status
            )}`}
          >
            <div className={styles.statusIndicator}></div>
            <span className={styles.statusText}>
              {statusMap[application.status] || t("dashboard.unknownStatus")}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.modernCardContent}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoIconWrapper}>
              <Image
                src="/assets/today.png"
                alt="Date"
                className={styles.infoIcon}
                width={24}
                height={24}
              />
            </div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>
                {t("dashboard.applicationForm.applicationDate")}
              </span>
              <span className={styles.infoValue}>
                {formatDate(application.createdAt)}
              </span>
            </div>
          </div>

          {application.location && (
            <div className={styles.infoItem}>
              <div className={styles.infoIconWrapper}>
                {/* Emplacement pour icône localisation */}
                <Image
                  src="/assets/map.png"
                  alt="Location"
                  className={styles.infoIcon}
                  width={24}
                  height={24}
                />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>
                  {t("dashboard.applicationForm.location")}
                </span>
                <span className={styles.infoValue}>{application.location}</span>
              </div>
            </div>
          )}

          {application.salary && (
            <div className={styles.infoItem}>
              <div className={styles.infoIconWrapper}>
                {/* Emplacement pour icône salaire */}
                <Image
                  src="/assets/money.png"
                  alt="Salary"
                  className={styles.infoIcon}
                  width={24}
                  height={24}
                />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>
                  {t("dashboard.applicationForm.salary")}
                </span>
                <span className={styles.infoValue}>
                  {formatSalary(application.salary)}
                </span>
              </div>
            </div>
          )}

          {application.interviewDate && (
            <div className={styles.infoItem}>
              <div className={styles.infoIconWrapper}>
                {/* Emplacement pour icône entretien */}
                <Image
                  src="/assets/interview.png"
                  alt="Interview"
                  className={styles.infoIcon}
                  width={24}
                  height={24}
                />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>
                  {t("dashboard.applicationForm.interviewDate")}
                </span>
                <span className={styles.infoValue}>
                  {formatDate(application.interviewDate)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.modernCardActions}>
        <button
          className={styles.modernActionButton + " " + styles.primary}
          onClick={() => onDetails(application)}
        >
          <span>{t("common.details")}</span>
        </button>

        <div className={styles.secondaryActions}>
          <button
            className={styles.modernActionButton + " " + styles.primary}
            onClick={() => onEdit(application)}
          >
            <span>{t("common.edit")}</span>
          </button>

          <button
            className={styles.modernActionButton + " " + styles.secondary}
            onClick={() => onArchive(application.id)}
          >
            <span>
              {location.pathname.includes("dashboard")
                ? t("common.dearchive")
                : location.pathname.includes("archives")
                ? t("common.archive")
                : t("common.dearchive")}
            </span>
          </button>

          <button
            className={styles.modernActionButton + " " + styles.danger}
            onClick={() => onDelete(application.id)}
          >
            <span>{t("common.delete")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationCard;
