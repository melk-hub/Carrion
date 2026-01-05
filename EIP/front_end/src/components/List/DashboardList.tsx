"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./DashboardList.module.css";
import Image from "next/image";
import { ApplicationStatus } from "@/enum/application-status.enum";
import { JobApply } from "@/interface/job-apply.interface";

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatSalary = (salary: number) => {
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
      className={styles.modernApplicationListItem + ` ${getStatusClass(
        application.status
      )}`}
    >
      <div className={styles.modernListContent}>
        <div className={styles.modernListLogo}>
          {application.imageUrl ? (
            <Image
              src={application.imageUrl || "/placeholder.svg"}
              alt={`${application.company} logo`}
              className={styles.modernCompanyLogoList}
              width={40}
              height={40}
            />
          ) : (
            <div className={styles.modernLogoPlaceholderList}>
              <Image
                src="/icons/company-placeholder.svg"
                alt="Company"
                className={styles.iconPlaceholder}
                width={24}
                height={24}
              />
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
          <div className={styles.contractTypeBadgeList}>
            {application.contractType
              ? t(`contractTypes.${application.contractType}`) ||
                application.contractType
              : t("contractTypes.FULL_TIME")}
          </div>
        </div>

        <div
          className={styles.modernStatusBadgeList + ` ${getStatusClass(
            application.status
          )}`}
        >
          <div className={styles.statusIndicatorList}></div>
          <span className={styles.statusTextList}>
            {statusMap[application.status] || t("dashboard.unknownStatus")}
          </span>
        </div>

        <div className={styles.modernListDetails}>
          <div className={styles.detailItemModern}>
            <div className={styles.detailIconWrapper}>
              <Image
                src="/icons/calendar.svg"
                alt="Date"
                className={styles.detailIcon}
                width={24}
                height={24}
              />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>
                {t("dashboard.applicationForm.applicationDate")}
              </span>
              <span className={styles.detailValue}>
                {formatDate(application.createdAt)}
              </span>
            </div>
          </div>

          {application.location && (
            <div className={styles.detailItemModern}>
              <div className={styles.detailIconWrapper}>
                <Image
                  src="/icons/location.svg"
                  alt="Location"
                  className={styles.detailIcon}
                  width={24}
                  height={24}
                />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>
                  {t("dashboard.applicationForm.location")}
                </span>
                <span className={styles.detailValue}>{application.location}</span>
              </div>
            </div>
          )}

          {application.salary && (
            <div className={styles.detailItemModern}>
              <div className={styles.detailIconWrapper}>
                <Image
                  src="/icons/salary.svg"
                  alt="Salary"
                  className={styles.detailIcon}
                  width={24}
                  height={24}
                />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>
                  {t("dashboard.applicationForm.salary")}
                </span>
                <span className={styles.detailValue}>
                  {formatSalary(application.salary)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modernListActions}>
          <button
            className={styles.modernListButton + " " + styles.primary}
            onClick={() => onDetails(application)}
            title={t("common.details") as string}
          >
            <div className={styles.listButtonIconWrapper}>
              <Image
                src="/icons/eye.svg"
                alt="Details"
                className={styles.listButtonIcon}
                width={24}
                height={24}
              />
            </div>
          </button>

          <button
            className={styles.modernListButton + " " + styles.secondary}
            onClick={() => onEdit(application)}
            title={t("common.edit") as string}
          >
            <div className={styles.listButtonIconWrapper}>
              <Image
                src="/icons/edit.svg"
                alt="Edit"
                className={styles.listButtonIcon}
                width={24}
                height={24}
              />
            </div>
          </button>

          <button
            className={styles.modernListButton + " " + styles.secondary}
            onClick={() => onArchive(application.id)}
            title={
              (pathname.includes("archives")
                ? t("common.unarchive")
                : t("common.archive")) as string
            }
          >
            <div className={styles.listButtonIconWrapper}>
              <Image
                src="/icons/edit.svg"
                alt="Edit"
                className={styles.listButtonIcon}
                width={24}
                height={24}
              />
            </div>
          </button>

          <button
            className={styles.modernListButton + " " + styles.danger}
            onClick={() => onDelete(application.id)}
            title={t("common.delete") as string}
          >
            <div className={styles.listButtonIconWrapper}>
              <Image
                src="/icons/trash.svg"
                alt="Delete"
                className={styles.listButtonIcon}
                width={24}
                height={24}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationList;
