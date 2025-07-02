import React, { useState, useEffect } from "react";
import apiService from "../services/api.js";
import "../styles/Settings.css";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { useAuth } from "../AuthContext.js";
import { useLanguage } from "../contexts/LanguageContext.js";

function Settings() {
  const [goalSettings, setGoalSettings] = useState({
    weeklyGoal: 10,
    monthlyGoal: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logOut } = useAuth();

  useEffect(() => {
    fetchGoalSettings();
  }, []);

  const fetchGoalSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/settings/goal");

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
        t("settings.confirmDisconnect")
      )
    ) {
      return;
    }
    setIsDisconnecting(true);

    const disconnectPromise = apiService.delete("/user-profile/services/all");

    toast.promise(disconnectPromise, {
      loading: t("settings.pendingDisconnect"),
      success: () => {
        setIsDisconnecting(false);
        return t("settings.successDisconnect");
      },
      error: (err) => {
        setIsDisconnecting(false);
        return `t("settings.errorDisconnect") ${
          err.message || t("settings.tryAgain")
        }`;
      },
    });
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        t("settings.confirmDeleteAccount")
      )
    ) {
      setIsDeleting(true);
      try {
        const response = await apiService.delete("/user/me");

        if (response.ok) {
          toast.success(t("settings.sucessDeleteAccount"));
          logOut();
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.message || t("settings.errorDeleteAccount")
          );
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du compte :", error);
        toast.error(`Une erreur est survenue: ${error.message}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return <Loading message={t("settings.loading")} />;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>{t("settings.title")}</h1>
        <p>{t("settings.description")}</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-header">
            <h2>{t("settings.account")}</h2>
            <p>{t("settings.accountDescription")}</p>
          </div>
          <div className="account-actions">
            <div className="action-item">
              <div className="action-text">
                <strong>{t("settings.disconnectServices")}</strong>
                <p className="action-description">
                  {t("settings.disconnectServicesDescription")}
                </p>
              </div>
              <button
                onClick={handleDisconnectAllServices}
                className="btn-secondary"
                disabled={isDisconnecting}
              >
                {isDisconnecting ? t("settings.disconnecting") : t("settings.disconnectEverything")}
              </button>
            </div>
            <div className="action-item">
              <div className="action-text">
                <strong>{t("settings.deleteAccount")}</strong>
                <p className="action-description">
                  {t("settings.deleteAccountDescription")}
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? t("settings.deletingAccount") : t("settings.deleteAccount")}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>{t("settings.objectives")}</h2>
            <p>{t("settings.objectivesDescription")}</p>
          </div>
          <form onSubmit={saveGoalSettings} className="goal-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="weeklyGoal">{t("settings.weeklyGoal")}</label>
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
                <small>{t("settings.weeklyGoalDescription")}</small>
              </div>
              <div className="form-group">
                <label htmlFor="monthlyGoal">{t("settings.monthlyGoal")}</label>
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
                <small>{t("settings.monthlyGoalDescription")}</small>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <div className="btn-spinner"></div>
                    {t("settings.saving")}
                  </>
                ) : (
                  <>{t("settings.save")}</>
                )}
              </button>
            </div>
            {success && (
              <div className="success-message">
                {t("settings.successSave")}
              </div>
            )}
          </form>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>{t("settings.notifications")}</h2>
            <p>{t("settings.notificationsDescription")}</p>
          </div>
          <div className="feature-coming-soon">
            <p>{t("settings.availableSoon")}</p>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>{t("settings.appearance")}</h2>
            <p>{t("settings.appearanceDescription")}</p>
          </div>
          <div className="feature-coming-soon">
            <p>{t("settings.availableSoon")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
