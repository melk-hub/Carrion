"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PrimaryButton from "@/components/Button/PrimaryButton";
import LanguageDropdown from "@/components/LanguageDropdown/LanguageDropdown";
import AuthModal from "@/components/AuthModal/AuthModal";
import styles from "./LandingPage.module.css";
import Loading from "@/components/Loading/Loading";

function LandingPageContent() {
  const { isAuthenticated, setIsAuthenticated, loadingAuth, checkAuthStatus } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const paramsHandled = useRef(false);

  const handleLoginClick = () => setShowAuth(true);

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
      checkAuthStatus().then(() => {
        setIsAuthenticated(true);
        router.push("/home");
      });
    }
  }, [
    isAuthenticated,
    loadingAuth,
    searchParams,
    setIsAuthenticated,
    router,
    t,
  ]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.animateInView);
        } else {
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      `.${styles.animateOnScroll}`
    );

    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const atTop = currentScrollY <= 5;
      setIsAtTop(atTop);
      if (atTop) {
        setIsHeaderVisible(true);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current + 5) {
        setIsHeaderVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loadingAuth || isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className={styles.landingPage}>
      <header
        className={`${styles.landingHeader} ${
          isHeaderVisible ? styles.visible : styles.hidden
        } ${isAtTop ? styles.headerAtTop : ""}`}
      >
        <nav aria-label="Navigation principale">
          <div className={styles.logoContainer}>
            <Link href="/">
              <Image
                src="/assets/carrion_logo.png"
                alt="Carrion logo"
                width={40}
                height={40}
              />
              CARRION
            </Link>
          </div>
          <div className={styles.navigationActions}>
            <LanguageDropdown style={{ color: "black" }} />
            <PrimaryButton
              text={t("auth.signIn") as string}
              onClick={handleLoginClick}
              size="medium"
            />
          </div>
        </nav>
      </header>

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
                  height={800}
                  width={1200}
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
            <div
              className={`${styles.statItem} ${styles.pulseAnimation} ${styles.delay1}`}
            >
              <h3 className={styles.statNumber}>95%</h3>
              <p className={styles.statLabel}>{t("landing.stats.success")}</p>
            </div>
            <div
              className={`${styles.statItem} ${styles.pulseAnimation} ${styles.delay2}`}
            >
              <h3 className={styles.statNumber}>24/7</h3>
              <p className={styles.statLabel}>{t("landing.stats.support")}</p>
            </div>
          </div>
        </section>

        <section
          className={`${styles.servicesSection} ${styles.animateOnScroll}`}
        >
          <h2 className={`${styles.sectionsTitle} ${styles.slideUp}`}>
            {t("landing.services.title")}
          </h2>
          <div className={styles.servicesContent}>
            <div
              className={`${styles.serviceBox} ${styles.hoverLift} ${styles.cardSlideLeft}`}
            >
              <Image
                src="/assets/svg/search_lucide.svg"
                alt="Icône de recherche"
                width={50}
                height={50}
              />
              <h3>{t("landing.services.tracking.title")}</h3>
              <ul>
                {(t("landing.services.tracking.points") as string[]).map(
                  (point: string, index: number) => (
                    <li key={index}>{point}</li>
                  )
                )}
              </ul>
            </div>
            <div
              className={`${styles.serviceBox} ${styles.hoverLift} ${styles.cardSlideRight}`}
            >
              <Image
                src="/assets/svg/calendar_lucide.svg"
                alt="Icône de calendrier"
                width={50}
                height={50}
              />
              <h3>{t("landing.services.goals.title")}</h3>
              <ul>
                {(t("landing.services.goals.points") as string[]).map(
                  (point: string, index: number) => (
                    <li key={index}>{point}</li>
                  )
                )}
              </ul>
            </div>
            <div
              className={`${styles.serviceBox} ${styles.hoverLift} ${styles.cardSlideLeft}`}
            >
              <Image
                src="/assets/svg/bar_chart_lucide.svg"
                alt="Icône de graphique en barre"
                width={50}
                height={50}
              />
              <h3>{t("landing.services.reminders.title")}</h3>
              <ul>
                {(t("landing.services.reminders.points") as string[]).map(
                  (point: string, index: number) => (
                    <li key={index}>{point}</li>
                  )
                )}
              </ul>
            </div>
            <div
              className={`${styles.serviceBox} ${styles.hoverLift} ${styles.cardSlideRight}`}
            >
              <Image
                src="/assets/svg/folder_lucide.svg"
                alt="Icône de dossier"
                width={50}
                height={50}
              />
              <h3>{t("landing.services.documents.title")}</h3>
              <ul>
                {(t("landing.services.documents.points") as string[]).map(
                  (point: string, index: number) => (
                    <li key={index}>{point}</li>
                  )
                )}
              </ul>
            </div>
          </div>
        </section>

        <section
          className={`${styles.tutorialSections} ${styles.animateOnScroll}`}
        >
          <h2 className={styles.slideUp}>{t("landing.howItWorks.title")}</h2>
          <div className={styles.tutorialContent}>
            <div
              className={`${styles.tutorialBox} ${styles.hoverLift} ${styles.tutorialSlideLeft}`}
            >
              <div className={styles.tutorialImageContainer}>
                <Image
                  src="/assets/centralize_landing.png"
                  alt="Centralisation facile des candidatures"
                  width={200}
                  height={200}
                />
              </div>
              <div className={styles.textBox}>
                <h3>{t("landing.howItWorks.centralize.title")}</h3>
                <p>{t("landing.howItWorks.centralize.description")}</p>
              </div>
            </div>
            <div
              className={`${styles.tutorialBox} ${styles.hoverLift} ${styles.tutorialSlideRight}`}
            >
              <div className={styles.tutorialImageContainer}>
                <Image
                  src="/assets/progression_landing.png"
                  alt="Suivi de la progression des candidatures"
                  width={200}
                  height={200}
                />
              </div>
              <div className={styles.textBox}>
                <h3>{t("landing.howItWorks.track.title")}</h3>
                <p>{t("landing.howItWorks.track.description")}</p>
              </div>
            </div>
            <div
              className={`${styles.tutorialBox} ${styles.hoverLift} ${styles.tutorialSlideLeft}`}
            >
              <div className={styles.tutorialImageContainer}>
                <Image
                  src="/assets/optimize_landing.jpg"
                  alt="Optimisation pour réussir la recherche"
                  width={200}
                  height={200}
                />
              </div>
              <div className={styles.textBox}>
                <h3>{t("landing.howItWorks.optimize.title")}</h3>
                <p>{t("landing.howItWorks.optimize.description")}</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${styles.testimonialsSection} ${styles.animateOnScroll}`}
        >
          <h2 className={`${styles.sectionsTitle} ${styles.slideUp}`}>
            {t("landing.testimonials.title")}
          </h2>
          <div className={styles.testimonialsContainer}>
            <div
              className={`${styles.testimonialCard} ${styles.hoverLift} ${styles.cardSlideUp}`}
            >
              <div className={styles.testimonialContent}>
                <p>{t("landing.testimonials.testimonial1.content")}</p>
                <div className={styles.testimonialAuthor}>
                  <strong>
                    {t("landing.testimonials.testimonial1.author")}
                  </strong>
                  <span>{t("landing.testimonials.testimonial1.position")}</span>
                </div>
              </div>
            </div>
            <div
              className={`${styles.testimonialCard} ${styles.hoverLift} ${styles.cardSlideUp} ${styles.delay1}`}
            >
              <div className={styles.testimonialContent}>
                <p>{t("landing.testimonials.testimonial2.content")}</p>
                <div className={styles.testimonialAuthor}>
                  <strong>
                    {t("landing.testimonials.testimonial2.author")}
                  </strong>
                  <span>{t("landing.testimonials.testimonial2.position")}</span>
                </div>
              </div>
            </div>
            <div
              className={`${styles.testimonialCard} ${styles.hoverLift} ${styles.cardSlideUp} ${styles.delay2}`}
            >
              <div className={styles.testimonialContent}>
                <p>{t("landing.testimonials.testimonial3.content")}</p>
                <div className={styles.testimonialAuthor}>
                  <strong>
                    {t("landing.testimonials.testimonial3.author")}
                  </strong>
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
            <div
              className={`${styles.ctaButtonContainer} ${styles.buttonFloat}`}
            >
              <PrimaryButton
                text={t("landing.cta.button") as string}
                onClick={handleLoginClick}
                size="large"
              />
            </div>
          </div>
        </section>
      </main>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
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
