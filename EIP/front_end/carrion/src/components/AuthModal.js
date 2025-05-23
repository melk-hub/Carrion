import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/AuthModal.css';
import GoogleLoginButton from './GoogleLoginBtn';
import outlookIcon from '../assets/outlook-logo.png';
import { motion, AnimatePresence } from 'framer-motion';

function AuthModal({ isOpen, onClose, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'login');
  const [direction, setDirection] = useState(1);
  const [credentials, setCredentials] = useState({ identifier: '', password: '', confirmPassword: '', username: '', firstName: 'John', lastName: 'Doe', birthDate: '1995-06-15' });
  const [personalInfo, setPersonalInfo] = useState({ nom: '', prenom: '', dateNaissance: '', email: '', ecole: '', ville: '', job: '', cv: null, linkedin: '', portfolio: '', description: '', });
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setActiveTab(defaultTab || 'login');
  }, [defaultTab]);

  if (!isOpen) return null;

  const handleChange = (e, isCredential = true) => {
    const { name, value } = e.target;
    if (isCredential) {
      setCredentials({ ...credentials, [name]: value });
    } else {
      setPersonalInfo({ ...personalInfo, [name]: value });
    }
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setDirection(tab === 'login' ? -1 : 1);
    setActiveTab(tab);
  };

  const handleClose = () => {
    setActiveTab(defaultTab || 'login');
    setDirection(1);
    onClose();
  };

  const variants = {
    enter: (direction) => ({ x: direction * 100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction * -100, opacity: 0 })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'login') {
      try {
        const response = await fetch(`${API_URL}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: credentials.identifier, password: credentials.password }),
          credentials: 'include',
        });

      if (response.ok) {
          setIsAuthenticated(true);
          navigate('/home?new=true');
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Identifiants incorrects.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
    }
    if (activeTab === 'register') {
      if (credentials.password !== credentials.confirmPassword) {
        alert("Les mots de passe ne correspondent pas !");
        return;
      }
    
      try {
        const response = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: credentials.email, password: credentials.password, firstName: credentials.firstName, lastName: credentials.lastName, birthDate: credentials.birthDate, email: credentials.email }),
          credentials: 'include',
        });
    
        if (response.ok) {
          setIsAuthenticated(true);
          navigate('/home?new=true');
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Erreur lors de l'inscription.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={handleClose}>×</button>
        <h1>{activeTab === 'login' ? 'Bienvenue !' : 'Nous rejoindre !'}</h1>

        <div className="tabs">
          <button className={activeTab === 'login' ? 'active' : ''} onClick={() => handleTabChange('login')}>Se connecter</button>
          <button className={activeTab === 'register' ? 'active' : ''} onClick={() => handleTabChange('register')}>Créer un compte</button>
        </div>

        <hr />

        <AnimatePresence mode="wait">
          {activeTab === 'login' && (
            <motion.div key="login" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <form onSubmit={handleSubmit}>
                <label>Email / Nom d'utilisateur</label>
                <input type="text" name="identifier" placeholder="Email / Nom d'utilisateur" value={credentials.identifier} onChange={handleChange} required />
                <label>Mot de passe</label>
                <input type="password" name="password" placeholder="Mot de passe" value={credentials.password} onChange={handleChange} required />
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="primary-btn">Se connecter</button>
              </form>
            </motion.div>
          )}

          {activeTab === 'register' && (
            <motion.div key="register" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <form onSubmit={handleSubmit}>
              <div className="row-inputs">
                  <div>
                    <label>Email</label>
                  <input type="email" name="email" placeholder="Email" value={credentials.email} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Nom d'utilisateur</label>
                    <input type="username" name="username" placeholder="Nom d'utilisateur" value={credentials.username} onChange={handleChange} required />
                  </div>
                </div>

                <div className="row-inputs">
                  <div>
                    <label>Mot de passe</label>
                    <input type="password" name="password" placeholder="Mot de passe" value={credentials.password} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Confirmer le mot de passe</label>
                    <input type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" value={credentials.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
                <button type="submit" className="primary-btn">S'inscrire</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <hr />

        <div className="social-buttons">
          <GoogleLoginButton />
          <button className="outlook-btn" onClick={() => navigate('/home')}>
            <img src={outlookIcon} alt="Outlook" /> Se connecter avec Outlook
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
