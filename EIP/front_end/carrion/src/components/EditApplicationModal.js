"use client"
import React from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/Modal.css"

function EditApplicationModal({ application, setApplication, onUpdate, onClose, statusMap }) {
  const { t } = useLanguage();
  
  const statusOptions = Object.entries(statusMap).map(([key, value]) => ({
    value: key,
    label: value,
  }))

  const contractTypeOptions = [
    { value: "Full-time", label: t('contractTypes.FULL_TIME') },
    { value: "Part-time", label: t('contractTypes.PART_TIME') },
    { value: "Internship", label: t('contractTypes.INTERNSHIP') },
    { value: "Contract", label: t('contractTypes.CDI') },
    { value: "Freelance", label: t('contractTypes.FREELANCE') },
  ];

  // Format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container modern-modal">
        <div className="modal-header">
          <h2 className="modal-title">{t('modal.edit.title')}</h2>
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
                  value={application.company || ''}
                  onChange={(e) => setApplication({ ...application, company: e.target.value })}
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
                  value={application.title || ''}
                  onChange={(e) => setApplication({ ...application, title: e.target.value })}
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
                  value={application.location || ''}
                  onChange={(e) => setApplication({ ...application, location: e.target.value })}
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
                  value={application.imageUrl || ''}
                  onChange={(e) => setApplication({ ...application, imageUrl: e.target.value })}
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
                  value={application.status || ''}
                  onChange={(e) => setApplication({ ...application, status: e.target.value })}
                  required
                >
                  <option value="" disabled hidden></option>
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
                  value={application.contractType || "Full-time"}
                  onChange={(e) => setApplication({ ...application, contractType: e.target.value })}
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
                    value={application.salary || ''}
                    onChange={(e) => setApplication({ ...application, salary: e.target.value })}
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
                  value={formatDateForInput(application.interviewDate)}
                  onChange={(e) => setApplication({ ...application, interviewDate: e.target.value })}
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
            onClick={onUpdate}
            disabled={!application.company || !application.title || !application.status}
          >
            {t('common.update')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditApplicationModal
