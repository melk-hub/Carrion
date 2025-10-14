import React from "react";
import { X } from "lucide-react";
import styles from "./ServicesCard.module.css";
import profileStyles from "../../app/(dashboard)/profile/Profile.module.css";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

const ServiceIcon = ({ serviceName }: { serviceName: string }) => {
  if (serviceName.toLowerCase().includes("google")) {
    return (
      <Image
        src="/assets/google-logo.png"
        alt="Logo Google"
        className="service-icon-img"
        width={24}
        height={24}
      />
    );
  }
  if (serviceName.toLowerCase().includes("microsoft")) {
    return (
      <Image
        src="/assets/outlook-logo.svg"
        alt="Logo Microsoft"
        className="service-icon-img"
        width={24}
        height={24}
      />
    );
  }
  return null;
};

const ServicesCard = ({
  connectedServices,
  onAddService,
  onDisconnectService,
}: {
  connectedServices: { name: string }[];
  onAddService: () => void;
  onDisconnectService: (serviceName: string) => void;
}) => {
  const formatServiceName = (name: string) => {
    if (name === "Google_oauth2") return "Google";
    if (name === "Microsoft_oauth2") return "Microsoft Outlook";
    return name;
  };
  const { t } = useLanguage();

  return (
    <article className={profileStyles.profileCard + " " + styles.servicesCard}>
      <h2>{t("profile.services")}</h2>
      <div className={styles.servicesList}>
        {connectedServices.length > 0 ? (
          connectedServices.map((service) => (
            <div key={service.name} className={styles.serviceItem}>
              <div className={styles.serviceInfo}>
                <div className={styles.serviceIconWrapper}>
                  <ServiceIcon serviceName={service.name} />
                </div>
                <span className={styles.serviceName}>
                  {formatServiceName(service.name)}
                </span>
              </div>
              <button
                className={styles.disconnectBtn}
                onClick={() => onDisconnectService(service.name)}
                aria-label={`Déconnecter ${formatServiceName(service.name)}`}
              >
                <X size={16} />
              </button>
            </div>
          ))
        ) : (
          <p className={styles.noServicesMessage}>{t("profile.noServices")}</p>
        )}
      </div>
      <button className={styles.addServiceBtn} onClick={onAddService}>
        {t("profile.addService")}
      </button>
    </article>
  );
};

export default ServicesCard;
