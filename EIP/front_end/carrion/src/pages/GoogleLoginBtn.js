import React from 'react';
import "../styles/LoginPage.css";

const GoogleLoginButton = () => {
    const GOOGLE_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const API_URL = process.env.REACT_APP_API_URL;
    const redirectUri = `${API_URL}/auth/google/callback`; 
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email%20profile`;

    const handleGoogleLogin = () => {
        window.location.href = googleAuthUrl;
    };

    return (
        <button type="button" className="google-login-button" onClick={handleGoogleLogin} style={{marginTop: "0", marginRight: "4em", marginLeft: "3.5em", height: "2.5em"}}>
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" />
        Se connecter avec Google
        </button>
    );
};

export default GoogleLoginButton;
