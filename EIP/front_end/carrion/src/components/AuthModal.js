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
          setErrorMessage(
            errorData.message ||
              t("auth.loginError", "Identifiants incorrects.")
          );
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(t("auth.genericError", "Une erreur est survenue."));
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

  const texts = {
    welcome: t("home.welcome", "Bienvenue sur Carrion !"),
    joinUs: t("auth.joinUs", "Nous rejoindre !"),
    signIn: t("auth.signIn", "Se connecter"),
    signUp: t("auth.signUp", "S'inscrire"),
    email: t("auth.email", "Email"),
    emailOrUsername: t("auth.emailOrUsername", "Email ou nom d'utilisateur"),
    username: t("auth.username", "Nom d'utilisateur"),
    password: t("auth.password", "Mot de passe"),
    confirmPassword: t("auth.confirmPassword", "Confirmer le mot de passe"),
    rememberMe: t("auth.rememberMe", "Se souvenir de moi"),
    criteria: {
      length: t("auth.criteria.length", "Au moins 8 caractères"),
      letter: t("auth.criteria.letter", "Contient une lettre"),
      number: t("auth.criteria.number", "Contient un chiffre"),
      special: t("auth.criteria.special", "Contient un caractère spécial"),
    },
  };

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        {/* On utilise les variables pré-calculées */}
        <h1>{activeTab === "login" ? texts.welcome : texts.joinUs}</h1>
        <div className="tabs">
          <button
            className={activeTab === "login" ? "active" : ""}
            onClick={() => handleTabChange("login")}
          >
            {texts.signIn}
          </button>
          <button
            className={activeTab === "register" ? "active" : ""}
            onClick={() => handleTabChange("register")}
          >
            {texts.signUp}
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
                <label>{texts.emailOrUsername}</label>
                <input
                  type="text"
                  name="identifier"
                  placeholder={texts.emailOrUsername}
                  value={credentials.identifier}
                  onChange={handleChange}
                  required
                />
                <label>{texts.password}</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={texts.password}
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
                  <label htmlFor="rememberMe">{texts.rememberMe}</label>
                </div>
                <button type="submit" className="primary-btn">
                  {texts.signIn}
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
                    <label>{texts.email}</label>
                    <input
                      type="email"
                      name="email"
                      placeholder={texts.email}
                      value={credentials.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label>{texts.username}</label>
                    <input
                      type="text"
                      name="username"
                      placeholder={texts.username}
                      value={credentials.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="row-inputs">
                  <div>
                    <label>{texts.password}</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={texts.password}
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
                    <label>{texts.confirmPassword}</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder={texts.confirmPassword}
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
                    text={texts.criteria.length}
                  />
                  <ValidationCriterion
                    isValid={passwordCriteria.letter}
                    text={texts.criteria.letter}
                  />
                  <ValidationCriterion
                    isValid={passwordCriteria.number}
                    text={texts.criteria.number}
                  />
                  <ValidationCriterion
                    isValid={passwordCriteria.special}
                    text={texts.criteria.special}
                  />
                </ul>
                {errorMessage && (
                  <p className="error-message">{errorMessage}</p>
                )}
                <button type="submit" className="primary-btn">
                  {texts.signUp}
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
