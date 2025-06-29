import React from "react";
import { X } from "lucide-react";
import "../styles/ServicesCard.css";

import googleLogo from "../assets/google-logo.png";
import outlookLogo from "../assets/outlook-logo.svg";

const ServiceIcon = ({ serviceName }) => {
  if (serviceName.toLowerCase().includes("google")) {
    return (
      <img src={googleLogo} alt="Logo Google" className="service-icon-img" />
    );
  }
  if (serviceName.toLowerCase().includes("microsoft")) {
    return (
      <img
        src={outlookLogo}
        alt="Logo Microsoft"
        className="service-icon-img"
      />
    );
  }
  return null;
};

const ServicesCard = ({
  connectedServices,
  onAddService,
  onDisconnectService,
}) => {
  const formatServiceName = (name) => {
    if (name === "Google_oauth2") return "Google";
    if (name === "Microsoft_oauth2") return "Microsoft Outlook";
    return name;
  };

  return (
    <article className="profile-card services-card">
      <h2>Services Connectés</h2>
      <div className="services-list">
        {connectedServices.length > 0 ? (
          connectedServices.map((service) => (
            <div key={service.name} className="service-item">
              <div className="service-info">
                <div className="service-icon-wrapper">
                  <ServiceIcon serviceName={service.name} />
                </div>
                <span className="service-name">
                  {formatServiceName(service.name)}
                </span>
              </div>
              <button
                className="disconnect-btn"
                onClick={() => onDisconnectService(service.name)}
                aria-label={`Déconnecter ${formatServiceName(service.name)}`}
              >
                <X size={16} />
              </button>
            </div>
          ))
        ) : (
          <p className="no-services-message">Aucun service connecté.</p>
        )}
      </div>
      <button className="add-service-btn" onClick={onAddService}>
        Ajouter un service
      </button>
    </article>
  );
};

export default ServicesCard;
