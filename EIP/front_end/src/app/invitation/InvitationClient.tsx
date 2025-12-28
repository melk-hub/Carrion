"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ApiService from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Invitation.module.css";
import Loading from "@/components/Loading/Loading";
import toast, { Toaster } from "react-hot-toast";
import AuthModal from "@/components/AuthModal/AuthModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface InvitationDetails {
	email: string;
	role: string;
	organization: { name: string };
	inviter: { email: string; userProfile?: { firstName: string; lastName: string } };
}

export default function InvitationClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const { t } = useLanguage();

	const { userProfile, loadingAuth, checkAuthStatus } = useAuth();

	const [details, setDetails] = useState<InvitationDetails | null>(null);
	const [loadingDetails, setLoadingDetails] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isAccepting, setIsAccepting] = useState(false);

	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

	const errorToastShown = useRef(false);
	const mismatchToastShown = useRef(false);

	useEffect(() => {
		if (!token) {
			if (!errorToastShown.current) {
				errorToastShown.current = true;
				toast.error(t("invitation.errors.missingToken") as string);
				router.push('/home');
			}
			return;
		}

		const fetchDetails = async () => {
			try {
				const response = await ApiService.get<InvitationDetails>(`/organization/invitation-details?token=${token}`);
				if (!response) {
					throw new Error("No response");
				}
				setDetails(response);
			} catch (err) {
				console.error(err);
				if (!errorToastShown.current) {
					errorToastShown.current = true;
					setError("Invitation invalide");
					toast.error(t("invitation.errors.invalid") as string);
					setTimeout(() => {
						router.push('/home');
					}, 2000);
				}
			} finally {
				setLoadingDetails(false);
			}
		};
		fetchDetails();
	}, [token, router, t]);


	useEffect(() => {
		if (!loadingAuth && userProfile && details) {
			if (userProfile.email.toLowerCase() !== details.email.toLowerCase()) {
				if (!mismatchToastShown.current) {
					mismatchToastShown.current = true;
					toast.error(
						t("invitation.errors.emailMismatch", {
							currentEmail: userProfile.email,
							targetEmail: details.email
						}) as string,
						{ duration: 4000 }
					);
					setTimeout(() => {
						router.push('/home');
					}, 2000);
				}
			}
		}
	}, [userProfile, details, loadingAuth, router, t]);

	const handleOpenAuth = (tab: 'login' | 'register') => {
		setAuthTab(tab);
		setIsAuthModalOpen(true);
	};

	const handleAuthSuccess = async () => {
		setIsAuthModalOpen(false);
		await checkAuthStatus();
		toast.success(t("invitation.success.connected") as string);
	};

	const handleAccept = async () => {
		if (!userProfile || !token) return;

		setIsAccepting(true);
		try {
			await ApiService.post("/organization/accept-invite", { token });
			toast.success(t("invitation.success.joined") as string);
			router.push("/organization");
		} catch (err: any) {
			console.error(err);
			toast.error(err?.response?.data?.message || t("invitation.errors.acceptFailed") as string);
		} finally {
			setIsAccepting(false);
		}
	};

	if (loadingAuth || loadingDetails) return <Loading />;

	if (error) {
		return (
			<div className={styles.container}>
				<Toaster position="top-center" />
				<div className={styles.card}>
					<div className={`${styles.icon} ${styles.iconError}`}>⚠️</div>
					<h1 className={styles.title}>{t("invitation.ui.invalidTitle")}</h1>
					<p className={styles.description}>{t("invitation.ui.redirecting")}</p>
				</div>
			</div>
		);
	}

	if (userProfile && details && userProfile.email.toLowerCase() !== details.email.toLowerCase()) {
		return (
			<div className={styles.container}>
				<Toaster position="top-center" />
				<Loading />
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Toaster position="top-center" />

			<div className={styles.card}>
				<div className={styles.icon}>📬</div>
				<h1 className={styles.title}>{t("invitation.ui.title")}</h1>

				<div className={styles.content}>
					<p><strong>{details?.inviter?.email}</strong> {t("invitation.ui.invitedBy")}</p>
					<div className={styles.orgName}>{details?.organization?.name}</div>
					<div className={styles.roleTag}>{t("invitation.ui.role")} {details?.role}</div>
					<p className={styles.instruction}>
						{t("invitation.ui.reservedFor")}<br />
						<strong>{details?.email}</strong>
					</p>
				</div>

				<div className={styles.actions}>
					{userProfile ? (
						<>
							<button className={styles.primaryButton} onClick={handleAccept} disabled={isAccepting}>
								{isAccepting ? t("invitation.buttons.validating") : t("invitation.buttons.accept")}
							</button>
							<button className={styles.secondaryButton} onClick={() => router.push("/dashboard")}>
								{t("invitation.buttons.ignore")}
							</button>
						</>
					) : (
						<>
							<button className={styles.primaryButton} onClick={() => handleOpenAuth('register')}>
								{t("invitation.buttons.createAccount")}
							</button>
							<button className={styles.outlineButton} onClick={() => handleOpenAuth('login')}>
								{t("invitation.buttons.login")}
							</button>
						</>
					)}
				</div>
			</div>

			<AuthModal
				isOpen={isAuthModalOpen}
				onClose={() => setIsAuthModalOpen(false)}
				defaultTab={authTab}
				invitedEmail={details?.email}
				onSuccess={handleAuthSuccess}
			/>
		</div>
	);
}