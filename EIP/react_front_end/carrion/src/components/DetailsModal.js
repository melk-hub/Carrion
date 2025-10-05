"use client"
import React from 'react';
import "../styles/Modal.css"
import { useLanguage } from "../contexts/LanguageContext"

function DetailsModal({ application, onClose, statusMap }) {
  const { t } = useLanguage()
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

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{t("dashboard.details.details")}</h2>
        </div>

        <div className="modal-content">
          <div className="details-logo">
            {application.imageUrl ? (
              <img
                src={application.imageUrl || "/placeholder.svg"}
                alt={`${application.company} logo`}
                className="company-logo"
              />
            ) : (
              <div className="logo-placeholder">🏢</div>
            )}
          </div>

          <div className="details-info">
            <div className="detail-row">
              <span className="detail-label">{t("dashboard.details.company")}</span>
              <span className="detail-value">{application.company || "Non spécifié"}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t("dashboard.details.position")}</span>
              <span className="detail-value">{application.title || "Non spécifié"}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t("dashboard.details.status")}</span>
              <span className={`detail-value ${getStatusClass(application.status)}`}>
                {statusMap[application.status] || "Non spécifié"}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t("dashboard.details.date")}</span>
              <span className="detail-value">{new Date(application.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>

            {application.location && (
              <div className="detail-row">
                <span className="detail-label">{t("dashboard.details.location")}</span>
                <span className="detail-value">{application.location}</span>
              </div>
            )}

            {application.salary && (
              <div className="detail-row">
                <span className="detail-label">{t("dashboard.details.salary")}</span>
                <span className="detail-value">{application.salary} €</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button confirm" onClick={onClose}>
            {t("dashboard.details.close")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetailsModal
