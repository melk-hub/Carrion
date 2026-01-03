"use client";

import React, { useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PrimaryButton from "@/components/Button/PrimaryButton";
import styles from "./LandingPage.module.css";
import Loading from "@/components/Loading/Loading";
import LandingHeader from "@/components/LandingHeader/LandingHeader";
import { useAuthModal } from "@/contexts/AuthModalContext";

function LandingPageContent() {
	const { isAuthenticated, setIsAuthenticated, loadingAuth } = useAuth();
	const { t } = useLanguage();
	const { openAuthModal } = useAuthModal();
	const router = useRouter();
	const searchParams = useSearchParams();
	const paramsHandled = useRef(false);

	const handleLoginClick = () => openAuthModal('register');

	useEffect(() => {
		if (loadingAuth) return;

		if (isAuthenticated) {
			router.push("/home");
			return;
		}

		if (paramsHandled.current) return;

		const successType = searchParams.get("auth");
		if (successType === "success") {
			paramsHandled.current = true;
			toast.success(t("auth.loginSuccessRedirect") as string);
			setIsAuthenticated(true);
			router.replace("/", { scroll: false });
		}
	}, [isAuthenticated, loadingAuth, searchParams, setIsAuthenticated, router, t]);

	useEffect(() => {
		const observerOptions = {
			threshold: 0.1,
			rootMargin: "0px 0px -100px 0px",
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add(styles.animateInView);
				}
			});
		}, observerOptions);

		const animatedElements = document.querySelectorAll(`.${styles.animateOnScroll}`);
		animatedElements.forEach((el) => observer.observe(el));

		return () => {
			animatedElements.forEach((el) => observer.unobserve(el));
		};
	}, []);

	if (loadingAuth || isAuthenticated) {
		return <Loading />;
	}

	return (
		<div className={styles.landingPage}>
			<LandingHeader />

			<main className={styles.landingMainContent}>

				<section className={styles.heroSection}>
					<div className={`${styles.heroContent} ${styles.fadeIn}`}>
						<div className={styles.heroDescription}>
							<h1 className={styles.textSlideUp}>{t("landing.title")}</h1>
							<p className={`${styles.textSlideUp} ${styles.delay1}`}>
								{t("landing.subtitle")}
							</p>
							<div style={{ width: "37.5%" }}>
								<PrimaryButton
									text={t("landing.getStarted") as string}
									onClick={handleLoginClick}
									size="large"
								/>
							</div>
						</div>
						<div className={styles.heroImageContainer}>
							<div className={styles.mainImageWrapper}>
								<Image
									src="/assets/landing_bg.jpeg"
									alt="Illustration de la page d'accueil"
									className={`${styles.mainHeroImage} ${styles.imageZoomIn}`}
									style={{ objectFit: "cover" }}
									priority
									height={400}
									width={400}
								/>
								<div className={styles.imageGlow}></div>
							</div>
						</div>
					</div>
				</section>

				<section className={`${styles.statsSection}`}>
					<div className={styles.statsContainer}>
						<div className={`${styles.statItem} ${styles.pulseAnimation}`}>
							<h3 className={styles.statNumber}>10,000+</h3>
							<p className={styles.statLabel}>{t("landing.stats.users")}</p>
						</div>
						<div className={`${styles.statItem} ${styles.pulseAnimation} ${styles.delay1}`}>
							<h3 className={styles.statNumber}>95%</h3>
							<p className={styles.statLabel}>{t("landing.stats.success")}</p>
						</div>
						<div className={`${styles.statItem} ${styles.pulseAnimation} ${styles.delay2}`}>
							<h3 className={styles.statNumber}>24/7</h3>
							<p className={styles.statLabel}>{t("landing.stats.support")}</p>
						</div>
					</div>
				</section>

				<section className={`${styles.servicesSection} ${styles.animateOnScroll}`}>
					<h2 className={`${styles.sectionsTitle} ${styles.slideUp}`}>
						{t("landing.services.title")}
					</h2>
					<div className={styles.servicesContent}>
						<div className={`${styles.serviceBox} ${styles.hoverLift} ${styles.cardSlideLeft}`}>
							<Image src="/assets/svg/search_lucide.svg" alt="Recherche" width={50} height={50} />
							<h3>{t("landing.services.tracking.title")}</h3>
							<ul>
								{(t("landing.services.tracking.points") as string[]).map((point: string, index: number) => (
									<li key={index}>{point}</li>
								))}
							</ul>
						</div>
						<div className={`${styles.serviceBox} ${styles.hoverLift} ${styles.cardSlideRight}`}>
							<Image src="/assets/svg/calendar_lucide.svg" alt="Calendrier" width={50} height={50} />
							<h3>{t("landing.services.goals.title")}</h3>
							<ul>
								{(t("landing.services.goals.points") as string[]).map((point: string, index: number) => (
									<li key={index}>{point}</li>
								))}
							</ul>
						</div>
						<div className={`${styles.serviceBox} ${styles.hoverLift} ${styles.cardSlideLeft}`}>
							<Image src="/assets/svg/bar_chart_lucide.svg" alt="Graphique" width={50} height={50} />
							<h3>{t("landing.services.reminders.title")}</h3>
							<ul>
								{(t("landing.services.reminders.points") as string[]).map((point: string, index: number) => (
									<li key={index}>{point}</li>
								))}
							</ul>
						</div>
						<div className={`${styles.serviceBox} ${styles.hoverLift} ${styles.cardSlideRight}`}>
							<Image src="/assets/svg/folder_lucide.svg" alt="Dossier" width={50} height={50} />
							<h3>{t("landing.services.documents.title")}</h3>
							<ul>
								{(t("landing.services.documents.points") as string[]).map((point: string, index: number) => (
									<li key={index}>{point}</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				<section className={`${styles.tutorialSections} ${styles.animateOnScroll}`}>
					<h2 className={styles.slideUp}>{t("landing.howItWorks.title")}</h2>
					<div className={styles.tutorialContent}>
						<div className={`${styles.tutorialBox} ${styles.hoverLift} ${styles.tutorialSlideLeft}`}>
							<div className={styles.tutorialImageContainer}>
								<Image src="/assets/centralize_landing.png" alt="Centralisation" width={200} height={200} />
							</div>
							<div className={styles.textBox}>
								<h3>{t("landing.howItWorks.centralize.title")}</h3>
								<p>{t("landing.howItWorks.centralize.description")}</p>
							</div>
						</div>
						<div className={`${styles.tutorialBox} ${styles.hoverLift} ${styles.tutorialSlideRight}`}>
							<div className={styles.tutorialImageContainer}>
								<Image src="/assets/progression_landing.png" alt="Suivi" width={200} height={200} />
							</div>
							<div className={styles.textBox}>
								<h3>{t("landing.howItWorks.track.title")}</h3>
								<p>{t("landing.howItWorks.track.description")}</p>
							</div>
						</div>
						<div className={`${styles.tutorialBox} ${styles.hoverLift} ${styles.tutorialSlideLeft}`}>
							<div className={styles.tutorialImageContainer}>
								<Image src="/assets/optimize_landing.jpg" alt="Optimisation" width={200} height={200} />
							</div>
							<div className={styles.textBox}>
								<h3>{t("landing.howItWorks.optimize.title")}</h3>
								<p>{t("landing.howItWorks.optimize.description")}</p>
							</div>
						</div>
					</div>
				</section>

				<section className={`${styles.testimonialsSection} ${styles.animateOnScroll}`}>
					<h2 className={`${styles.sectionsTitle} ${styles.slideUp}`}>
						{t("landing.testimonials.title")}
					</h2>
					<div className={styles.testimonialsContainer}>
						<div className={`${styles.testimonialCard} ${styles.hoverLift} ${styles.cardSlideUp}`}>
							<div className={styles.testimonialContent}>
								<p>{t("landing.testimonials.testimonial1.content")}</p>
								<div className={styles.testimonialAuthor}>
									<strong>{t("landing.testimonials.testimonial1.author")}</strong>
									<span>{t("landing.testimonials.testimonial1.position")}</span>
								</div>
							</div>
						</div>
						<div className={`${styles.testimonialCard} ${styles.hoverLift} ${styles.cardSlideUp} ${styles.delay1}`}>
							<div className={styles.testimonialContent}>
								<p>{t("landing.testimonials.testimonial2.content")}</p>
								<div className={styles.testimonialAuthor}>
									<strong>{t("landing.testimonials.testimonial2.author")}</strong>
									<span>{t("landing.testimonials.testimonial2.position")}</span>
								</div>
							</div>
						</div>
						<div className={`${styles.testimonialCard} ${styles.hoverLift} ${styles.cardSlideUp} ${styles.delay2}`}>
							<div className={styles.testimonialContent}>
								<p>{t("landing.testimonials.testimonial3.content")}</p>
								<div className={styles.testimonialAuthor}>
									<strong>{t("landing.testimonials.testimonial3.author")}</strong>
									<span>{t("landing.testimonials.testimonial3.position")}</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className={`${styles.ctaSection} ${styles.animateOnScroll}`}>
					<div className={`${styles.ctaContent} ${styles.fadeIn}`}>
						<h2>{t("landing.cta.title")}</h2>
						<p>{t("landing.cta.subtitle")}</p>
						<div className={`${styles.ctaButtonContainer} ${styles.buttonFloat}`}>
							<PrimaryButton
								text={t("landing.cta.button") as string}
								onClick={handleLoginClick}
								size="large"
							/>
						</div>
					</div>
				</section>
			</main>

		</div>
	);
}

export default function LandingPageClient() {
	return (
		<Suspense fallback={<Loading />}>
			<LandingPageContent />
		</Suspense>
	);
}