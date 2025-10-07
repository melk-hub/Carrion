import React from "react";
import { X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import Image from "next/image";

const AddServiceModal = ({
  isOpen,
  onClose,
  connectedServices,
}: {
  isOpen: boolean;
  onClose: () => void;
  connectedServices: { name: string }[];
}) => {
  const { t } = useLanguage();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!isOpen) return null;

  const handleConnect = (serviceProvider: string) => {
    window.location.href = `${API_URL}/auth/${serviceProvider}/link`;
    onClose();
  };

  const isGoogleConnected = connectedServices.some(
    (service: { name: string }) => service.name === "Google_oauth2"
  );
  const isMicrosoftConnected = connectedServices.some(
    (service: { name: string }) => service.name === "Microsoft_oauth2"
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
                <Image
                  src="/assets/google-logo.png"
                  alt="Google"
                  className="service-option-icon"
                  width={32}
                  height={32}
                />
                <span>{t("profile.connectGmail")}</span>
              </button>
            )}

            {!isMicrosoftConnected && (
              <button
                className="service-option"
                onClick={() => handleConnect("microsoft")}
              >
                <Image
                  src="/assets/outlook-logo.svg"
                  alt="Outlook"
                  className="service-option-icon"
                  width={32}
                  height={32}
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
