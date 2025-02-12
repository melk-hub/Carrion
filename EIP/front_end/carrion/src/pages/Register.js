import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegisterSubmit = async () => {
    // try {
    //   const response = await fetch('http://localhost:5000/register', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData),
    //   });

    //   const data = await response.json();
    //   if (response.ok) {
    //     console.log('Registration successful:', data);
        setIsAuthenticated(true);
        navigate('/dashboard');
    //   } else {
    //     console.log('Registration failed:', data.message || 'Error registering');
    //   }
    // } catch (error) {
    //   console.error('Error registering:', error);
    // }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="register-page">
      <div className="logo">LOGO</div>
      <h2 className="register-title">S'enregistrer</h2>
      <div className="register-form">
        <div>
          <label className="register-label">Prénom:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleRegisterChange}
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Nom:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleRegisterChange}
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Date de naissance:</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleRegisterChange}
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleRegisterChange}
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Nom d'utilisateur:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleRegisterChange}
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Mot de passe:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleRegisterChange}
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Confirmer le mot de passe:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleRegisterChange}
            className="register-input"
          />
        </div>
        <button
          onClick={handleRegisterSubmit}
          className="register-button register-submit"
        >
          Valider l'inscription
        </button>
        <button
          onClick={handleLoginRedirect}
          className="register-button register-login"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}

export default Register;
