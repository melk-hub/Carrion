import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/Landing.css";
import logo from "../assets/carrion_logo.png";
import landing_img from "../assets/landing_bg.png";
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
            <div style={{width: '200px', fontSize: '14px', maxHeight: '32px'}}>
              <LoginBtn onClick={handleLoginClick}/>
            </div>
          </div>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="landing-main-content">
        {/* Section landing */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-description">
              <h1>{t('landing.title')}</h1>
              <p>
                {t('landing.subtitle')}
              </p>
              <div style={{width: '50%'}}>
                <PrimaryButton
                    text={t('landing.getStarted')}
                    onClick={handleLoginClick}
                    size="large"
                />
              </div>
            </div>
            <img src={landing_img} alt="Illustration de la page d'accueil" />
          </div>
        </section>

        {/* Section des services */}
        <section className="services-section">
          <h2 className="sections-title">{t('landing.services.title')}</h2>

          <div className="services-content">
            <div className="service-box">
              <img src={lucide_search_svg} alt="Icône de recherche" />
              <h3>{t('landing.services.tracking.title')}</h3>
              <ul>
                {t('landing.services.tracking.points').map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="service-box">
              <img src={lucide_calendar_svg} alt="Icône de calendrier" />
              <h3>{t('landing.services.goals.title')}</h3>
              <ul>
                {t('landing.services.goals.points').map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="service-box">
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

            <div className="service-box">
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
        <section className="tutorial-sections">
          <h2>{t('landing.howItWorks.title')}</h2>

          <div className="tutorial-content">
            <div className="tutorial-box">
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

            <div className="tutorial-box">
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

            <div className="tutorial-box">
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

        {/* Section des témoignages/avis */}
        {/* <section className="feedback-sections">
          <h2>Témoignages</h2>

          <div className="feedback-content"></div>
        </section> */}

        {/* Footer */}
        <footer>
          <h2>{t('landing.footer')}</h2>
        </footer>
      </main>
      <AuthModal
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </div>
  );
}

export default Landing;
