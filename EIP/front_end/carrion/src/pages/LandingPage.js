import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import googleIcon from '../assets/google-logo.png';
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

  return (
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

            <div>
                <button onClick={handleLoginClick} style={{ display: 'flex', alignItems: 'center' }}>
                <img src={googleIcon} alt="Google" style={{ width: '20px', marginRight: '8px' }} />
                Se connecter avec Google
                </button>
                
                <button onClick={handleLoginClick} style={{ display: 'flex', alignItems: 'center' }}>
                <img src={outlookIcon} alt="Outlook" style={{ width: '20px', marginRight: '8px' }} />
                Se connecter avec Outlook
                </button>
            </div>
        </>
        )}
    </div>
  );
}

export default LandingPage;
