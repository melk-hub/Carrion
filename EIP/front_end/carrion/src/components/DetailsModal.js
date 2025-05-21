"use client"
import React from 'react';
import "../styles/Modal.css"

function DetailsModal({ application, onClose, statusMap }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "ON":
        return "status-accepted"
      case "PENDING":
        return "status-pending"
      case "OFF":
        return "status-refused"
      default:
        return ""
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Détails de la candidature</h2>
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
              <span className="detail-label">Entreprise :</span>
              <span className="detail-value">{application.company || "Non spécifié"}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Poste :</span>
              <span className="detail-value">{application.title || "Non spécifié"}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Statut :</span>
              <span className={`detail-value ${getStatusClass(application.status)}`}>
                {statusMap[application.status] || "Non spécifié"}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Date :</span>
              <span className="detail-value">{new Date(application.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>

            {application.location && (
              <div className="detail-row">
                <span className="detail-label">Lieu :</span>
                <span className="detail-value">{application.location}</span>
              </div>
            )}

            {application.salary && (
              <div className="detail-row">
                <span className="detail-label">Salaire :</span>
                <span className="detail-value">{application.salary} €</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button confirm" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetailsModal
