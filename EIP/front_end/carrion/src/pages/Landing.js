import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/Landing.css";
import logo from "../assets/carrion_logo.png";
import landing_img from "../assets/landing_bg.jpeg";
import optimize_img from "../assets/optimize_landing.jpg";
import progression_img from "../assets/progression_landing.png";
import centralize_img from "../assets/centralize_landing.png";
import PrimaryButton from "../components/PrimaryButton";
import LanguageDropdown from "../components/LanguageDropdown";
import lucide_search_svg from "../assets/svg/search_lucide.svg";
import lucide_calendar_svg from "../assets/svg/calendar_lucide.svg";
import lucide_bar_chart_svg from "../assets/svg/bar_chart_lucide.svg";
import lucide_folder_svg from "../assets/svg/folder_lucide.svg";
import AuthModal from '../components/AuthModal';
import LoginBtn from '../components/LoginBtn';

function Landing() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 5;
  const topThreshold = 5;

  const handleLoginClick = () => {
    setShowAuth(true);
  };

  const [showAuth, setShowAuth] = useState(false);

  // Animation sur scroll améliorée
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observerOptionsExit = {
      threshold: 0,
      rootMargin: '50px 0px 50px 0px'
    };

    // Observer pour l'apparition des éléments
    const observerIn = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in-view');
          entry.target.classList.remove('animate-out-view');
        }
      });
    }, observerOptions);

    // Observer pour la disparition des éléments
    const observerOut = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          entry.target.classList.add('animate-out-view');
          entry.target.classList.remove('animate-in-view');
        }
      });
    }, observerOptionsExit);

    // Observer les éléments à animer
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
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

    return () => {
      document.body.classList.remove("landing-page");
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const atTop = currentScrollY <= topThreshold;

      setIsAtTop(atTop);

      if (atTop) {
        setIsHeaderVisible(true);
      } else if (currentScrollY < lastScrollY.current - scrollThreshold) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current + scrollThreshold) {
        setIsHeaderVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    const initialScrollY = window.scrollY;
    lastScrollY.current = initialScrollY;
    setIsAtTop(initialScrollY <= topThreshold);
    setIsHeaderVisible(initialScrollY <= topThreshold);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated]);

  return (
    <div className="landing-page">
      {/* Header avec navbar */}
      <header
        className={`
          landing-header
          ${isHeaderVisible ? "visible" : "hidden"}
          ${isAtTop ? "header-at-top" : ""}
        `}
      >
        <nav aria-label="Navigation principale">
          <div className="logo-container">
            <a href="/">
              <img src={logo} alt="Carrion logo" />
              CARRION
            </a>
          </div>
          <div className="navigation-actions">
            <LanguageDropdown style={{color: 'black'}}/>
            <div style={{width: '10vw', fontSize: '14px', maxHeight: '32px'}}>
              <LoginBtn onClick={handleLoginClick}/>
            </div>
          </div>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="landing-main-content">
        {/* Section landing */}
        <section className="hero-section">
          <div className="hero-content fade-in">
            <div className="hero-description">
              <h1 className="text-slide-up">{t('landing.title')}</h1>
              <p className="text-slide-up delay-1">
                {t('landing.subtitle')}
              </p>
              <div style={{width: '37.5%'}}>
                <PrimaryButton
                    text={t('landing.getStarted')}
                    onClick={handleLoginClick}
                    size="large"
                />
              </div>
            </div>
            <div className="hero-image-container">
              <div className="main-image-wrapper">
                <img src={landing_img} alt="Illustration de la page d'accueil" className="main-hero-image image-zoom-in" />
                <div className="image-glow"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Section des statistiques */}
        <section className="stats-section animate-on-scroll">
          <div className="stats-container">
            <div className="stat-item pulse-animation">
              <h3 className="stat-number">10,000+</h3>
              <p className="stat-label">{t('landing.stats.users')}</p>
            </div>
            <div className="stat-item pulse-animation delay-1">
              <h3 className="stat-number">95%</h3>
              <p className="stat-label">{t('landing.stats.success')}</p>
            </div>
            <div className="stat-item pulse-animation delay-2">
              <h3 className="stat-number">24/7</h3>
              <p className="stat-label">{t('landing.stats.support')}</p>
            </div>
          </div>
        </section>

        {/* Section des services */}
        <section className="services-section animate-on-scroll">
          <h2 className="sections-title slide-up">{t('landing.services.title')}</h2>

          <div className="services-content">
            <div className="service-box hover-lift card-slide-left">
              <img src={lucide_search_svg} alt="Icône de recherche" />
              <h3>{t('landing.services.tracking.title')}</h3>
              <ul>
                {t('landing.services.tracking.points').map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="service-box hover-lift card-slide-right">
              <img src={lucide_calendar_svg} alt="Icône de calendrier" />
              <h3>{t('landing.services.goals.title')}</h3>
              <ul>
                {t('landing.services.goals.points').map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="service-box hover-lift card-slide-left">
              <img
                src={lucide_bar_chart_svg}
                alt="Icône de graphique en barre"
              />
              <h3>{t('landing.services.reminders.title')}</h3>
              <ul>
                {t('landing.services.reminders.points').map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="service-box hover-lift card-slide-right">
              <img src={lucide_folder_svg} alt="Icône de recherche" />
              <h3>{t('landing.services.documents.title')}</h3>
              <ul>
                {t('landing.services.documents.points').map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section des tutoriel */}
        <section className="tutorial-sections animate-on-scroll">
          <h2 className="slide-up">{t('landing.howItWorks.title')}</h2>

          <div className="tutorial-content">
            <div className="tutorial-box hover-lift tutorial-slide-left">
              <div className="tutorial-image-container">
                <img
                  src={centralize_img}
                  alt="Centralisation facile des candidatures"
                />
              </div>
              <div className="text-box">
                <h3>{t('landing.howItWorks.centralize.title')}</h3>
                <p>
                  {t('landing.howItWorks.centralize.description')}
                </p>
              </div>
            </div>

            <div className="tutorial-box hover-lift tutorial-slide-right">
              <div className="tutorial-image-container">
                <img
                  src={progression_img}
                  alt="Suivi de la progression des candidatures"
                />
              </div>
              <div className="text-box">
                <h3>{t('landing.howItWorks.track.title')}</h3>
                <p>
                  {t('landing.howItWorks.track.description')}
                </p>
              </div>
            </div>

            <div className="tutorial-box hover-lift tutorial-slide-left">
              <div className="tutorial-image-container">
                <img
                  src={optimize_img}
                  alt="Optimisation pour réussir la recherche"
                />
              </div>
              <div className="text-box">
                <h3>{t('landing.howItWorks.optimize.title')}</h3>
                <p>
                  {t('landing.howItWorks.optimize.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section des témoignages */}
        <section className="testimonials-section animate-on-scroll">
          <h2 className="sections-title slide-up">{t('landing.testimonials.title')}</h2>
          
          <div className="testimonials-container">
            <div className="testimonial-card hover-lift card-slide-up">
              <div className="testimonial-content">
                <p>"{t('landing.testimonials.testimonial1.content')}"</p>
                <div className="testimonial-author">
                  <strong>{t('landing.testimonials.testimonial1.author')}</strong>
                  <span>{t('landing.testimonials.testimonial1.position')}</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card hover-lift card-slide-up delay-1">
              <div className="testimonial-content">
                <p>"{t('landing.testimonials.testimonial2.content')}"</p>
                <div className="testimonial-author">
                  <strong>{t('landing.testimonials.testimonial2.author')}</strong>
                  <span>{t('landing.testimonials.testimonial2.position')}</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card hover-lift card-slide-up delay-2">
              <div className="testimonial-content">
                <p>"{t('landing.testimonials.testimonial3.content')}"</p>
                <div className="testimonial-author">
                  <strong>{t('landing.testimonials.testimonial3.author')}</strong>
                  <span>{t('landing.testimonials.testimonial3.position')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Call to Action */}
        <section className="cta-section animate-on-scroll">
          <div className="cta-content fade-in">
            <h2>{t('landing.cta.title')}</h2>
            <p>{t('landing.cta.subtitle')}</p>
            <div className="cta-button-container button-float">
              <PrimaryButton
                text={t('landing.cta.button')}
                onClick={handleLoginClick}
                size="large"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        {/* <footer className="footer-slide-up">
          <h2>{t('landing.footer')}</h2>
        </footer> */}
      </main>
      <AuthModal
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </div>
  );
}

export default Landing;
