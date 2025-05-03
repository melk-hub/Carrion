import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../AuthContext";
import "../styles/Landing.css";
import logo from "../assets/carrion_logo.png";
import globe from "../assets/globe-icon.png";
import landing_img from "../assets/landing_bg.png";
import optimize_img from "../assets/optimize_landing.jpg";
import progression_img from "../assets/progression_landing.png";
import centralize_img from "../assets/centralize_landing.png";
import PrimaryButton from "../components/PrimaryButton";
import lucide_search_svg from "../assets/svg/search_lucide.svg";
import lucide_calendar_svg from "../assets/svg/calendar_lucide.svg";
import lucide_bar_chart_svg from "../assets/svg/bar_chart_lucide.svg";
import lucide_folder_svg from "../assets/svg/folder_lucide.svg";

function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 5;
  const topThreshold = 5;

  const handleLoginClick = () => {
    navigate("/login");
  };

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
            <div className="language-button">
              <img src={globe} alt="Icône de la langue" />
              <span>Français</span>
            </div>
            <PrimaryButton
              text="Se connecter"
              onClick={handleLoginClick}
              size="medium"
            />
          </div>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="landing-main-content">
        {/* Section landing */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-description">
              <h1>La plateforme idéale pour gérer ses candidatures</h1>
              <p>
                Simplifiez votre recherche d'emploi
                <br /> grâce à Carrion
              </p>
              <PrimaryButton
                text="Démarrer sans attendre"
                onClick={handleLoginClick}
                size="large"
              />
            </div>
            <img src={landing_img} alt="Illustration de la page d'accueil" />
          </div>
        </section>

        {/* Section des services */}
        <section className="services-section">
          <h2 className="sections-title">Nos Services</h2>

          <div className="services-content">
            <div className="service-box">
              <img src={lucide_search_svg} alt="Icône de recherche" />
              <h3>Suivi de vos candidatures personnelles</h3>
              <ul>
                <li>
                  Gérez toutes vos candidatures via un tableau de bord intuitif.
                </li>
                <li>
                  Suivez facilement les statuts et ajoutez des notes clés.
                </li>
                <li>Ne manquez plus jamais une opportunité importante.</li>
              </ul>
            </div>

            <div className="service-box">
              <img src={lucide_calendar_svg} alt="Icône de calendrier" />
              <h3>Suivi des objectifs de candidature</h3>
              <ul>
                <li>
                  Définissez et suivez vos objectifs de recherche d'emploi.
                </li>
                <li>
                  Recevez des conseils ciblés pour rester sur la bonne voie.
                </li>
                <li>
                  Atteignez vos objectifs professionnels dans les temps voulus.
                </li>
              </ul>
            </div>

            <div className="service-box">
              <img
                src={lucide_bar_chart_svg}
                alt="Icône de graphique en barre"
              />
              <h3>Rappels et notifications personnalisés</h3>
              <ul>
                <li>
                  Recevez des rappels automatiques (suivis, entretiens...).
                </li>
                <li>Soyez alerté(e) des prochaines étapes importantes.</li>
                <li>Restez parfaitement organisé(e) et proactif(ve).</li>
              </ul>
            </div>

            <div className="service-box">
              <img src={lucide_folder_svg} alt="Icône de recherche" />
              <h3>Espace documents professionnels</h3>
              <ul>
                <li>
                  Centralisez tout vos documents clés (CV, lettres,
                  portfolios...)
                </li>
                <li>Gérez et retrouvez facilement vos fichiez importants</li>
                <li>
                  Accédez à tout, partout, pour tout simplifier vos démarche
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section des tutoriel */}
        <section className="tutorial-sections">
          <h2>Comment ça marche ?</h2>

          <div className="tutorial-content">
            <div className="tutorial-box">
              <div className="tutorial-image-container">
                <img
                  src={centralize_img}
                  alt="Centralisation facile des candidatures"
                />
              </div>
              <div className="text-box">
                <h3>Centralisez Facilement</h3>
                <p>
                  Ajoutez vos candidatures (stages ou emplois) et documents
                  essentiels. Carrion simplifie votre organisation dès le
                  départ.
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
                <h3>Suivez Votre Progression</h3>
                <p>
                  Visualisez l'avancement de chaque démarche grâce à notre suivi
                  automatisé. Évaluez où vous en êtes en un coup d'oeil.{" "}
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
                <h3>Optimisez Pour Réussir</h3>
                <p>
                  Utilisez les informations de suivi pour ajuster votre approche
                  et maximiser vos chances de succès dans votre recherche.
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
          <h2>Footer TBD</h2>
        </footer>
      </main>
    </div>
  );
}

export default Landing;
