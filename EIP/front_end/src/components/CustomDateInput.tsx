import React from "react";
import { forwardRef } from "react";

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    className="date-picker-custom-input"
    onClick={onClick}
    ref={ref}
  >
    {value || "jj/mm/aaaa"}
  </button>
));
CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
