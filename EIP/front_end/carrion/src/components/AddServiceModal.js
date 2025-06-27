// src/components/AddServiceModal.js

import React from "react";
import { X } from "lucide-react";
// --- MODIFICATIONS ICI ---
import googleLogo from "../assets/google-logo.png";
import outlookLogo from "../assets/outlook-logo.svg";
// -----------------------
import "../styles/AddServiceModal.css";

const AddServiceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Cette fonction gère la redirection vers le backend
  const handleConnect = (serviceProvider) => {
    // Assure-toi que cette variable d'environnement est définie dans ton .env.local du frontend
    const backendUrl =
      process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

    // On redirige vers la route d'INITIATION du backend, PAS la route de callback
    window.location.href = `${backendUrl}/auth/${serviceProvider}/login`;
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Connecter un nouveau service</h3>
          <button
            onClick={onClose}
            className="close-btn"
            aria-label="Fermer la modale"
          >
            <X size={24} />
          </button>
        </header>
        <div className="modal-body">
          <p>Choisissez un service à connecter à votre compte Carrion.</p>
          <div className="service-options">
            {/* Le 'serviceProvider' doit correspondre au nom dans l'URL de ton backend ('google' ou 'microsoft') */}
            <button
              className="service-option"
              onClick={() => handleConnect("google")}
            >
              <img
                src={googleLogo}
                alt="Google"
                className="service-option-icon"
              />
              <span>Connecter Gmail</span>
            </button>
            <button
              className="service-option"
              onClick={() => handleConnect("microsoft")}
            >
              <img
                src={outlookLogo}
                alt="Outlook"
                className="service-option-icon"
              />
              <span>Connecter Outlook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
