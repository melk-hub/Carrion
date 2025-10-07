import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import useOutlookAuth from "../hooks/useOutlookAuth";
import Image from "next/image";

const OutlookLoginButton = () => {
  const { t } = useLanguage();
  const { initiateOutlookLogin } = useOutlookAuth();

  return (
    <button
      className="google-login-button outlook-login-button outlook-btn"
      onClick={initiateOutlookLogin}
      type="button"
      style={{
        background: "#0078d4",
        color: "white",
      }}
    >
      <Image
        src="/assets/outlook-logo.svg"
        alt="Outlook"
        style={{ zIndex: 1 }}
        width={24}
        height={24}
      />
      {t("auth.loginWithOutlook")}
    </button>
  );
};

export default OutlookLoginButton;
