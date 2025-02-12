import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import MicrosoftLogin from 'react-microsoft-login';
import outlookIcon from '../assets/outlook-logo.png';
import "../styles/LoginPage.css";

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("jwt_token", token);
      setIsAuthenticated(true);
      navigate("/dashboard");
    }
  }, [location, navigate, setIsAuthenticated]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/auth/google/login";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleMicrosoftLoginSuccess = (response) => {
    console.log('Microsoft Login Success:', response);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleMicrosoftLoginFailure = (error) => {
    console.error('Microsoft Login Failure:', error);
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="login-page">
      <div className="logo" onClick={navigate("/dashboard")} >LOGO</div>
        <h2>Connexion</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Nom d'utilisateur:</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Entrez votre nom d'utilisateur"
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
            />
          </div>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <button type="submit">Se connecter</button>
          <button onClick={handleRegisterRedirect}>S'enregistrer</button>
        </form>
        <div>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            style={{ display: 'flex', alignItems: 'center' }}
          />
          <button onClick={handleMicrosoftLoginSuccess} style={{ display: 'flex', alignItems: 'center' }}>
            <img src={outlookIcon} alt="Outlook" style={{ width: '20px', marginRight: '8px' }} />
            Se connecter avec Outlook
          </button>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
