// src/components/PrimaryButton.tsx

import React from "react";
import "../styles/Button.css";

interface PrimaryButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  style?: React.CSSProperties;
}

const PrimaryButton = ({
  text,
  onClick,
  disabled = false,
  size = "medium",
  style, // 2. Récupérer la prop
}: PrimaryButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      // className={`primary-button ${size}`}
      disabled={disabled}
      // style={style}
    >
      <b>{text}</b>
    </button>
  );
};

export default PrimaryButton;