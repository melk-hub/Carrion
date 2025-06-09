import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import useOutlookAuth from '../hooks/useOutlookAuth';
import outlookIcon from '../assets/outlook-logo.svg';

const OutlookLoginButton = () => {
  const { t } = useLanguage();
  const { initiateOutlookLogin } = useOutlookAuth();

  return (
    <button 
      className="google-login-button outlook-login-button outlook-btn"
      onClick={initiateOutlookLogin}
      type="button"
      style={{
        background: '#0078d4',
        color: 'white',
      }}
    >
      <img src={outlookIcon} alt="Outlook" style={{ zIndex: 1 }} /> 
      {t('auth.loginWithOutlook')}
    </button>
  );
};

export default OutlookLoginButton; 