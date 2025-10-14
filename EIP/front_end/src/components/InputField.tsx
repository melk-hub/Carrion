"use client";

import React from "react";

import styles from "./InfosModal/InfosModal.module.css";

interface BaseProps {
  label: string;
  id?: string;
}

type InputProps = BaseProps & {
  as?: "input";
} & React.InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps & {
  as: "textarea";
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type InputFieldProps = InputProps | TextareaProps;

const InputField = (props: InputFieldProps) => {
  const { label, id, required } = props;

  const inputId = id || props.name;

  if (props.as === "textarea") {
    const { label, as, ...rest } = props;
    return (
      <div className={styles.formGroup}>
        <label htmlFor={inputId}>
          {label}
          {required && <span className={styles.requiredStar}>*</span>}
        </label>
        <textarea id={inputId} {...rest} />
      </div>
    );
  }
};

export default InputField;
