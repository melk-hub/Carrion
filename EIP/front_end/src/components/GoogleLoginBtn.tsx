import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Image from 'next/image';

const GoogleLoginButton = () => {
    const GOOGLE_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    const { t } = useLanguage();
    if (!redirectUri) {
        throw new Error("Environment variable NEXT_PUBLIC_GOOGLE_REDIRECT_URI is required but not defined.");
    }
    if (!GOOGLE_ID) {
        throw new Error("Environment variable NEXT_PUBLIC_GOOGLE_CLIENT_ID is required but not defined.");
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
        <Image src="/assets/google-logo.png" alt="Google Logo" width={20} height={20} />
        {t("auth.loginWithGoogle")}
        </button>
    );
};

export default GoogleLoginButton;