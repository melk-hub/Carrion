"use client";
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import Select from "react-select";
import "../styles/AddApplicationModal.css";

function AddApplicationModal({
  newApplication,
  setNewApplication,
  onAdd,
  onClose,
  statusMap,
}) {
  const { t } = useLanguage();

  const statusOptions = Object.entries(statusMap).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  const contractTypeOptions = [
    { value: "Full-time", label: t("modal.add.contract_types.full_time") },
    { value: "Part-time", label: t("modal.add.contract_types.part_time") },
    { value: "Internship", label: t("modal.add.contract_types.internship") },
    { value: "Contract", label: t("modal.add.contract_types.contract") },
    { value: "Freelance", label: t("modal.add.contract_types.freelance") },
  ];

  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 10001 }),
  };

  return (
    <div className="app-modal-overlay">
      <div className="app-modal-container">
        <div className="app-modal-header">
          <h2 className="app-modal-title">{t("modal.add.title")}</h2>
          <button className="app-modal-close-btn" onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="app-modal-content">
          <div className="app-modal-grid">
            {/* Colonne de Gauche */}
            <div className="app-modal-column">
              <div className="app-modal-form-group">
                <label htmlFor="company" className="required-field">
                  {t("modal.add.company")}
                </label>
                <input
                  type="text"
                  id="company"
                  className="app-modal-input"
                  placeholder={t("modal.add.placeholders.company")}
                  value={newApplication.company || ""}
                  onChange={(e) =>
                    setNewApplication({
                      ...newApplication,
                      company: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="app-modal-form-group">
                <label htmlFor="title" className="required-field">
                  {t("modal.add.title_job")}
                </label>
                <input
                  type="text"
                  id="title"
                  className="app-modal-input"
                  placeholder={t("modal.add.placeholders.title")}
                  value={newApplication.title || ""}
                  onChange={(e) =>
                    setNewApplication({
                      ...newApplication,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="app-modal-form-group">
                <label htmlFor="location">{t("modal.add.location")}</label>
                <input
                  type="text"
                  id="location"
                  className="app-modal-input"
                  placeholder={t("modal.add.placeholders.location")}
                  value={newApplication.location || ""}
                  onChange={(e) =>
                    setNewApplication({
                      ...newApplication,
                      location: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Colonne de Droite */}
            <div className="app-modal-column">
              <div className="app-modal-form-group">
                <label htmlFor="status" className="required-field">
                  {t("modal.add.status")}
                </label>
                <Select
                  inputId="status"
                  classNamePrefix="app-modal-select"
                  options={statusOptions}
                  value={statusOptions.find(
                    (option) => option.value === newApplication.status
                  )}
                  onChange={(option) =>
                    setNewApplication({
                      ...newApplication,
                      status: option.value,
                    })
                  }
                  placeholder={statusOptions[0].label}
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  required
                />
              </div>

              <div className="app-modal-form-group">
                <label htmlFor="contractType">
                  {t("modal.add.contract_type")}
                </label>
                <Select
                  inputId="contractType"
                  classNamePrefix="app-modal-select"
                  options={contractTypeOptions}
                  value={contractTypeOptions.find(
                    (option) => option.value === newApplication.contractType
                  )}
                  onChange={(option) =>
                    setNewApplication({
                      ...newApplication,
                      contractType: option.value,
                    })
                  }
                  defaultValue={contractTypeOptions[0]}
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                />
              </div>

              <div className="app-modal-form-group">
                <label htmlFor="salary">{t("modal.add.salary")}</label>
                <div className="app-modal-input-with-suffix">
                  <input
                    type="number"
                    id="salary"
                    className="app-modal-input"
                    placeholder={t("modal.add.placeholders.salary")}
                    value={newApplication.salary || ""}
                    onChange={(e) =>
                      setNewApplication({
                        ...newApplication,
                        salary: e.target.value,
                      })
                    }
                    min="0"
                    step="1000"
                  />
                  <span className="app-modal-input-suffix">€</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="app-modal-footer">
          <button className="app-modal-button secondary" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className="app-modal-button primary"
            onClick={onAdd}
            disabled={
              !newApplication.company ||
              !newApplication.title ||
              !newApplication.status
            }
          >
            {t("common.add")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddApplicationModal;
