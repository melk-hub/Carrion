import React from "react";
import styles from "./Button.module.css";

interface PrimaryButtonProps {
  text: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
}

const PrimaryButton = ({
  text,
  onClick,
  disabled = false,
  size = "medium",
  style,
  type = "button",
}: PrimaryButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.primaryButton} ${styles[size]}`}
      disabled={disabled}
      style={style}
    >
      <b>{text}</b>
    </button>
  );
};

export default PrimaryButton;