import React from 'react';
import googleLogo from '../assets/google-logo.png';

const GoogleLoginButton = () => {
    const GOOGLE_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI;
    if (!redirectUri) {
        throw new Error("Environment variable REACT_APP_GOOGLE_REDIRECT_URI is required but not defined.");
    }
    if (!GOOGLE_ID) {
        throw new Error("Environment variable REACT_APP_GOOGLE_CLIENT_ID is required but not defined.");
    }
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels'
    ].join('%20');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&access_type=offline&prompt=consent`;
    const handleGoogleLogin = () => {
      window.location.href = googleAuthUrl;
    }

    return (
        <button type="button" className="google-login-button" onClick={handleGoogleLogin} style={{marginTop: "0", marginLeft: "3.5em", height: "2.5em"}}>
        <img src={googleLogo} alt="Google Logo" />
        Se connecter avec Google
        </button>
    );
};

export default GoogleLoginButton;