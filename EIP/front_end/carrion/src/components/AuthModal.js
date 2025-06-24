import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/AuthModal.css";
import GoogleLoginButton from "./GoogleLoginBtn";
import OutlookLoginButton from "./OutlookLoginButton";
import { motion, AnimatePresence } from "framer-motion";

function AuthModal({ isOpen, onClose, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || "login");
  const [direction, setDirection] = useState(1);
  const [credentials, setCredentials] = useState({ identifier: '', password: '', confirmPassword: '', username: '', rememberMe: false });
  const { setIsAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [searchParams] = useSearchParams();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setActiveTab(defaultTab || "login");

    const authError = searchParams.get("error");
    if (authError) {
      setErrorMessage(decodeURIComponent(authError));
      navigate(window.location.pathname, { replace: true });
    }
  }, [defaultTab, searchParams, navigate]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: newValue,
    }));
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setDirection(tab === "login" ? -1 : 1);
    setActiveTab(tab);
  };

  const handleClose = () => {
    setActiveTab(defaultTab || "login");
    setDirection(1);
    onClose();
  };

  const variants = {
    enter: (direction) => ({ x: direction * 100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction * -100, opacity: 0 }),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "login") {
      setErrorMessage("");
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
          navigate("/home");
        } else {
          const data = await response.json();
          setErrorMessage(data.message || t("auth.loginError"));
        }
      } catch (error) {
        console.error("Error during login:", error);
        setErrorMessage(t("auth.genericError"));
      }
    }
    if (activeTab === "register") {
      if (credentials.password !== credentials.confirmPassword) {
        alert(t("auth.passwordMismatch"));
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
        } else {
          const errorData = await response.json();
          alert(errorData.message || t("auth.registerError"));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

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
                <input
                  type="password"
                  name="password"
                  placeholder={t("auth.password")}
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
                {errorMessage && (
                  <p className="error-message">{errorMessage}</p>
                )}
                <div>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    value={credentials.rememberMe}
                    onClick={handleChange}
                  />
                  <label htmlFor="remember">{t("auth.rememberMe")}</label>
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
                      type="username"
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
                    <input
                      type="password"
                      name="password"
                      placeholder={t("auth.password")}
                      value={credentials.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label>{t("auth.confirmPassword")}</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder={t("auth.confirmPassword")}
                      value={credentials.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
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
