import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/carrion_logo2.png';

function Header() {
  const navigate = useNavigate();
  return (
    <header className="header">
      <h1 onClick={() => navigate('/dashboard')} className="logo-button"><img src={logo} alt="Carrion"/></h1>
      <div className="navigation-buttons">
        <button onClick={() => navigate('/dashboard')} className='applications-button'>Candidatures</button>
        <button onClick={() => navigate('/archives')} className='archives-button'>Archives</button>
        <button onClick={() => navigate('/objectives')} className='objectives-button'>Objectifs</button>
        <button onClick={() => navigate('/parameters')} className='parameters-button'>Profil</button>
      </div>
      <button onClick={() => navigate('/')} className="logout-button">Déconnexion</button>
    </header>
  );
}

export default Header;
