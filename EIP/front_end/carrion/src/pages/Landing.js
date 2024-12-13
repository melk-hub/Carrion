import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

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
          <h1 className="landing-title">Carrion</h1>
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
        <h2>Nos services</h2>
        <p>Découvrez ce que nous proposons pour simplifier votre gestion des candidatures :</p>
        <ul>
          <li>Suivi des candidatures</li>
          <li>Gestion de votre profil professionnel</li>
          <li>Rappels et notifications personnalisés</li>
        </ul>
      </section>
    </div>
  );
}

export default Landing;
