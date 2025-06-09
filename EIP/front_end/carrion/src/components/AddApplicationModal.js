"use client"
import React from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/Modal.css"

function AddApplicationModal({ newApplication, setNewApplication, onAdd, onClose, statusMap }) {
  const { t } = useLanguage();
  
  const statusOptions = Object.entries(statusMap).map(([key, value]) => ({
    value: key,
    label: value,
  }))

  const contractTypeOptions = [
    { value: "Full-time", label: t('modal.add.contract_types.full_time') },
    { value: "Part-time", label: t('modal.add.contract_types.part_time') },
    { value: "Internship", label: t('modal.add.contract_types.internship') },
    { value: "Contract", label: t('modal.add.contract_types.contract') },
    { value: "Freelance", label: t('modal.add.contract_types.freelance') },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container modern-modal">
        <div className="modal-header">
          <h2 className="modal-title">{t('modal.add.title')}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <div className="form-grid">
            {/* Première colonne */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="company" className="required-field">
                  {t('modal.add.company')}
                </label>
                <input
                  type="text"
                  id="company"
                  className="modern-input"
                  placeholder={t('modal.add.placeholders.company')}
                  value={newApplication.company || ''}
                  onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="title" className="required-field">
                  {t('modal.add.title_job')}
                </label>
                <input
                  type="text"
                  id="title"
                  className="modern-input"
                  placeholder={t('modal.add.placeholders.title')}
                  value={newApplication.title || ''}
                  onChange={(e) => setNewApplication({ ...newApplication, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  {t('modal.add.location')}
                </label>
                <input
                  type="text"
                  id="location"
                  className="modern-input"
                  placeholder={t('modal.add.placeholders.location')}
                  value={newApplication.location || ''}
                  onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">
                  {t('modal.add.logo_url')}
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  className="modern-input"
                  placeholder={t('modal.add.placeholders.logo_url')}
                  value={newApplication.imageUrl || ''}
                  onChange={(e) => setNewApplication({ ...newApplication, imageUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Deuxième colonne */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="status" className="required-field">
                  {t('modal.add.status')}
                </label>
                <select
                  id="status"
                  className="modern-select"
                  value={newApplication.status || ''}
                  onChange={(e) => setNewApplication({ ...newApplication, status: e.target.value })}
                  required
                >
                  <option value="">{t('modal.add.placeholders.status')}</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contractType">
                  {t('modal.add.contract_type')}
                </label>
                <select
                  id="contractType"
                  className="modern-select"
                  value={newApplication.contractType || "Full-time"}
                  onChange={(e) => setNewApplication({ ...newApplication, contractType: e.target.value })}
                >
                  {contractTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="salary">
                  {t('modal.add.salary')}
                </label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    id="salary"
                    className="modern-input"
                    placeholder={t('modal.add.placeholders.salary')}
                    value={newApplication.salary || ''}
                    onChange={(e) => setNewApplication({ ...newApplication, salary: e.target.value })}
                    min="0"
                    step="1000"
                  />
                  <span className="input-suffix">€</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="interviewDate">
                  {t('modal.add.interview_date')}
                </label>
                <input
                  type="date"
                  id="interviewDate"
                  className="modern-input"
                  value={newApplication.interviewDate || ''}
                  onChange={(e) => setNewApplication({ ...newApplication, interviewDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button 
            className="modal-button primary" 
            onClick={onAdd}
            disabled={!newApplication.company || !newApplication.title || !newApplication.status}
          >
            {t('common.add')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddApplicationModal
