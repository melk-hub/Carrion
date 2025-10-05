import React from "react";
import "../styles/Button.css";

const PrimaryButton = ({ text, onClick, disabled, size }) => {
  return (
    <button type="button" onClick={onClick} className={`primary-button ${size}`} disabled={disabled}>
      <b>{text}</b>
    </button>
  );
};

export default PrimaryButton;
