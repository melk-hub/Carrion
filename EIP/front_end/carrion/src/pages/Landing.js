import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/Landing.css';
import logo from '../assets/carrion_logo2.png';

function Landing() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterToggle = () => {
    navigate('/register');
  };
  
  useEffect(() => {
    document.body.classList.add('landing-page');
  
    return () => {
      document.body.classList.remove('landing-page');
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".fixed-header");
      const scrollPosition = window.scrollY;
      const maxScroll = window.innerHeight;
      const progress = Math.min(scrollPosition / maxScroll, 1);
  
      header.style.width = `${80 + 20 * progress}%`;
      header.style.left = `${10 - 10 * progress}%`;
    };
  
    const handleButtonClick = () => {
      const currentScroll = window.scrollY;
      const viewportHeight = window.innerHeight;
      const nextPageScroll = currentScroll === 0 ? viewportHeight : Math.ceil(currentScroll / viewportHeight) * viewportHeight;
  
      window.scrollTo({top: nextPageScroll, behavior: "smooth",});
    };
  
    window.addEventListener("scroll", handleScroll);
  
    const button = document.querySelector(".scroll-button");
    if (button) {
      button.addEventListener("click", handleButtonClick);
    }
  
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (button) {
        button.removeEventListener("click", handleButtonClick);
      }
    };
  }, []);

  return (
    <div>
      <header className="fixed-header">
        <div className="logo"><img src={logo} alt="Carrion"/></div>
        <div 
          className="header-buttons" 
          style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)" }} >
            <button onClick={handleLoginClick} className="login-button">Se connecter</button>
            <button onClick={handleRegisterToggle} className="register-button">S'inscrire</button>
        </div>
      </header>

      <div className="intro-section">
        <h1>La plateforme idéale pour gérer ses candidatures</h1>
        <p>Simplifiez votre recherche d'emploi grâce a Carrion</p>
      </div>
      
      <div className="landing-background">
        <button className="scroll-button">
          <span className="arrow">↓</span>
        </button>
      </div>

      <section className="services-section">
        <h2 className="services-title">Nos services</h2>
        <div className="services-container">
          <div className="service-card">
            <h3>Suivi de vos candidatures personnelles</h3>
            <p>Gérez facilement toutes vos candidatures depuis un tableau de bord intuitif. Suivez les statuts, ajoutez des notes, et ne manquez aucune opportunité</p>
          </div>
          <div className="service-card">
            <h3>Suivi des objectifs de candidature</h3>
            <p>Définissez et suivez vos objectifs personnels dans votre recherche d'emploi. Vous recevez des conseils pour vous assurer de rester sur la bonne voie et atteindre vos objectifs en temps voulu</p>
          </div>
          <div className="service-card">
            <h3>Rappels et notifications personnalisés</h3>
            <p>Recevez des rappels automatiques pour vos candidatures en attente de réponse ou vos entretiens à venir. Restez organisé et proactif.</p>
          </div>
          <div className="service-card">
            <h3>Espace documents professionels</h3>
            <p>Centralisez et gérez tous vos documents importants, tels que CV, lettres de motivation, et portfolios. Accédez-y facilement à tout moment pour simplifier vos démarches</p>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="how-it-works-image"></div>
          <div className="how-it-works-text">
            <h2>Comment Ça Marche ?</h2>
            <h3>Simplicité et Efficacité</h3>
            <p>Carrion simplifie la recherche d'emploi en offrant un suivi automatisé des candidatures. Notre plateforme aide les travailleurs à évaluer leur progression dans leur quête de stages ou d'emplois, leur permettant ainsi d'optimiser leurs chances de succès.</p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="testimonials-title">Témoignages</h2>
        <div className="testimonials-container">
          <div className="testimonial">
            <p>"Carrion m'a aidé à suivre mes candidatures de manière organisée et efficace. Je recommande vivement cette plateforme."</p>
            <p className="testimonial-author">Marie L.</p>
          </div>
          <div className="testimonial">
            <p>"Grâce à Carrion, j'ai pu visualiser mes progrès dans ma recherche d'emploi. Une expérience très positive."</p>
            <p className="testimonial-author">Pierre G.</p>
          </div>
          <div className="testimonial">
            <p>"La fonction de suivi automatique de Carrion m'a permis de rester motivée et organisée. Merci pour ce service très utile."</p>
            <p className="testimonial-author">Sophie B.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
