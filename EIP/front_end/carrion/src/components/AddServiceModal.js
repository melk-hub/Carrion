import React from "react";
import { X } from "lucide-react";

import googleLogo from "../assets/google-logo.png";
import outlookLogo from "../assets/outlook-logo.svg";

import "../styles/AddServiceModal.css";

const AddServiceModal = ({ isOpen, onClose, connectedServices }) => {
  if (!isOpen) return null;

  const API_URL = process.env.REACT_APP_API_URL;

  const handleConnect = (serviceProvider) => {
    window.location.href = `${API_URL}/auth/${serviceProvider}/link`;
    onClose();
  };

  const isGoogleConnected = connectedServices.some(
    (service) => service.name === "Google_oauth2"
  );
  const isMicrosoftConnected = connectedServices.some(
    (service) => service.name === "Microsoft_oauth2"
  );

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
            {!isGoogleConnected && (
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
            )}

            {!isMicrosoftConnected && (
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
            )}

            {isGoogleConnected && isMicrosoftConnected && (
              <p>Tous les services disponibles sont déjà connectés.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
