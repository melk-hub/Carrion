import React from "react";
import { forwardRef } from "react";

const CustomDateInput = forwardRef(
  (
    { value, onClick }: { value?: string; onClick?: () => void },
    ref: React.Ref<HTMLButtonElement>
  ) => (
    <button
      type="button"
      className="date-picker-custom-input"
      onClick={onClick}
      ref={ref}
    >
      {value || "jj/mm/aaaa"}
    </button>
  )
);
CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
