"use client"
import React from 'react';
import "../styles/ApplicationCard.css"

function ApplicationCard({ application, statusMap, onEdit, onDelete, onDetails }) {
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
    <div className={`application-card ${getStatusClass(application.status)}`}>
      <div className="card-header">
        <div className="card-logo-container">
          {application.imageUrl ? (
            <img
              src={application.imageUrl || "/placeholder.svg"}
              alt={`${application.company} logo`}
              className="card-logo"
            />
          ) : (
            <div className="card-logo-placeholder">🏢</div>
          )}
        </div>
        <div className="card-company">
          <h3 className="company-name">{application.company || "Entreprise inconnue"}</h3>
          <p className="job-title">{application.title || "Poste inconnu"}</p>
        </div>
        <div className={`status-badge ${getStatusClass(application.status)}`}>
          {statusMap[application.status] || "Statut inconnu"}
        </div>
      </div>

      <div className="card-content">
        <div className="card-info">
          <div className="info-item">
            <span className="info-icon">📅</span>
            <span className="info-text">
              Postuler le: {new Date(application.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
          {application.location && (
            <div className="info-item">
              <span className="info-icon">📍</span>
              <span className="info-text">{application.location}</span>
            </div>
          )}
        </div>

        <div className="card-actions">
          <button className="details-button" onClick={() => onDetails(application)}>
            Voir les détails
          </button>

          <div className="action-buttons">
            <button className="edit-button" onClick={() => onEdit(application)}>
              ✏️ Modifier
            </button>
            <button className="delete-button" onClick={() => onDelete(application.id)}>
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationCard
