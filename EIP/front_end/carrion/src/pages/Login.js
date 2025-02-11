import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import MicrosoftLogin from 'react-microsoft-login';
import outlookIcon from '../assets/outlook-logo.png';
import "../styles/LoginPage.css";
import GoogleLoginButton from './GoogleLoginBtn';

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const API_URL = process.env.REACT_APP_API_URL;

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

      const textData = await response.text();
      let data;
        try {
            data = JSON.parse(textData);
        } catch (error) {
            data = { accessToken: textData };
        }

      if (response.ok) {
          localStorage.setItem("token", data.accessToken);
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
        <h2>Connexion</h2>
        <form onSubmit={handleLogin}>
            <div>
                <label>Nom d'utilisateur:</label>
                <input
                    type="text"
                    name="identifier"
                    value={credentials.identifier}
                    onChange={handleChange}
                    placeholder="Entrez votre nom d'utilisateur"
                    //required
                />
            </div>
            <div>
                <label>Mot de passe:</label>
                <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Entrez votre mot de passe"
                    //required
                />
            </div>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button type="submit">Se connecter</button>
            <button onClick={handleRegisterRedirect}>
              S'enregistrer
            </button>
        </form>
        <div>
          <GoogleLoginButton></GoogleLoginButton>
          <button onClick={handleLoginSuccess} style={{ display: 'flex', alignItems: 'center' }}>
          <img src={outlookIcon} alt="Outlook" style={{ width: '20px', marginRight: '8px' }} />
          Se connecter avec Outlook
          </button>
        </div>
    </div>
  );
}

export default Login;
