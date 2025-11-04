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

  const { as, ...rest } = props;
  return (
    <div className={styles.formGroup}>
      <label htmlFor={inputId}>
        {label}
        {required && <span className={styles.requiredStar}>*</span>}
      </label>
      {as === "textarea" ? (
        <textarea
          id={inputId}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
};

export default InputField;
