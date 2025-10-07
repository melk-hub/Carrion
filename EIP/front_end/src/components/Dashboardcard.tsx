"use client";
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/ApplicationCard.css";
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
      className={`modern-application-card ${getStatusClass(
        application.status
      )}`}
    >
      {/* Header avec logo et infos principales */}
      <div className="modern-card-header">
        <div className="company-logo-section">
          {application.imageUrl ? (
            <Image
              src={application.imageUrl || "/placeholder.svg"}
              alt={`${application.company} logo`}
              className="modern-company-logo"
              width={40}
              height={40}
            />
          ) : (
            <div className="modern-logo-placeholder">
              {/* Emplacement pour icône entreprise */}
              <Image
                src="/assets/avatar.png"
                alt="Company"
                className="icon-placeholder"
                width={32}
                height={32}
              />
            </div>
          )}
        </div>

        <div className="company-info-section">
          <h3 className="modern-company-name">
            {application.company || t("dashboard.unknownCompany")}
          </h3>
          <p className="modern-job-title">
            {application.title || t("dashboard.unknownPosition")}
          </p>
          <div className="contract-type-badge">{application.contractType}</div>
          <div
            className={`modern-status-badge ${getStatusClass(
              application.status
            )}`}
          >
            <div className="status-indicator"></div>
            <span className="status-text">
              {statusMap[application.status] || t("dashboard.unknownStatus")}
            </span>
          </div>
        </div>
      </div>

      <div className="modern-card-content">
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon-wrapper">
              <Image
                src="/assets/today.png"
                alt="Date"
                className="info-icon"
                width={24}
                height={24}
              />
            </div>
            <div className="info-content">
              <span className="info-label">
                {t("dashboard.applicationForm.applicationDate")}
              </span>
              <span className="info-value">
                {formatDate(application.createdAt)}
              </span>
            </div>
          </div>

          {application.location && (
            <div className="info-item">
              <div className="info-icon-wrapper">
                {/* Emplacement pour icône localisation */}
                <Image
                  src="/assets/map.png"
                  alt="Location"
                  className="info-icon"
                  width={24}
                  height={24}
                />
              </div>
              <div className="info-content">
                <span className="info-label">
                  {t("dashboard.applicationForm.location")}
                </span>
                <span className="info-value">{application.location}</span>
              </div>
            </div>
          )}

          {application.salary && (
            <div className="info-item">
              <div className="info-icon-wrapper">
                {/* Emplacement pour icône salaire */}
                <Image
                  src="/assets/money.png"
                  alt="Salary"
                  className="info-icon"
                  width={24}
                  height={24}
                />
              </div>
              <div className="info-content">
                <span className="info-label">
                  {t("dashboard.applicationForm.salary")}
                </span>
                <span className="info-value">
                  {formatSalary(application.salary)}
                </span>
              </div>
            </div>
          )}

          {application.interviewDate && (
            <div className="info-item">
              <div className="info-icon-wrapper">
                {/* Emplacement pour icône entretien */}
                <Image
                  src="/assets/interview.png"
                  alt="Interview"
                  className="info-icon"
                  width={24}
                  height={24}
                />
              </div>
              <div className="info-content">
                <span className="info-label">
                  {t("dashboard.applicationForm.interviewDate")}
                </span>
                <span className="info-value">
                  {formatDate(application.interviewDate)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="modern-card-actions">
        <button
          className="modern-action-button primary"
          onClick={() => onDetails(application)}
        >
          <span>{t("common.details")}</span>
        </button>

        <div className="secondary-actions">
          <button
            className="modern-action-button secondary"
            onClick={() => onEdit(application)}
          >
            <span>{t("common.edit")}</span>
          </button>

          <button
            className="modern-action-button secondary"
            onClick={() => onArchive(application.id)}
          >
            <span>
              {location.pathname.includes("dashboard")
                ? t("common.archive")
                : location.pathname.includes("archive")
                ? t("common.dearchive")
                : t("common.archive")}
            </span>
          </button>

          <button
            className="modern-action-button danger"
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
