"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PrimaryButton from "@/components/PrimaryButton";
import LanguageDropdown from "@/components/LanguageDropdown";
import AuthModal from "@/components/AuthModal";
import LoginBtn from "@/components/LoginBtn";

function LandingPageContent() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);
  const [showAuth, setShowAuth] = useState<boolean>(false);

  const handleLoginClick = () => setShowAuth(true);

  useEffect(() => {
    const errorType = searchParams.get("error");
    const successType = searchParams.get("auth");

    if (errorType) {
      const message = errorType === "permission_denied" ? t("auth.permissionDenied") : t("auth.genericError");
      toast.error(message, { duration: 6000 });
      router.replace('/');
    }

    if (successType === "success") {
      toast.success(t("auth.loginSuccessRedirect"));
      setIsAuthenticated(true);
      router.replace('/');
      setTimeout(() => router.push("/home"), 1500);
    }
  }, [searchParams, t, router, setIsAuthenticated]);
  
  useEffect(() => {
    if (isAuthenticated && !searchParams.get("auth")) {
      router.push("/home");
    }
  }, [isAuthenticated, router, searchParams]);
  
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -100px 0px" };
    const observerOptionsExit = { threshold: 0, rootMargin: "50px 0px 50px 0px" };
    
    const observerIn = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in-view");
          entry.target.classList.remove("animate-out-view");
        }
      });
    }, observerOptions);
    
    const observerOut = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          entry.target.classList.add("animate-out-view");
          entry.target.classList.remove("animate-in-view");
        }
      });
    }, observerOptionsExit);

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => {
      observerIn.observe(el);
      observerOut.observe(el);
    });

    return () => {
      observerIn.disconnect();
      observerOut.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.classList.add("landing-page");
    return () => document.body.classList.remove("landing-page");
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

  return (
    <div className="landing-page">
      <header className={`landing-header ${isHeaderVisible ? "visible" : "hidden"} ${isAtTop ? "header-at-top" : ""}`}>
        <nav aria-label="Navigation principale">
          <div className="logo-container">
            <Link href="/">
              <Image src="/assets/carrion_logo.png" alt="Carrion logo" width={40} height={40} />
              CARRION
            </Link>
          </div>
          <div className="navigation-actions">
            <LanguageDropdown style={{ color: "black" }} />
            <div style={{ width: "10vw", fontSize: "14px", maxHeight: "32px" }}>
              {/* <LoginBtn onClick={handleLoginClick} /> */}
            </div>
          </div>
        </nav>
      </header>

      <main className="landing-main-content">
        <section className="hero-section">
          <div className="hero-content fade-in">
            <div className="hero-description">
              <h1 className="text-slide-up">{t("landing.title")}</h1>
              <p className="text-slide-up delay-1">{t("landing.subtitle")}</p>
              <div style={{ width: "37.5%" }}>
                <PrimaryButton text={t("landing.getStarted")} onClick={handleLoginClick} size="large" />
              </div>
            </div>
            <div className="hero-image-container">
              <div className="main-image-wrapper">
                <Image
                  src="/assets/landing_bg.jpeg"
                  alt="Illustration de la page d'accueil"
                  className="main-hero-image image-zoom-in"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
                <div className="image-glow"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section animate-on-scroll">
          <div className="stats-container">
            <div className="stat-item pulse-animation">
              <h3 className="stat-number">10,000+</h3>
              <p className="stat-label">{t("landing.stats.users")}</p>
            </div>
            <div className="stat-item pulse-animation delay-1">
              <h3 className="stat-number">95%</h3>
              <p className="stat-label">{t("landing.stats.success")}</p>
            </div>
            <div className="stat-item pulse-animation delay-2">
              <h3 className="stat-number">24/7</h3>
              <p className="stat-label">{t("landing.stats.support")}</p>
            </div>
          </div>
        </section>

        <section className="services-section animate-on-scroll">
          <h2 className="sections-title slide-up">{t("landing.services.title")}</h2>
          <div className="services-content">
            <div className="service-box hover-lift card-slide-left">
              <Image src="/assets/svg/search_lucide.svg" alt="Icône de recherche" width={50} height={50} />
              <h3>{t("landing.services.tracking.title")}</h3>
              <ul>{t("landing.services.tracking.points").map((point: string, index: number) => <li key={index}>{point}</li>)}</ul>
            </div>
            <div className="service-box hover-lift card-slide-right">
              <Image src="/assets/svg/calendar_lucide.svg" alt="Icône de calendrier" width={50} height={50} />
              <h3>{t("landing.services.goals.title")}</h3>
              <ul>{t("landing.services.goals.points").map((point: string, index: number) => <li key={index}>{point}</li>)}</ul>
            </div>
            <div className="service-box hover-lift card-slide-left">
              <Image src="/assets/svg/bar_chart_lucide.svg" alt="Icône de graphique en barre" width={50} height={50} />
              <h3>{t("landing.services.reminders.title")}</h3>
              <ul>{t("landing.services.reminders.points").map((point: string, index: number) => <li key={index}>{point}</li>)}</ul>
            </div>
            <div className="service-box hover-lift card-slide-right">
              <Image src="/assets/svg/folder_lucide.svg" alt="Icône de dossier" width={50} height={50} />
              <h3>{t("landing.services.documents.title")}</h3>
              <ul>{t("landing.services.documents.points").map((point: string, index: number) => <li key={index}>{point}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="tutorial-sections animate-on-scroll">
          <h2 className="slide-up">{t("landing.howItWorks.title")}</h2>
          <div className="tutorial-content">
            <div className="tutorial-box hover-lift tutorial-slide-left">
              <div className="tutorial-image-container">
                <Image src="/assets/centralize_landing.png" alt="Centralisation facile des candidatures" width={200} height={200} />
              </div>
              <div className="text-box">
                <h3>{t("landing.howItWorks.centralize.title")}</h3>
                <p>{t("landing.howItWorks.centralize.description")}</p>
              </div>
            </div>
            <div className="tutorial-box hover-lift tutorial-slide-right">
              <div className="tutorial-image-container">
                <Image src="/assets/progression_landing.png" alt="Suivi de la progression des candidatures" width={200} height={200} />
              </div>
              <div className="text-box">
                <h3>{t("landing.howItWorks.track.title")}</h3>
                <p>{t("landing.howItWorks.track.description")}</p>
              </div>
            </div>
            <div className="tutorial-box hover-lift tutorial-slide-left">
              <div className="tutorial-image-container">
                <Image src="/assets/optimize_landing.jpg" alt="Optimisation pour réussir la recherche" width={200} height={200} />
              </div>
              <div className="text-box">
                <h3>{t("landing.howItWorks.optimize.title")}</h3>
                <p>{t("landing.howItWorks.optimize.description")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonials-section animate-on-scroll">
          <h2 className="sections-title slide-up">{t("landing.testimonials.title")}</h2>
          <div className="testimonials-container">
            <div className="testimonial-card hover-lift card-slide-up">
              <div className="testimonial-content">
                <p>{t("landing.testimonials.testimonial1.content")}</p>
                <div className="testimonial-author">
                  <strong>{t("landing.testimonials.testimonial1.author")}</strong>
                  <span>{t("landing.testimonials.testimonial1.position")}</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card hover-lift card-slide-up delay-1">
              <div className="testimonial-content">
                <p>{t("landing.testimonials.testimonial2.content")}</p>
                <div className="testimonial-author">
                  <strong>{t("landing.testimonials.testimonial2.author")}</strong>
                  <span>{t("landing.testimonials.testimonial2.position")}</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card hover-lift card-slide-up delay-2">
              <div className="testimonial-content">
                <p>{t("landing.testimonials.testimonial3.content")}</p>
                <div className="testimonial-author">
                  <strong>{t("landing.testimonials.testimonial3.author")}</strong>
                  <span>{t("landing.testimonials.testimonial3.position")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section animate-on-scroll">
          <div className="cta-content fade-in">
            <h2>{t("landing.cta.title")}</h2>
            <p>{t("landing.cta.subtitle")}</p>
            <div className="cta-button-container button-float">
              <PrimaryButton text={t("landing.cta.button")} onClick={handleLoginClick} size="large" />
            </div>
          </div>
        </section>
      </main>
      
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingPageContent />
    </Suspense>
  )
}