"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "@/styles/AuthModal.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Votre mot de passe a été réinitialisé avec succès ! Vous allez être redirigé vers la page d'accueil."
        );
        setTimeout(() => router.push("/"), 3000);
      } else {
        setError(data.message || "Ce lien est invalide ou a expiré.");
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="modal-overlay" style={{ background: "#f4f4f4" }}>
      <div className="auth-modal">
        <h2>Définir un nouveau mot de passe</h2>
        <form onSubmit={handleSubmit}>
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre nouveau mot de passe"
            required
          />
          <label>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmez votre nouveau mot de passe"
            required
          />
          <button
            type="submit"
            className="primary-btn"
            style={{ width: "100%" }}
          >
            Mettre à jour le mot de passe
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {message && (
          <p
            style={{
              color: "green",
              background: "#e8f5e9",
              border: "1px solid #a5d6a7",
              borderRadius: "8px",
              padding: "12px",
              margin: "15px 0",
              textAlign: "center",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
