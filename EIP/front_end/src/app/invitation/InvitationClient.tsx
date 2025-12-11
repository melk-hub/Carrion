"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ApiService from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Invitation.module.css";
import Loading from "@/components/Loading/Loading";
import toast, { Toaster } from "react-hot-toast";
import AuthModal from "@/components/AuthModal/AuthModal";

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

	const { userProfile, loadingAuth, checkAuthStatus } = useAuth();

	const [details, setDetails] = useState<InvitationDetails | null>(null);
	const [loadingDetails, setLoadingDetails] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isAccepting, setIsAccepting] = useState(false);

	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

	const processingMismatch = useRef(false);

	useEffect(() => {
		if (!token) {
			toast.error("Lien d'invitation manquant.");
			router.push('/home');
			return;
		}

		const fetchDetails = async () => {
			try {
				const response = await ApiService.get<InvitationDetails>(`/organization/invitation-details?token=${token}`);
				if (!response) {
					setError("Invitation invalide");
					toast.error("Cette invitation n'existe pas ou a expiré.");
					setTimeout(() => {
						router.push('/home');
					}, 2000);
				}
				setDetails(response);
			} catch (err) {
				console.error(err);
				setError("Invitation invalide");
				toast.error("Cette invitation n'existe pas ou a expiré.");
				setTimeout(() => {
					router.push('/home');
				}, 2000);

			} finally {
				setLoadingDetails(false);
			}
		};

		fetchDetails();
	}, [token, router]);


	useEffect(() => {

		if (!loadingAuth && userProfile && details) {
			if (userProfile.email.toLowerCase() !== details.email.toLowerCase()) {
				if (!processingMismatch.current) {
					processingMismatch.current = true;
					toast.error(
						`Connexion refusée : Le compte ${userProfile.email} ne correspond pas à l'invitation pour ${details.email}.`,
						{ duration: 4000 }
					);
					setTimeout(() => {
						router.push('/home');
					}, 2000);
				}
			}
		}
	}, [userProfile, details, loadingAuth, router]);

	const handleOpenAuth = (tab: 'login' | 'register') => {
		setAuthTab(tab);
		setIsAuthModalOpen(true);
	};

	const handleAuthSuccess = async () => {
		setIsAuthModalOpen(false);
		await checkAuthStatus();
		toast.success("Connexion réussie !");
	};

	const handleAccept = async () => {
		if (!userProfile || !token) return;

		setIsAccepting(true);
		try {
			await ApiService.post("/organization/accept-invite", { token });
			toast.success("Bienvenue dans l'équipe !");
			router.push("/organization");
		} catch (err: any) {
			console.error(err);
			toast.error(err?.response?.data?.message || "Erreur lors de l'acceptation.");
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
					<h1 className={styles.title}>Lien invalide</h1>
					<p className={styles.description}>Redirection vers l'accueil...</p>
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
				<h1 className={styles.title}>Invitation reçue</h1>

				<div className={styles.content}>
					<p><strong>{details?.inviter?.email}</strong> vous invite à rejoindre l'organisation :</p>
					<div className={styles.orgName}>{details?.organization?.name}</div>
					<div className={styles.roleTag}>Rôle : {details?.role}</div>
					<p className={styles.instruction}>
						Cette invitation est réservée à l'adresse :<br />
						<strong>{details?.email}</strong>
					</p>
				</div>

				<div className={styles.actions}>
					{userProfile ? (
						<>
							<button className={styles.primaryButton} onClick={handleAccept} disabled={isAccepting}>
								{isAccepting ? "Validation..." : "Accepter et Rejoindre"}
							</button>
							<button className={styles.secondaryButton} onClick={() => router.push("/dashboard")}>
								Ignorer et aller au dashboard
							</button>
						</>
					) : (
						<>
							<button className={styles.primaryButton} onClick={() => handleOpenAuth('register')}>
								Créer un compte
							</button>
							<button className={styles.outlineButton} onClick={() => handleOpenAuth('login')}>
								J'ai déjà un compte
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