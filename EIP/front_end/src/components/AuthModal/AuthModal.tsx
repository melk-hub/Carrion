"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./AuthModal.module.css";
import GoogleLoginButton from "@/components/Button/GoogleLoginBtn";
import OutlookLoginButton from "@/components/Button/OutlookLoginButton";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff, FiXCircle, FiCheckCircle } from "react-icons/fi";
import { passwordRegEX, emailRegEX } from "../../services/utils";
import PrimaryButton from "../Button/PrimaryButton";

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}) {
  const [activeTab, setActiveTab] = useState<
    "login" | "register" | "forgotPassword"
  >(defaultTab);
  const [direction, setDirection] = useState(1);
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
    confirmPassword: "",
    username: "",
    email: "",
    rememberMe: false,
  });
  const { setIsAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [showPassword, setShowPassword] = useState(false);

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });

  const validatePassword = (password: string) => {
    setPasswordCriteria({
      length: password.length >= 8,
      letter: /[A-Za-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*#?&]/.test(password),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setCredentials((prev) => ({ ...prev, [name]: newValue }));
    if (name === "password") validatePassword(value);
  };

  useEffect(() => {
    setActiveTab(defaultTab || "login");
  }, [defaultTab]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab || "login");
    } else {
      setCredentials({
        identifier: "",
        password: "",
        confirmPassword: "",
        username: "",
        email: "",
        rememberMe: false,
      });
      validatePassword("");
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen, defaultTab]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleTabChange = (tab: "login" | "register" | "forgotPassword") => {
    if (tab === activeTab) return;
    setDirection(tab === "login" ? -1 : 1);
    setActiveTab(tab);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleClose = () => onClose();

  const variants = {
    enter: (direction: number) => ({ x: direction * 100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction * -100, opacity: 0 }),
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (activeTab === "login") {
      try {
        const response = await fetch(`${API_URL}/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: credentials.identifier,
            password: credentials.password,
            rememberMe: credentials.rememberMe,
          }),
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
          onClose();
        } else {
          const errorData = await response.json();
          setErrorMessage(
            errorData.message || (t("auth.loginError") as string)
          );
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(t("auth.genericError") as string);
      }
    }

    if (activeTab === "register") {
      if (!emailRegEX.test(credentials.email)) {
        setErrorMessage(t("auth.invalidEmail") as string);
        return;
      }
      if (!passwordRegEX.test(credentials.password)) {
        setErrorMessage(t("auth.passwordInvalid") as string);
        return;
      }
      if (credentials.password !== credentials.confirmPassword) {
        setErrorMessage(t("auth.passwordMismatch") as string);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
            email: credentials.email,
          }),
          credentials: "include",
        });
        if (response.ok) {
          setIsAuthenticated(true);
          onClose();
        } else {
          const errorData = await response.json();
          setErrorMessage(
            errorData.message || (t("auth.registerError") as string)
          );
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(t("auth.genericError") as string);
      }
    }

    if (activeTab === "forgotPassword") {
      try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: credentials.email }),
        });
        const data = await response.json();
        if (response.ok) {
          setSuccessMessage(
            data.message || (t("auth.resetLinkSent") as string)
          );
        } else {
          setErrorMessage(data.message || (t("auth.genericError") as string));
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(t("auth.genericError") as string);
      }
    }
  };

  const ValidationCriterion = ({
    isValid,
    text,
  }: {
    isValid: boolean;
    text: string;
  }) => (
    <li className={isValid ? styles.valid : styles.invalid}>
      {isValid ? <FiCheckCircle /> : <FiXCircle />}
      <span>{text}</span>
    </li>
  );

  const getModalTitle = () => {
    if (activeTab === "forgotPassword") return t("auth.resetYourPassword");
    if (activeTab === "login") return t("home.welcome");
    return t("auth.joinUs");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.authModal}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>

        <h1>{getModalTitle()}</h1>

        {activeTab !== "forgotPassword" && (
          <>
            <div className={styles.tabs}>
              <button
                className={activeTab === "login" ? styles.active : ""}
                onClick={() => handleTabChange("login")}
              >
                {t("auth.signIn")}
              </button>
              <button
                className={activeTab === "register" ? styles.active : ""}
                onClick={() => handleTabChange("register")}
              >
                {t("auth.signUp")}
              </button>
            </div>
            <hr />
          </>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "login" && (
            <motion.div
              key="login"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handleSubmit}>
                <label>{t("auth.emailOrUsername")}</label>
                <input
                  type="text"
                  name="identifier"
                  placeholder={t("auth.emailOrUsername") as string}
                  value={credentials.identifier}
                  onChange={handleChange}
                  required
                />
                <label>{t("auth.password")}</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("auth.password") as string}
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className={styles.togglePassword}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </span>
                </div>
                {errorMessage && (
                  <p className={styles.errorMessage}>{errorMessage}</p>
                )}

                <div className={styles.loginOptions}>
                  <div className={styles.rememberMeWrapper}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={credentials.rememberMe}
                      onChange={handleChange}
                    />
                    <label htmlFor="rememberMe">{t("auth.rememberMe")}</label>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange("forgotPassword");
                    }}
                    className={styles.forgotPasswordLink}
                  >
                    {t("auth.forgotPassword")}
                  </a>
                </div>

                <PrimaryButton
                  text={t("auth.signIn") as string}
                  size="large"
                  type="submit"
                  style={{ marginTop: "1rem" }}
                />
              </form>
            </motion.div>
          )}
          {activeTab === "register" && (
            <motion.div
              key="register"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handleSubmit}>
                <div className={styles.rowInputs}>
                  <div>
                    <label>{t("auth.email")}</label>
                    <input
                      type="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleChange}
                      placeholder={t("auth.email") as string}
                      required
                    />
                  </div>
                  <div>
                    <label>{t("auth.username")}</label>
                    <input
                      type="text"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      placeholder={t("auth.username") as string}
                      required
                    />
                  </div>
                </div>
                <div className={styles.rowInputs}>
                  <div>
                    <label>{t("auth.password")}</label>
                    <div className={styles.passwordWrapper}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder={t("auth.password") as string}
                        required
                      />
                      <span
                        className={styles.togglePassword}
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label>{t("auth.confirmPassword")}</label>
                    <div className={styles.passwordWrapper}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={credentials.confirmPassword}
                        onChange={handleChange}
                        placeholder={t("auth.confirmPassword") as string}
                        required
                      />
                      <span
                        className={styles.togglePassword}
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <ul className={styles.passwordCriteria}>
                  <ValidationCriterion
                    isValid={passwordCriteria.length}
                    text={t("auth.criteria.length") as string}
                  />
                  <ValidationCriterion
                    isValid={passwordCriteria.letter}
                    text={t("auth.criteria.letter") as string}
                  />
                  <ValidationCriterion
                    isValid={passwordCriteria.number}
                    text={t("auth.criteria.number") as string}
                  />
                  <ValidationCriterion
                    isValid={passwordCriteria.special}
                    text={t("auth.criteria.special") as string}
                  />
                </ul>
                {errorMessage && (
                  <p className={styles.errorMessage}>{errorMessage}</p>
                )}
                <PrimaryButton
                  text={t("auth.signUp") as string}
                  size="large"
                  type="submit"
                  style={{ marginTop: "1rem" }}
                />
              </form>
            </motion.div>
          )}

          {activeTab === "forgotPassword" && (
            <motion.div
              key="forgotPassword"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
                <p className={styles.forgotPasswordInstructions}>
                  {t("auth.forgotPasswordInstructions")}
                </p>
                <label>{t("auth.email")}</label>
                <input
                  type="email"
                  name="email"
                  placeholder={t("auth.email") as string}
                  value={credentials.email}
                  onChange={handleChange}
                  required
                />
                {errorMessage && (
                  <p className={styles.errorMessage}>{errorMessage}</p>
                )}
                {successMessage && (
                  <p className={styles.successMessage}>{successMessage}</p>
                )}

                <PrimaryButton
                  text={t("auth.sendResetLink") as string}
                  type="submit"
                  style={{ marginTop: "1rem" }}
                />

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange("login");
                  }}
                  className={styles.backToLoginLink}
                >
                  {t("auth.backToLogin")}
                </a>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab !== "forgotPassword" && (
          <>
            <div className={styles.socialButtons}>
              <GoogleLoginButton />
              <OutlookLoginButton />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
