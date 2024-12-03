import React from 'react';
import '../styles/DefaultBar.css';

const DefaultBar = () => {
  return (
    <header className="header">
      <div className="logo">MonLogo</div>
      <nav className="nav">
        <a href="#login" className="nav-link">Se connecter</a>
        <a href="#signup" className="nav-link">S'inscrire</a>
      </nav>
    </header>
  );
};

export default DefaultBar;