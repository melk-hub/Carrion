"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import PrimaryButton from "@/components/Button/PrimaryButton";
import LanguageDropdown from "@/components/LanguageDropdown/LanguageDropdown";
import styles from "./LandingHeader.module.css";

interface LandingHeaderProps {
	forceVisible?: boolean;
}

export default function LandingHeader({ forceVisible = false }: LandingHeaderProps) {
	const { t } = useLanguage();
	const { isAuthenticated } = useAuth();
	const { openAuthModal } = useAuthModal();
	const router = useRouter();

	const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
	const [isAtTop, setIsAtTop] = useState<boolean>(true);
	const lastScrollY = useRef<number>(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const atTop = currentScrollY <= 10;
			setIsAtTop(atTop);

			if (forceVisible) {
				setIsHeaderVisible(true);
			} else {
				if (atTop) setIsHeaderVisible(true);
				else if (currentScrollY < lastScrollY.current - 5) setIsHeaderVisible(true);
				else if (currentScrollY > lastScrollY.current + 5) setIsHeaderVisible(false);
			}
			lastScrollY.current = currentScrollY;
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [forceVisible]);

	return (
		<header className={`${styles.landingHeader} ${isHeaderVisible ? styles.visible : styles.hidden} ${isAtTop ? styles.headerAtTop : ""}`}>
			<nav aria-label="Navigation principale">
				<div className={styles.logoContainer}>
					<Link href="/">
						<Image src="/assets/carrion_logo.png" alt="Carrion logo" width={40} height={40} />
						CARRION
					</Link>
				</div>
				<div className={styles.navigationActions}>
					<LanguageDropdown style={{ color: "black" }} />

					{!isAuthenticated && (
						<PrimaryButton
							text={t("auth.signIn") as string}
							onClick={() => openAuthModal('login')}
							size="medium"
						/>
					)}

					{isAuthenticated && (
						<PrimaryButton
							text={t("home.dashboard") as string}
							onClick={() => router.push("/home")}
							size="medium"
						/>
					)}
				</div>
			</nav>
		</header>
	);
}