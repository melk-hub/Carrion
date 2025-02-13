import React from 'react';
// import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
    const GOOGLE_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const API_URL = process.env.REACT_APP_API_URL;

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_ID}&redirect_uri=${encodeURIComponent(`${API_URL}/auth/google/callback)`)}&scope=email%20profile`;

    const handleGoogleLogin = () => {
        window.location.href = googleAuthUrl;
    };

    return (
        <button onClick={handleGoogleLogin} style={{ display: 'flex', alignItems: 'center' }}>
            Se connecter avec Google
        </button>
    );
};

export default GoogleLoginButton;
