"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./SetupModal.module.css";
import { useLanguage } from "@/contexts/LanguageContext";

interface SetupModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function SetupModal({ isOpen, onClose }: SetupModalProps) {
	const router = useRouter();
	const { t } = useLanguage();

	if (!isOpen) return null;

	const handleAutoRedirect = () => {
		onClose();
		router.push("/profile");
	};

	const handleManualChoice = () => {
		onClose();
	};

	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<div className={styles.content}>
					<div className={styles.illustration}>⚡️</div>
					<h2>{t("setup.choice.title")}</h2>
					<p className={styles.description}>{t("setup.choice.description")}</p>
					<div className={styles.optionsContainer}>
						<div className={styles.optionCard}>
							<span className={styles.badge}>Recommandé</span>
							<h3>{t("setup.choice.autoTitle")}</h3>
							<p>{t("setup.choice.autoDesc")}</p>
							<button className={styles.primaryButton} onClick={handleAutoRedirect}>
								{t("setup.choice.goToProfileBtn")}
							</button>
						</div>
						<div className={styles.divider}>
							<span>{t("common.or")}</span>
						</div>
						<button className={styles.textButton} onClick={handleManualChoice}>
							{t("setup.choice.manualBtn")}
						</button>
						<p className={styles.footerNote}>{t("setup.choice.profileNote")}</p>
					</div>
				</div>
			</div>
		</div>
	);
}