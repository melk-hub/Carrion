import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/LanguageDropdown.css";
import Image from "next/image";

const LanguageDropdown = ({ className = "", style = {} }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "fr", name: "Français", flag: "/assets/france.png" },
    { code: "en", name: "English", flag: "/assets/united-kingdom.png" },
  ];

  const currentLang = languages.find((lang) => lang.code === currentLanguage);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
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
        <Image
          src={currentLang?.flag as string}
          alt={currentLang?.name as string}
          className="flag-icon"
          width={24}
          height={24}
        />
        <span className="language-name">{currentLang?.name}</span>
        <svg
          className={`dropdown-arrow ${isOpen ? "open" : ""}`}
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
              className={`language-option ${
                currentLanguage === language.code ? "active" : ""
              }`}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <img
                src={language.flag}
                alt={language.name}
                className="flag-icon"
              />
              <span className="language-name">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
