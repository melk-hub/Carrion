import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import frenchFlag from '../assets/france.png';
import ukFlag from '../assets/united-kingdom.png';
import '../styles/LanguageDropdown.css';

const LanguageDropdown = ({ className = "", style }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'fr', name: 'Français', flag: frenchFlag },
    { code: 'en', name: 'English', flag: ukFlag }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className={`language-dropdown ${className}`} ref={dropdownRef}>
      <button 
        className="language-dropdown-button" 
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={style}
      >
        <img src={currentLang.flag} alt={currentLang.name} className="flag-icon" />
        <span className="language-name">{currentLang.name}</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      
      {isOpen && (
        <div className="language-dropdown-menu">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${currentLanguage === language.code ? 'active' : ''}`}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <img src={language.flag} alt={language.name} className="flag-icon" />
              <span className="language-name">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown; 