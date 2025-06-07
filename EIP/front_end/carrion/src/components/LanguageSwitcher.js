import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import globe from '../assets/globe-icon.png';

const LanguageSwitcher = ({ className = "", style }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
    changeLanguage(newLanguage);
  };

  return (
    <div className={`language-button ${className}`} onClick={toggleLanguage} style={style}>
      <img src={globe} alt="Language icon" />
      <span>{t('landing.language')}</span>
    </div>
  );
};

export default LanguageSwitcher; 