import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/AuthModal.css";
import GoogleLoginButton from "./GoogleLoginBtn";
import OutlookLoginButton from "./OutlookLoginButton";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff, FiXCircle, FiCheckCircle } from "react-icons/fi";
import { passwordRegEX, emailRegEX } from "../services/utils";

function AuthModal({ isOpen, onClose, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || "login");
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
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;
  const [showPassword, setShowPassword] = useState(false);

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });

  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      letter: /[A-Za-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*#?&]/.test(password),
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setCredentials((prev) => ({ ...prev, [name]: newValue }));
    if (name === "password") validatePassword(value);
  };

  useEffect(() => {
    setActiveTab(defaultTab || "login");
  }, [defaultTab]);

  useEffect(() => {
    if (!isOpen) {
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setDirection(tab === "login" ? -1 : 1);
    setActiveTab(tab);
    setErrorMessage("");
  };
  const handleClose = () => onClose();

  const variants = {
    enter: (direction) => ({ x: direction * 100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction * -100, opacity: 0 }),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (activeTab === "login") {
      try {
        const response = await fetch(`${API_URL}/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: credentials.identifier,
            password: credentials.password,
          }),
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
          navigate("/home");
          onClose();
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || t("auth.loginError"));
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(t("auth.genericError"));
      }
    }

    if (activeTab === "register") {
      if (!emailRegEX.test(credentials.email)) {
        setErrorMessage(t("auth.invalidEmail"));
        return;
      }
      if (!passwordRegEX.test(credentials.password)) {
        setErrorMessage(t("auth.passwordInvalid"));
        return;
      }
      if (credentials.password !== credentials.confirmPassword) {
        setErrorMessage(t("auth.passwordMismatch"));
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
          navigate("/home");
          onClose();
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || t("auth.registerError"));
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(t("auth.genericError"));
      }
    }
  };

  const ValidationCriterion = ({ isValid, text }) => (
    <li className={`criterion ${isValid ? "valid" : "invalid"}`}>
      {isValid ? <FiCheckCircle /> : <FiXCircle />}
      <span>{text}</span>
    </li>
  );

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        <h1>{activeTab === "login" ? t("home.welcome") : t("auth.joinUs")}</h1>
        <div className="tabs">
          <button
            className={activeTab === "login" ? "active" : ""}
            onClick={() => handleTabChange("login")}
          >
            {t("auth.signIn")}
          </button>
          <button
            className={activeTab === "register" ? "active" : ""}
            onClick={() => handleTabChange("register")}
          >
            {t("auth.signUp")}
          </button>
        </div>
        <hr />
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
                  placeholder={t("auth.emailOrUsername")}
                  value={credentials.identifier}
                  onChange={handleChange}
                  required
                />
                <label>{t("auth.password")}</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("auth.password")}
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="toggle-password"
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
                  <p className="error-message">{errorMessage}</p>
                )}
                <div style={{ marginTop: "3%" }}>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={credentials.rememberMe}
                    onChange={handleChange}
                  />
                  <label htmlFor="rememberMe">{t("auth.rememberMe")}</label>
                </div>
                <button type="submit" className="primary-btn">
                  {t("auth.signIn")}
                </button>
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
                <div className="row-inputs">
                  <div>
                    <label>{t("auth.email")}</label>
                    <input
                      type="email"
                      name="email"
                      placeholder={t("auth.email")}
                      value={credentials.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label>{t("auth.username")}</label>
                    <input
                      type="text"
                      name="username"
                      placeholder={t("auth.username")}
                      value={credentials.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="row-inputs">
                  <div>
                    <label>{t("auth.password")}</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={t("auth.password")}
                        value={credentials.password}
                        onChange={handleChange}
                        required
                      />
                      <span
                        className="toggle-password"
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
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder={t("auth.confirmPassword")}
                        value={credentials.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <span
                        className="toggle-password"
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
                <ul className="password-criteria">
                  <ValidationCriterion
                    isValid={passwordCriteria.length}
                    text={t("auth.criteria.length")}
                  />
                  <ValidationCriterion
                    isValid={passwordCriteria.letter}
                    text={t("auth.criteria.letter")}
                  />
                  <ValidationCriterion
                    isValid={passwordCriteria.number}
                    text={t("auth.criteria.number")}
                  />
                  <ValidationCriterion
                    isValid={passwordCriteria.special}
                    text={t("auth.criteria.special")}
                  />
                </ul>
                {errorMessage && (
                  <p className="error-message">{errorMessage}</p>
                )}
                <button type="submit" className="primary-btn">
                  {t("auth.signUp")}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <hr />
        <div className="social-buttons">
          <GoogleLoginButton />
          <OutlookLoginButton />
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
