import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import MicrosoftLogin from 'react-microsoft-login';
import outlookIcon from '../assets/outlook-logo.png';
import "../styles/LoginPage.css";

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

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

  const handleGoogleLoginSuccess = (response) => {
    console.log('Google Login Success:', response);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google Login Failure:', error);
  };

  const handleMicrosoftLoginSuccess = (response) => {
    console.log('Microsoft Login Success:', response);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleMicrosoftLoginFailure = (error) => {
    console.error('Microsoft Login Failure:', error);
  };

  const handleRegisterRedirect = (response) => {
    navigate('/register');
  }

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <div className="login-page">
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
                <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onFailure={handleGoogleLoginFailure}
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
