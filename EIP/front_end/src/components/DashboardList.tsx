"use client";
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/ApplicationList.css";
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
      className={`modern-application-list-item ${getStatusClass(
        application.status
      )}`}
    >
      <div className="modern-list-content">
        {/* Logo section */}
        <div className="modern-list-logo">
          {application.imageUrl ? (
            <Image
              src={application.imageUrl || "/placeholder.svg"}
              alt={`${application.company} logo`}
              className="modern-company-logo-list"
              width={40}
              height={40}
            />
          ) : (
            <div className="modern-logo-placeholder-list">
              {/* Emplacement pour icône entreprise */}
              <Image
                src="/icons/company-placeholder.svg"
                alt="Company"
                className="icon-placeholder"
                width={24}
                height={24}
              />
            </div>
          )}
        </div>

        {/* Company info */}
        <div className="modern-list-info">
          <h3 className="modern-company-name-list">
            {application.company || t("dashboard.unknownCompany")}
          </h3>
          <p className="modern-job-title-list">
            {application.title || t("dashboard.unknownPosition")}
          </p>
          <div className="contract-type-badge-list">
            {application.contractType
              ? t(`contractTypes.${application.contractType}`) ||
                application.contractType
              : t("contractTypes.FULL_TIME")}
          </div>
        </div>

        {/* Status */}
        <div
          className={`modern-status-badge-list ${getStatusClass(
            application.status
          )}`}
        >
          <div className="status-indicator-list"></div>
          <span className="status-text-list">
            {statusMap[application.status] || t("dashboard.unknownStatus")}
          </span>
        </div>

        {/* Details list */}
        <div className="modern-list-details">
          <div className="detail-item-modern">
            <div className="detail-icon-wrapper">
              {/* Emplacement pour icône calendrier */}
              <Image
                src="/icons/calendar.svg"
                alt="Date"
                className="detail-icon"
                width={24}
                height={24}
              />
            </div>
            <div className="detail-content">
              <span className="detail-label">
                {t("dashboard.applicationForm.applicationDate")}
              </span>
              <span className="detail-value">
                {formatDate(application.createdAt)}
              </span>
            </div>
          </div>

          {application.location && (
            <div className="detail-item-modern">
              <div className="detail-icon-wrapper">
                {/* Emplacement pour icône localisation */}
                <Image
                  src="/icons/location.svg"
                  alt="Location"
                  className="detail-icon"
                  width={24}
                  height={24}
                />
              </div>
              <div className="detail-content">
                <span className="detail-label">
                  {t("dashboard.applicationForm.location")}
                </span>
                <span className="detail-value">{application.location}</span>
              </div>
            </div>
          )}

          {application.salary && (
            <div className="detail-item-modern">
              <div className="detail-icon-wrapper">
                {/* Emplacement pour icône salaire */}
                <Image
                  src="/icons/salary.svg"
                  alt="Salary"
                  className="detail-icon"
                  width={24}
                  height={24}
                />
              </div>
              <div className="detail-content">
                <span className="detail-label">
                  {t("dashboard.applicationForm.salary")}
                </span>
                <span className="detail-value">
                  {formatSalary(application.salary)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modern-list-actions">
          <button
            className="modern-list-button primary"
            onClick={() => onDetails(application)}
            title={t("common.details") as string}
          >
            <div className="list-button-icon-wrapper">
              {/* Emplacement pour icône détails */}
              <Image
                src="/icons/eye.svg"
                alt="Details"
                className="list-button-icon"
              />
            </div>
          </button>

          <button
            className="modern-list-button secondary"
            onClick={() => onEdit(application)}
            title={t("common.edit") as string}
          >
            <div className="list-button-icon-wrapper">
              {/* Emplacement pour icône éditer */}
              <Image
                src="/icons/edit.svg"
                alt="Edit"
                className="list-button-icon"
                width={24}
                height={24}
              />
            </div>
          </button>

          <button
            className="modern-list-button secondary"
            onClick={() => onArchive(application.id)}
            title={
              (location.pathname.includes("dashboard")
                ? t("common.archive")
                : location.pathname.includes("archive")
                ? t("common.dearchive")
                : t("common.archive")) as string
            }
          >
            <div className="list-button-icon-wrapper">
              {/* Emplacement pour icône éditer */}
              <Image
                src="/icons/edit.svg"
                alt="Edit"
                className="list-button-icon"
              />
            </div>
          </button>

          <button
            className="modern-list-button danger"
            onClick={() => onDelete(application.id)}
            title={t("common.delete") as string}
          >
            <div className="list-button-icon-wrapper">
              {/* Emplacement pour icône supprimer */}
              <Image
                src="/icons/trash.svg"
                alt="Delete"
                className="list-button-icon"
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
