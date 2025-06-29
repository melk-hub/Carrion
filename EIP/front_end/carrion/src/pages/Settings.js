import React, { useState, useEffect } from "react";
import apiService from "../services/api.js";
import "../styles/Settings.css";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

function Settings() {
  const [goalSettings, setGoalSettings] = useState({
    weeklyGoal: 10,
    monthlyGoal: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchGoalSettings();
  }, []);

  const fetchGoalSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/settings/goal", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoalSettings({
          weeklyGoal: data.weeklyGoal || 10,
          monthlyGoal: data.monthlyGoal || 30,
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des paramètres d'objectif :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const saveGoalSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await apiService.put("/settings/goal", goalSettings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des paramètres d'objectif :",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setGoalSettings((prev) => ({
      ...prev,
      [field]: parseInt(value) || 0,
    }));
  };

  const handleDisconnectAllServices = async () => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir déconnecter TOUS vos services ? Vous devrez les relier manuellement pour retrouver les fonctionnalités associées."
      )
    ) {
      return;
    }
    setIsDisconnecting(true);

    const disconnectPromise = apiService.delete("/user-profile/services/all");

    toast.promise(disconnectPromise, {
      loading: "Déconnexion de tous les services...",
      success: () => {
        setIsDisconnecting(false);
        return "Tous les services ont été déconnectés avec succès.";
      },
      error: (err) => {
        setIsDisconnecting(false);
        return `Une erreur est survenue: ${
          err.message || "Veuillez réessayer."
        }`;
      },
    });
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "ATTENTION : Êtes-vous absolument sûr de vouloir supprimer votre compte ? Toutes vos données (candidatures, objectifs, etc.) seront définitivement perdues. Cette action est irréversible."
      )
    ) {
      setIsDeleting(true);
      try {
        const response = await fetch(`${API_URL}/user/me`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          alert("Votre compte a été supprimé avec succès.");
          localStorage.removeItem("token");
          window.location.href = "/";
        } else {
          throw new Error("La suppression du compte a échoué.");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du compte :", error);
        alert(
          "Une erreur est survenue lors de la suppression. Veuillez réessayer."
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return <Loading message="Chargement des paramètres..." />;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Paramètres</h1>
        <p>Configurez vos préférences et objectifs</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-header">
            <h2>Compte</h2>
            <p>Gérez vos services connectés et votre compte</p>
          </div>
          <div className="account-actions">
            <div className="action-item">
              <div className="action-text">
                <strong>Déconnecter les services</strong>
                <p className="action-description">
                  Ceci révoquera l'accès à tous les services externes connectés
                  (ex: Gmail, Outlook).
                </p>
              </div>
              <button
                onClick={handleDisconnectAllServices}
                className="btn-secondary"
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Déconnexion..." : "Tout déconnecter"}
              </button>
            </div>
            <div className="action-item">
              <div className="action-text">
                <strong>Supprimer le compte</strong>
                <p className="action-description">
                  Cette action supprimera définitivement votre compte et toutes
                  vos données.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer mon compte"}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Objectifs de candidatures</h2>
            <p>Définissez vos objectifs de candidatures pour rester motivé</p>
          </div>
          <form onSubmit={saveGoalSettings} className="goal-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="weeklyGoal">Objectif hebdomadaire</label>
                <input
                  id="weeklyGoal"
                  type="number"
                  min="1"
                  max="100"
                  value={goalSettings.weeklyGoal}
                  onChange={(e) =>
                    handleInputChange("weeklyGoal", e.target.value)
                  }
                  required
                />
                <small>Nombre de candidatures par semaine</small>
              </div>
              <div className="form-group">
                <label htmlFor="monthlyGoal">Objectif mensuel</label>
                <input
                  id="monthlyGoal"
                  type="number"
                  min="1"
                  max="500"
                  value={goalSettings.monthlyGoal}
                  onChange={(e) =>
                    handleInputChange("monthlyGoal", e.target.value)
                  }
                  required
                />
                <small>Nombre de candidatures par mois</small>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <div className="btn-spinner"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>Sauvegarder</>
                )}
              </button>
            </div>
            {success && (
              <div className="success-message">
                Paramètres sauvegardés avec succès !
              </div>
            )}
          </form>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Notifications</h2>
            <p>Gérez vos préférences de notifications</p>
          </div>
          <div className="feature-coming-soon">
            <p>Cette fonctionnalité sera bientôt disponible</p>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Apparence</h2>
            <p>Personnalisez l'interface de l'application</p>
          </div>
          <div className="feature-coming-soon">
            <p>Cette fonctionnalité sera bientôt disponible</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
