"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import apiService from "@/services/api";
import styles from "./VerifyEmail.module.css";
import PrimaryButton from "@/components/Button/PrimaryButton";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import LandingHeader from "@/components/LandingHeader/LandingHeader";
import { useLanguage } from "@/contexts/LanguageContext";

interface ApiError {
	message?: string;
	response?: {
		data?: {
			message?: string;
		};
	};
}

export default function VerifyEmailClient() {
	const router = useRouter();
	const { token } = useParams();
	const { t } = useLanguage();
	const effectRan = useRef(false);
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [errorKey, setErrorKey] = useState<string>("auth.invalidLinkMessage");

	useEffect(() => {
		if (effectRan.current === true) return;

		if (!token) {
			setStatus("error");
			setErrorKey("auth.invalidLinkMessage");
			return;
		}

		const verifyToken = async () => {
			try {
				const response = await apiService.get(`/auth/verify-email/${token}`);

				if (!response) {
					throw new Error("Empty_Response");
				}

				setStatus("success");
			} catch (err: unknown) {
				const error = err as ApiError;
				console.error(error);
				setStatus("error");

				const msg = error.message || "";
				const serverMsg = error.response?.data?.message || "";

				if (
					msg.toLowerCase().includes("expir") ||
					serverMsg.toLowerCase().includes("expir")
				) {
					setErrorKey("auth.expiredLinkMessage");
				} else {
					setErrorKey("auth.invalidLinkMessage");
				}
			}
		};

		verifyToken();

		return () => {
			effectRan.current = true;
		};
	}, [token]);

	return (
		<div className={styles.container}>
			<LandingHeader forceVisible={true} />

			<div className={styles.card}>
				{status === "loading" && (
					<div className={styles.content}>
						<div className={styles.iconWrapper}>
							<FiLoader className={styles.spinner} />
						</div>
						<h1 className={styles.title}>{t("common.verifying")}</h1>
						<p className={styles.description}>{t("common.processing")}</p>
					</div>
				)}

				{status === "success" && (
					<div className={styles.content}>
						<div className={`${styles.iconWrapper} ${styles.success}`}>
							<FiCheckCircle />
						</div>
						<h1 className={styles.title}>{t("auth.emailVerified")}</h1>
						<p className={styles.description}>
							{t("auth.accountActive")}
							<br />
							{t("auth.welcomeCarrion")}
						</p>
						<PrimaryButton
							text={t("home.dashboard") as string}
							onClick={() => router.push("/home")}
							style={{ marginTop: "1rem", width: "100%" }}
						/>
					</div>
				)}

				{status === "error" && (
					<div className={styles.content}>
						<div className={`${styles.iconWrapper} ${styles.error}`}>
							<FiXCircle />
						</div>
						<h1 className={styles.title}>{t("auth.invalidLinkTitle")}</h1>

						<p className={styles.description}>{t(errorKey)}</p>

						<PrimaryButton
							text={t("home.backToHome") as string}
							onClick={() => router.push("/")}
							style={{
								marginTop: "1rem",
								backgroundColor: "#374151",
								width: "100%",
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}