import React from "react";
import "../styles/Button.css";
import { useLanguage } from "../contexts/LanguageContext";

const PrimaryButton = ({ onClick, disabled = false, size = "medium", style = "" }) => {
  const { currentLanguage } = useLanguage();
  const text = currentLanguage === 'fr' ? "Connexion" : "Login";
  const hoverText = currentLanguage === 'fr' ? "C'est parti !" : "Let's go!";
  
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={`primary-button ${size} login-btn`} 
      disabled={disabled}
      style={style}
    >
      <img src="/assets/carrion_logo.png" alt="Carrion" className="carrion-logo" />
      <span className="text-button"><b>{text}</b></span>
      <span className="hover-text-button">{hoverText}</span>
    </button>
  );
};

export default PrimaryButton;
