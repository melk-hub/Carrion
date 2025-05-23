"use client"
import React from 'react';
import "../styles/ApplicationList.css"

function ApplicationList({ application, statusMap, onEdit, onDelete, onDetails }) {
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
    <div className={`application-list-item ${getStatusClass(application.status)}`}>
      <div className="list-item-content">
        <div className="list-item-logo">
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

        <div className="list-item-info">
          <h3 className="company-name">{application.company || "Entreprise inconnue"}</h3>
          <p className="job-title">{application.title || "Poste inconnu"}</p>
        </div>

        <div className="list-item-details">
          <div className={`status-badge ${getStatusClass(application.status)}`}>
            {statusMap[application.status] || "Statut inconnu"}
          </div>

          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span>{new Date(application.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>

          {application.location && (
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <span>{application.location}</span>
            </div>
          )}
        </div>

        <div className="list-item-actions">
          <button className="action-button" onClick={() => onDetails(application)}>
            Détails
          </button>
          <button className="action-button edit" onClick={() => onEdit(application)}>
            ✏️ Modifier
          </button>
          <button className="action-button delete" onClick={() => onDelete(application.id)}>
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationList
