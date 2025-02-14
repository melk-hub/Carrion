import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import MicrosoftLogin from 'react-microsoft-login';
import outlookIcon from '../assets/outlook-logo.png';
import "../styles/LoginPage.css";
import GoogleLoginButton from './GoogleLoginBtn';
import logo from '../assets/carrion_logo.png';

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  useEffect(() => {
      document.body.classList.add('login-page-bg');
    
      return () => {
        document.body.classList.remove('login-page-bg');
      };
    }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response;

      if (response.ok) {
          setIsAuthenticated(true);
          navigate('/dashboard');
      } else {
        setErrorMessage(data.message || 'Identifiants incorrects.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  }
  return (
    <div className="login-page">
      <img src={logo} className="logo-home" onClick={() => navigate("/")} />

      <div className="login-container">
        <h2>Connexion</h2>
        <form onSubmit={handleLogin}>
          <div className="form-content">
            <div className="input-fields">
              <div className="input-group">
                <label>Nom d'utilisateur:</label>
                <input
                  type="text"
                  name="identifier"
                  value={credentials.identifier}
                  onChange={handleChange}
                  placeholder="Entrez votre nom d'utilisateur"
                  required
                />
              </div>

              <div className="input-group">
                <label>Mot de passe:</label>
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Entrez votre mot de passe"
                  required
                />
              </div>

              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>

              <div className="button-group">
                <button type="submit" className="login-button">Se connecter</button>
                <button onClick={handleRegisterRedirect} className="register-button">
                  Pas de compte? S'enregistrer
                </button>
              </div>
              </div>
                <div className="social-login" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                <GoogleLoginButton />
                <button onClick={handleLoginSuccess} className="outlook-button" style={{marginTop: "0", marginRight: "2em", marginLeft: "2em", height: "2.5em"}} >
                  <img src={outlookIcon} alt="Outlook" />
                  Se connecter avec Outlook
                </button>
              </div>
        </form>
      </div>
    </div>
  );
}

export default Login;