"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { FiAlertTriangle } from "react-icons/fi";
import styles from "./not-found.module.css";
import PrimaryButton from "@/components/Button/PrimaryButton";
import LandingHeader from "@/components/LandingHeader/LandingHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
	const router = useRouter();
	const { t } = useLanguage();

	return (
		<div className={styles.container}>
			<LandingHeader forceVisible={true} />

			<div className={styles.card}>
				<div className={styles.iconWrapper}>
					<FiAlertTriangle className={styles.icon} />
				</div>

				<h1 className={styles.big404}>404</h1>

				<h2 className={styles.title}>
					{t("notFound.title") || "Page introuvable"}
				</h2>

				<p className={styles.description}>
					{t("notFound.description") || "Désolé, la page que vous recherchez n'existe pas."}
				</p>

				<PrimaryButton
					text={t("notFound.button") as string || "Retour à l'accueil"}
					onClick={() => router.push("/")}
					style={{ width: "100%" }}
					size="medium"
				/>
			</div>
		</div>
	);
}