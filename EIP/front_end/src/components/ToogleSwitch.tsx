"use client";

import React from "react";
import "@/styles/ToogleSwitch.css";

interface ToggleSwitchProps {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
}

const ToggleSwitch = ({ isChecked, setIsChecked }: ToggleSwitchProps) => {
  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    <label
      className="reduceMotionToggle st-reduceMotionToggleBtn"
      htmlFor="reduceMotionToggle"
    >
      <input
        className="reduceMotionToggleInput"
        id="reduceMotionToggle"
        type="checkbox"
        checked={isChecked}
        onChange={handleToggle}
      />
      <svg
        strokeWidth="0"
        stroke="currentColor"
        fill="currentColor"
        viewBox="0 0 18 18"
        height="18"
        width="18"
      >
        <mask id="lineMask">
          <rect fill="white" height="18" width="18"></rect>
          <rect
            fill="black"
            style={{ rotate: "30deg" } as React.CSSProperties}
            height="16"
            width="4.1"
            y="-5"
            x="9.807"
            className="line"
          ></rect>
        </mask>
        <rect
          style={{ rotate: "30deg" } as React.CSSProperties}
          height="13"
          width="1.3"
          y="-3.3"
          x="11.3"
          className="line"
        ></rect>
        <g mask="url(#lineMask)">
          <circle
            style={
              {
                "--_toCenterXOffset": "5.76px",
                "--_appearOffset": "-.1s",
              } as React.CSSProperties
            }
            fill="none"
            strokeWidth=".1"
            r="2.95"
            cy="9"
            cx="3.24"
            className="ballTrace"
          ></circle>
          <circle
            style={
              {
                "--_toCenterXOffset": "3px",
                "--_appearOffset": ".02s",
              } as React.CSSProperties
            }
            fill="none"
            strokeWidth=".2"
            r="2.9"
            cy="9"
            cx="6"
            className="ballTrace"
          ></circle>
          <circle
            style={
              {
                "--_toCenterXOffset": "0px",
                "--_appearOffset": ".07s",
              } as React.CSSProperties
            }
            fill="none"
            strokeWidth=".3"
            r="2.8"
            cy="9"
            cx="9"
            className="ballTrace"
          ></circle>
          <circle
            style={
              {
                "--_toCenterXOffset": "-2.75px",
                "--_appearOffset": ".13s",
              } as React.CSSProperties
            }
            fill="none"
            strokeWidth=".4"
            r="2.75"
            cy="9"
            cx="11.75"
            className="ballTrace"
          ></circle>
          <circle
            style={{ "--_toCenterXOffset": "-5.7px" } as React.CSSProperties}
            r="3"
            cy="9"
            cx="14.7"
            className="ball"
          ></circle>
        </g>
      </svg>
    </label>
  );
};

export default ToggleSwitch;
