import React from 'react';

function InputField({ label, required, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={props.id || props.name}>
        {label}
        {required && <span style={{ color: '#e53e3e' }}>*</span>}
      </label>
      <input id={props.id || props.name} required={required} {...props} />
    </div>
  );
}

export default InputField;