import React from 'react';
import { useNavigate } from 'react-router-dom';
import googleIcon from '../assets/google-logo.png';
import outlookIcon from '../assets/outlook-logo.png';

function LandingPage({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setIsAuthenticated(true);
    navigate('/home');
  };

  const handleRegisterClick = () => {
    setIsAuthenticated(true);
    navigate('/home');
  };

  return (
    <div>
      <h1>Bienvenue sur Carrion</h1>
      
      <button onClick={handleLoginClick}>Login</button>
      <button onClick={handleRegisterClick}>Register</button>

      <div>
        <button onClick={handleLoginClick} style={{ display: 'flex', alignItems: 'center' }}>
          <img src={googleIcon} alt="Google" style={{ width: '20px', marginRight: '8px' }} />
          Login with Google
        </button>
        
        <button onClick={handleLoginClick} style={{ display: 'flex', alignItems: 'center' }}>
          <img src={outlookIcon} alt="Outlook" style={{ width: '20px', marginRight: '8px' }} />
          Login with Outlook
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
