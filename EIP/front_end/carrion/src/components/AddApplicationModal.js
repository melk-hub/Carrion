"use client"
import React from 'react';
import "../styles/Modal.css"

function AddApplicationModal({ newApplication, setNewApplication, onAdd, onClose, statusMap }) {
  const statusOptions = Object.entries(statusMap).map(([key, value]) => ({
    value: key,
    label: value,
  }))

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Ajouter une candidature</h2>
        </div>

        <div className="modal-content">
          <div className="form-group">
            <label htmlFor="company">Entreprise :</label>
            <input
              type="text"
              id="company"
              value={newApplication.company}
              onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Poste :</label>
            <input
              type="text"
              id="title"
              value={newApplication.title}
              onChange={(e) => setNewApplication({ ...newApplication, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Statut :</label>
            <select
              id="status"
              value={newApplication.status}
              onChange={(e) => setNewApplication({ ...newApplication, status: e.target.value })}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Lieu :</label>
            <input
              type="text"
              id="location"
              value={newApplication.location}
              onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salaire :</label>
            <input
              type="text"
              id="salary"
              value={newApplication.salary}
              onChange={(e) => setNewApplication({ ...newApplication, salary: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Logo URL :</label>
            <input
              type="text"
              id="imageUrl"
              value={newApplication.imageUrl}
              onChange={(e) => setNewApplication({ ...newApplication, imageUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button cancel" onClick={onClose}>
            Annuler
          </button>
          <button className="modal-button confirm" onClick={onAdd}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddApplicationModal
