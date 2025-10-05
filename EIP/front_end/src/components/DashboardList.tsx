"use client"
import React from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/ApplicationList.css"

function ApplicationList({ application, statusMap, onEdit, onDelete, onDetails, onArchive }) {
  const { t } = useLanguage();
  
  const getStatusClass = (status) => {
    switch (status) {
      case "APPLIED":
        return "status-accepted"
      case "PENDING":
        return "status-pending"
      case "REJECTED_BY_COMPANY":
        return "status-refused"
      default:
        return ""
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  const formatSalary = (salary) => {
    if (!salary) return null;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  }

  return (
    <div className={`modern-application-list-item ${getStatusClass(application.status)}`}>
      <div className="modern-list-content">
        {/* Logo section */}
        <div className="modern-list-logo">
          {application.imageUrl ? (
            <img
              src={application.imageUrl || "/placeholder.svg"}
              alt={`${application.company} logo`}
              className="modern-company-logo-list"
            />
          ) : (
            <div className="modern-logo-placeholder-list">
              {/* Emplacement pour icône entreprise */}
              <img src="/icons/company-placeholder.svg" alt="Company" className="icon-placeholder" />
            </div>
          )}
        </div>

        {/* Company info */}
        <div className="modern-list-info">
          <h3 className="modern-company-name-list">{application.company || t("dashboard.unknownCompany")}</h3>
          <p className="modern-job-title-list">{application.title || t("dashboard.unknownPosition")}</p>
          <div className="contract-type-badge-list">
            {application.contractType ? t(`contractTypes.${application.contractType}`) || application.contractType : t("contractTypes.FULL_TIME")}
          </div>
        </div>

        {/* Status */}
        <div className={`modern-status-badge-list ${getStatusClass(application.status)}`}>
          <div className="status-indicator-list"></div>
          <span className="status-text-list">{statusMap[application.status] || t("dashboard.unknownStatus")}</span>
        </div>

        {/* Details list */}
        <div className="modern-list-details">
          <div className="detail-item-modern">
            <div className="detail-icon-wrapper">
              {/* Emplacement pour icône calendrier */}
              <img src="/icons/calendar.svg" alt="Date" className="detail-icon" />
            </div>
            <div className="detail-content">
              <span className="detail-label">{t("dashboard.applicationForm.applicationDate")}</span>
              <span className="detail-value">{formatDate(application.createdAt)}</span>
            </div>
          </div>

          {application.location && (
            <div className="detail-item-modern">
              <div className="detail-icon-wrapper">
                {/* Emplacement pour icône localisation */}
                <img src="/icons/location.svg" alt="Location" className="detail-icon" />
              </div>
              <div className="detail-content">
                <span className="detail-label">{t("dashboard.applicationForm.location")}</span>
                <span className="detail-value">{application.location}</span>
              </div>
            </div>
          )}

          {application.salary && (
            <div className="detail-item-modern">
              <div className="detail-icon-wrapper">
                {/* Emplacement pour icône salaire */}
                <img src="/icons/salary.svg" alt="Salary" className="detail-icon" />
              </div>
              <div className="detail-content">
                <span className="detail-label">{t("dashboard.applicationForm.salary")}</span>
                <span className="detail-value">{formatSalary(application.salary)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modern-list-actions">
          <button className="modern-list-button primary" onClick={() => onDetails(application)} title={t("common.details")}>
            <div className="list-button-icon-wrapper">
              {/* Emplacement pour icône détails */}
              <img src="/icons/eye.svg" alt="Details" className="list-button-icon" />
            </div>
          </button>
          
          <button className="modern-list-button secondary" onClick={() => onEdit(application)} title={t("common.edit")}>
            <div className="list-button-icon-wrapper">
              {/* Emplacement pour icône éditer */}
              <img src="/icons/edit.svg" alt="Edit" className="list-button-icon" />
            </div>
          </button>
          
          <button className="modern-list-button secondary" onClick={() => onArchive(application.id)} title={location.pathname.includes("dashboard") ? t("common.archive") : location.pathname.includes("archive") ? t("common.dearchive") : t("common.archive")}>
            <div className="list-button-icon-wrapper">
              {/* Emplacement pour icône éditer */}
              <img src="/icons/edit.svg" alt="Edit" className="list-button-icon" />
            </div>
          </button>
          
          <button className="modern-list-button danger" onClick={() => onDelete(application.id)} title={t("common.delete")}>
            <div className="list-button-icon-wrapper">
              {/* Emplacement pour icône supprimer */}
              <img src="/icons/trash.svg" alt="Delete" className="list-button-icon" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationList
