import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import useOutlookAuth from "@/hooks/useOutlookAuth";
import Image from "next/image";
import styles from "../AuthModal/AuthModal.module.css";

const OutlookLoginButton = () => {
  const { t } = useLanguage();
  const { initiateOutlookLogin } = useOutlookAuth();

  return (
    <button
      className={styles.outlookLoginButton}
      onClick={initiateOutlookLogin}
      type="button"
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
