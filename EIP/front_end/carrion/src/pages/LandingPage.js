import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import MicrosoftLogin from 'react-microsoft-login';
import RegisterForm from '../components/RegisterForm';
import outlookIcon from '../assets/outlook-logo.png';

function LandingPage({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginClick = async () => {
    // try {
    //   const response = await fetch('http://localhost:5000/login', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ username, password }),
    //   });

    //   const data = await response.json();
      
    //   if (response.ok) {
    //     console.log('Login successful:', data);
        setIsAuthenticated(true);
        navigate('/home');
    //   } else {
    //     console.log('Login failed:', data.message || 'Invalid credentials');
    //   }
    // } catch (error) {
    //   console.error('Error logging in:', error);
    // }
  };

  const handleRegisterToggle = () => {
    setIsRegistering(true);
  };

  const handleRegisterSubmit = async (formData) => {
    // try {
    //   const response = await fetch('http://localhost:5000/register', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData),
    //   });

    //   const data = await response.json();
    //   if (response.ok) {
        setIsAuthenticated(true);
        navigate('/home');
    //   } else {
    //     console.log('Registration failed:', data.message || 'Error registering');
    //   }
    // } catch (error) {
    //   console.error('Error registering:', error);
    // }
  };

  const handleGoogleLoginSuccess = (response) => {
    console.log('Google Login Success:', response);
    setIsAuthenticated(true);
    navigate('/home');
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google Login Failure:', error);
  };

  const handleMicrosoftLoginSuccess = (response) => {
    console.log('Microsoft Login Success:', response);
    setIsAuthenticated(true);
    navigate('/home');
  };

  const handleMicrosoftLoginFailure = (error) => {
    console.error('Microsoft Login Failure:', error);
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <div>
            <h1>Bienvenue sur Carrion</h1>

            {isRegistering ? (
                <RegisterForm onSubmit={handleRegisterSubmit} />
            ) : (
                <>
                    <div>
                        <label>
                        Nom d'utilisateur:
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Entrer le nom d'utilisateur"
                        />
                        </label>
                    </div>
                    
                    <div>
                        <label>
                        Mot de passe:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Entrer le mot de passe"
                        />
                        </label>
                    </div>

                    <button onClick={handleLoginClick}>Se connecter</button>
                    <button onClick={handleRegisterToggle}>S'enregistrer</button>

                    <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onFailure={handleGoogleLoginFailure}
                    />
                    {/* <MicrosoftLogin
                        clientId="YOUR_MICROSOFT_CLIENT_ID"
                        buttonText="Se connecter avec Outlook"
                        authCallback={handleMicrosoftLoginSuccess}
                        onFailure={handleMicrosoftLoginFailure}
                        redirectUri="http://localhost:3000"
                        render={(renderProps) => (
                            <button
                            onClick={renderProps.onClick}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#0078D4',
                                color: '#fff',
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginTop: '10px',
                            }}
                            >
                            <img
                                src={outlookIcon}
                                alt="Outlook"
                                style={{ width: '20px', marginRight: '8px' }}
                            />
                            Se connecter avec Outlook
                            </button>
                        )}
                    /> */}
                    <button onClick={handleLoginClick} style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={outlookIcon} alt="Outlook" style={{ width: '20px', marginRight: '8px' }} />
                    Se connecter avec Outlook
                    </button>
                </>
            )}
        </div>
    </GoogleOAuthProvider>
  );
}

export default LandingPage;
