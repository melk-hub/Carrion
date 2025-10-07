"use client";
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/ApplicationCard.css";
import TodayIcon from "../assets/today.png";
import MoneyIcon from "../assets/money.png";
import LocationIcon from "../assets/map.png";
import InterviewIcon from "../assets/calendar.png";
import CompanyIcon from "../assets/avatar.png";

function ApplicationCard({
  application,
  statusMap,
  onEdit,
  onDelete,
  onDetails,
  onArchive,
}) {
  const { t } = useLanguage();

  const getStatusClass = (status) => {
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatSalary = (salary) => {
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
            <img
              src={application.imageUrl || "/placeholder.svg"}
              alt={`${application.company} logo`}
              className="modern-company-logo"
            />
          ) : (
            <div className="modern-logo-placeholder">
              {/* Emplacement pour icône entreprise */}
              <img
                src={CompanyIcon}
                alt="Company"
                className="icon-placeholder"
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

      {/* Informations détaillées */}
      <div className="modern-card-content">
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon-wrapper">
              {/* Emplacement pour icône calendrier */}
              <img src={TodayIcon} alt="Date" className="info-icon" />
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
                <img src={LocationIcon} alt="Location" className="info-icon" />
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
                <img src={MoneyIcon} alt="Salary" className="info-icon" />
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
                <img
                  src={InterviewIcon}
                  alt="Interview"
                  className="info-icon"
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
