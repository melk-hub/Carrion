import React from "react";
import { forwardRef } from "react";
import styles from "../app/(dashboard)/profile/Profile.module.css";

const CustomDateInput = forwardRef(
  (
    { value, onClick }: { value?: string; onClick?: () => void },
    ref: React.Ref<HTMLButtonElement>
  ) => (
    <button
      type="button"
      className={styles.datePickerCustomInput}
      onClick={onClick}
      ref={ref}
    >
      {value || "dd/mm/yyyy"}
    </button>
  )
);
CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
