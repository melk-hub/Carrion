import React from "react";
import { X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import googleLogo from "../assets/google-logo.png";
import outlookLogo from "../assets/outlook-logo.svg";

const AddServiceModal = ({ isOpen, onClose, connectedServices }) => {
  if (!isOpen) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { t } = useLanguage();
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
          <h3>{t("profile.connectService")}</h3>
          <button
            onClick={onClose}
            className="close-btn"
            aria-label="Fermer la modale"
          >
            <X size={24} />
          </button>
        </header>
        <div className="modal-body">
          <p>{t("profile.chooseService")}</p>
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
                <span>{t("profile.connectGmail")}</span>
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
                <span>{t("profile.connectOutlook")}</span>
              </button>
            )}

            {isGoogleConnected && isMicrosoftConnected && (
              <p>{t("profile.allConnected")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
