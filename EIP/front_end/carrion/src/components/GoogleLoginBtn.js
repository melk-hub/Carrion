import React from 'react';

const GoogleLoginButton = () => {
    const GOOGLE_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email%20profile%20https://www.googleapis.com/auth/gmail.readonly%20https://www.googleapis.com/auth/gmail.modify%20https://www.googleapis.com/auth/gmail.labels`;
    const handleGoogleLogin = () => {
      window.location.href = googleAuthUrl;
    }

    return (
        <button type="button" className="google-login-button" onClick={handleGoogleLogin} style={{marginTop: "0", marginLeft: "3.5em", height: "2.5em"}}>
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" />
        Se connecter avec Google
        </button>
    );
};

export default GoogleLoginButton;
