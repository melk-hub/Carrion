import React from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

import styles from "./AddServiceModal.module.css";

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
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				<header className={styles.modalHeader}>
					<h3>{t("profile.connectService")}</h3>
					<button
						onClick={onClose}
						className={styles.closeBtn}
						aria-label="Fermer la modale"
					>
						<X size={24} />
					</button>
				</header>
				<div className={styles.modalBody}>
					<p>{t("profile.chooseService")}</p>
					<div className={styles.serviceOptions}>
						{!isGoogleConnected && (
							<button
								className={styles.serviceOption}
								onClick={() => handleConnect("google")}
							>
								<Image
									src="/assets/google-logo.png"
									alt="Google"
									className={styles.serviceOptionIcon}
									width={32}
									height={32}
								/>
								<span>{t("profile.connectGmail")}</span>
							</button>
						)}

						{!isMicrosoftConnected && (
							<button
								className={styles.serviceOption}
								onClick={() => handleConnect("microsoft")}
							>
								<Image
									src="/assets/outlook-logo.svg"
									alt="Outlook"
									className={styles.serviceOptionIcon}
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
