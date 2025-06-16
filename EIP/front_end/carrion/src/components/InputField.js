import React from 'react';

function InputField({ label, required, ...props }) {
  return (
    <div>
      <label htmlFor={props.id}>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input required={required} {...props} />
    </div>
  );
}

export default InputField;