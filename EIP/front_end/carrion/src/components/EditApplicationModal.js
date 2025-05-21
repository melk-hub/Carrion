"use client"
import React from 'react';
import "../styles/Modal.css"

function EditApplicationModal({ application, setApplication, onUpdate, onClose, statusMap }) {
  const statusOptions = Object.entries(statusMap).map(([key, value]) => ({
    value: key,
    label: value,
  }))

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Modifier la candidature</h2>
        </div>

        <div className="modal-content">
          <div className="form-group">
            <label htmlFor="company">Entreprise :</label>
            <input
              type="text"
              id="company"
              value={application.company}
              onChange={(e) => setApplication({ ...application, company: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Poste :</label>
            <input
              type="text"
              id="title"
              value={application.title}
              onChange={(e) => setApplication({ ...application, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Statut :</label>
            <select
              id="status"
              value={application.status}
              onChange={(e) => setApplication({ ...application, status: e.target.value })}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button cancel" onClick={onClose}>
            Annuler
          </button>
          <button className="modal-button confirm" onClick={onUpdate}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditApplicationModal
