import React from "react";
import { Plus } from "lucide-react";

import googleLogo from "../assets/google-logo.png";
import outlookLogo from "../assets/outlook-logo.svg";

import "../styles/ServicesCard.css";

const serviceIcons = {
  gmail: { icon: <img src={googleLogo} alt="Gmail" />, name: "Gmail" },
  outlook: { icon: <img src={outlookLogo} alt="Outlook" />, name: "Outlook" },
};

const ServicesCard = ({ connectedServices, onAddService }) => {
  return (
    <section className="profile-card">
      <h2>Services liés</h2>
      <div className="services-grid">
        {connectedServices.map((serviceName) => {
          const service = serviceIcons[serviceName.toLowerCase()];
          if (!service) return null;

          return (
            <div key={serviceName} className="service-item connected">
              <div className="service-icon-wrapper">{service.icon}</div>
              <span className="service-name">{service.name}</span>
            </div>
          );
        })}

        <button
          className="service-item add-service-btn"
          onClick={onAddService}
          aria-label="Ajouter un service"
        >
          <div className="service-icon-wrapper">
            <Plus size={32} color="#6b7280" />
          </div>
          <span className="service-name-hidden">Ajouter</span>
        </button>
      </div>
    </section>
  );
};

export default ServicesCard;
