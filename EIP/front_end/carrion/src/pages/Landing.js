import React from 'react';
import { useNavigate } from 'react-router-dom';

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
          <h1>Bienvenue sur Carrion</h1>
          <button onClick={handleLoginClick}>Se connecter</button>
          <button onClick={handleRegisterToggle}>S'enregistrer</button>
      </div>
  );
}

export default Landing;
