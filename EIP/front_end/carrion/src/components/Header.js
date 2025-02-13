import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/carrion_logo2.png';
import axios from 'axios';

function Header({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
      setIsAuthenticated(false);
      navigate('/')
    } catch (error) {
      console.error('Error while logging out', error);
    }
  };

  return (
    <header className="header">
      <h1 onClick={() => navigate('/dashboard')} className="logo-button"><img src={logo} alt="Carrion"/></h1>
      <div className="navigation-buttons">
        <button onClick={() => navigate('/dashboard')} className='applications-button'>Candidatures</button>
        <button onClick={() => navigate('/archives')} className='archives-button'>Archives</button>
        <button onClick={() => navigate('/objectives')} className='objectives-button'>Objectifs</button>
        <button onClick={() => navigate('/parameters')} className='parameters-button'>Profil</button>
      </div>
      <button onClick={() => handleLogout()} className="logout-button">Déconnexion</button>
    </header>
  );
}

export default Header;
