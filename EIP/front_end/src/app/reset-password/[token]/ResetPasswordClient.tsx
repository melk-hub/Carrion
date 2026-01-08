"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import apiService from "@/services/api";
import styles from "./ResetPassword.module.css";
import PrimaryButton from "@/components/Button/PrimaryButton";
import { FiEye, FiEyeOff, FiCheckCircle, FiXCircle, FiAlertTriangle, FiLoader } from "react-icons/fi";
import { passwordRegEX } from "@/services/utils";
import toast, { Toaster } from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import LandingHeader from "@/components/LandingHeader/LandingHeader";

interface VerifyResponse {
	valid: boolean;
	message?: string;
}

interface ApiError {
	status?: number;
	message?: string;
	response?: {
		status?: number;
		data?: {
			message?: string;
		};
	};
}

export default function ResetPasswordClient() {
	const router = useRouter();
	const { token } = useParams();
	const { t } = useLanguage();
	const effectRan = useRef(false);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const [isVerifyingToken, setIsVerifyingToken] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [viewState, setViewState] = useState<"form" | "success" | "tokenError">("form");

	const [passwordCriteria, setPasswordCriteria] = useState({
		length: false,
		letter: false,
		number: false,
		special: false,
	});

	useEffect(() => {
		if (effectRan.current === true || !token) return;

		const checkToken = async () => {
			try {
				const response = await apiService.get<VerifyResponse>(`/auth/verify-reset-token/${token}`);

				if (!response || (response.valid !== true && !response.message)) {
					throw new Error("Invalid token response");
				}
				setIsVerifyingToken(false);
			} catch (error: unknown) {
				console.error("Token invalid:", error);
				setViewState("tokenError");
				setIsVerifyingToken(false);
			}
		};

		checkToken();

		return () => { effectRan.current = true; };
	}, [token]);

	const validatePassword = (pwd: string) => {
		setPasswordCriteria({
			length: pwd.length >= 8,
			letter: /[A-Za-z]/.test(pwd),
			number: /\d/.test(pwd),
			special: /[@$!%*#?&]/.test(pwd),
		});
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setPassword(val);
		validatePassword(val);
	};

	const toggleVisibility = () => setShowPassword(!showPassword);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;

		if (!passwordRegEX.test(password)) {
			toast.error(t("auth.passwordInvalid") as string);
			return;
		}

		if (password !== confirmPassword) {
			toast.error(t("auth.passwordMismatch") as string);
			return;
		}

		setIsSubmitting(true);
		try {
			await apiService.post("/auth/reset-password", {
				token: token,
				password: password
			});

			setViewState("success");
			toast.success(t("auth.resetSuccess") as string);

			setTimeout(() => {
				router.push("/?auth=signin");
			}, 3000);

		} catch (error: unknown) {
			console.error(error);
			const err = error as ApiError;
			const status = err.status || err.response?.status;
			const message = err.message || err.response?.data?.message || "";

			if (status === 400 || message.includes("token") || message.includes("expir")) {
				setViewState("tokenError");
			} else {
				toast.error(t("auth.genericError") as string);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const ValidationCriterion = ({ isValid, text }: { isValid: boolean; text: string }) => (
		<li className={isValid ? styles.valid : styles.invalid}>
			{isValid ? <FiCheckCircle /> : <FiXCircle />}
			<span>{text}</span>
		</li>
	);

	return (
		<div className={styles.container}>
			<LandingHeader forceVisible={true} />
			<Toaster position="top-center" />

			{isVerifyingToken ? (
				<div className={styles.card}>
					<div className={styles.iconWrapper}>
						<FiLoader className={styles.spinner} />
					</div>
					<h1 className={styles.title}>{t("common.verifying") || "Vérification..."}</h1>
				</div>
			) : (
				<div className={styles.card}>

					{viewState === "success" && (
						<div className={styles.content}>
							<div className={`${styles.iconWrapper} ${styles.success}`}>
								<FiCheckCircle />
							</div>
							<h1 className={styles.title}>{t("common.success") || "Succès !"}</h1>
							<p className={styles.description}>
								{t("auth.resetPasswordSuccess") || "Votre mot de passe a été réinitialisé."}
								<br />
								{t("auth.redirectingToLogin") || "Redirection vers la connexion..."}
							</p>
							<PrimaryButton
								text={t("auth.signIn") as string}
								onClick={() => router.push("/?auth=signin")}
								style={{ width: "100%" }}
							/>
						</div>
					)}

					{viewState === "tokenError" && (
						<div className={styles.content}>
							<div className={`${styles.iconWrapper} ${styles.error}`}>
								<FiAlertTriangle />
							</div>
							<h1 className={styles.title}>{t("auth.invalidLinkTitle") as string}</h1>
							<p className={styles.description}>
								{t("auth.invalidLinkMessage") as string}
							</p>
							<PrimaryButton
								text={t("home.backToHome") as string}
								onClick={() => router.push("/?auth=signin")}
								style={{ backgroundColor: "#374151", width: "100%" }}
							/>
						</div>
					)}

					{viewState === "form" && (
						<>
							<h1 className={styles.title}>{t("auth.newPassword") || "Nouveau mot de passe"}</h1>
							<p className={styles.description}>{t("auth.defineNewPassword") || "Sécurisez votre compte avec un nouveau mot de passe."}</p>

							<form onSubmit={handleSubmit} className={styles.form}>
								<div className={styles.inputGroup}>
									<label>{t("auth.password")}</label>
									<div className={styles.passwordWrapper}>
										<input
											type={showPassword ? "text" : "password"}
											value={password}
											onChange={handlePasswordChange}
											placeholder={t("auth.password") as string}
											required
										/>
										<span onClick={toggleVisibility} className={styles.eyeIcon}>
											{showPassword ? <FiEyeOff /> : <FiEye />}
										</span>
									</div>
								</div>

								<div className={styles.inputGroup}>
									<label>{t("auth.confirmPassword")}</label>
									<div className={styles.passwordWrapper}>
										<input
											type={showPassword ? "text" : "password"}
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											placeholder={t("auth.confirmPassword") as string}
											required
											className={confirmPassword && password !== confirmPassword ? styles.inputError : ""}
										/>
										<span onClick={toggleVisibility} className={styles.eyeIcon}>
											{showPassword ? <FiEyeOff /> : <FiEye />}
										</span>
									</div>
								</div>

								<ul className={styles.criteriaList}>
									<ValidationCriterion isValid={passwordCriteria.length} text={t("auth.criteria.length") as string} />
									<ValidationCriterion isValid={passwordCriteria.letter} text={t("auth.criteria.letter") as string} />
									<ValidationCriterion isValid={passwordCriteria.number} text={t("auth.criteria.number") as string} />
									<ValidationCriterion isValid={passwordCriteria.special} text={t("auth.criteria.special") as string} />
								</ul>

								<PrimaryButton
									text={isSubmitting ? (t("common.loading") || "Chargement...") as string : (t("common.confirm") || "Confirmer") as string}
									type="submit"
									disabled={isSubmitting}
									style={{ marginTop: "1rem", width: "100%" }}
								/>
							</form>
						</>
					)}
				</div>
			)}
		</div>
	);
}