import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';
import logo from '../assets/logo-carrion.png';

function Landing() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterToggle = () => {
    navigate('/register');
  };

  return (
    <div>
      <div className="landing-background">
        <header className="landing-header fixed-header">
          <h1 className="landing-title"><img src={logo} alt="Carrion Logo" className="landing-logo"/></h1>
          <div className="landing-buttons">
            <button onClick={handleLoginClick} className="login-button">Se connecter</button>
            <button onClick={handleRegisterToggle} className="register-button">S'enregistrer</button>
          </div>
        </header>

        <main className="landing-main">
        <h2 className="landing-welcome">Bienvenue sur Carrion</h2>
          <p className="landing-description">Explorez notre plateforme dédiée à la gestion de candidatures pour les jeunes travailleurs cherchant des stages ou des emplois.</p>
        </main>
      </div>

      <section className="services-section">
        <h2 className="services-title">Nos services</h2>
        <div className="services-container">
          <div className="service-card">
            <div className="service-number">1</div>
            <h3>Suivi de vos candidatures personnelles</h3>
            <p>Description</p>
          </div>
          <div className="service-card">
            <div className="service-number">2</div>
            <h3>Gestion de votre profil professionnel</h3>
            <p>Description</p>
          </div>
          <div className="service-card">
            <div className="service-number">3</div>
            <h3>Rappels et notifications personnalisés</h3>
            <p>Description</p>
          </div>
        </div>
      </section>
      
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="how-it-works-image">
            <div className="placeholder-image"></div>
          </div>
          <div className="how-it-works-text">
            <h2>Comment Ça Marche ?</h2>
            <h3>Simplicité et Efficacité</h3>
            <p>
              Carrion simplifie la recherche d'emploi en offrant un suivi automatisé des candidatures. Notre plateforme aide les jeunes travailleurs à évaluer leur progression dans leur quête de stages ou d'emplois, leur permettant ainsi d'optimiser leurs chances de succès.
            </p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="testimonials-title">Témoignages</h2>
        <div className="testimonials-container">
          <div className="testimonial testimonial-left">
            <p>"Carrion m'a aidé à suivre mes candidatures de manière organisée et efficace. Je recommande vivement cette plateforme."</p>
            <p className="testimonial-author">Marie L.</p>
          </div>
          <div className="testimonial testimonial-right">
            <p>"Grâce à Carrion, j'ai pu visualiser mes progrès dans ma recherche d'emploi. Une expérience très positive."</p>
            <p className="testimonial-author">Pierre G.</p>
          </div>
          <div className="testimonial testimonial-left">
            <p>"La fonction de suivi automatique de Carrion m'a permis de rester motivée et organisée. Merci pour ce service très utile."</p>
            <p className="testimonial-author">Sophie B.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
