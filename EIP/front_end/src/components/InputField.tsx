"use client";

import React, { JSX } from "react";

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
  const { label, id, name, required } = props;
  const inputId = id || name;

  let inputElement: JSX.Element;

  if (props.as === "textarea") {
    const { label, as, ...rest } = props;
    inputElement = <textarea id={inputId} {...rest} />;
  } else {
    const { label, as, ...rest } = props;
    inputElement = <input id={inputId} {...rest} />;
  }

  return (
    <div className="input-field-group">
      <label htmlFor={inputId}>
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      {inputElement}
    </div>
  );
};

export default InputField;
