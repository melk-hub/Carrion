"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import apiService from "@/services/api";
import { GoalSettings } from "@/interface/misc.interface";
import styles from "./Settings.module.css";

interface SettingsClientProps {
  initialGoalSettings: GoalSettings | null;
  error: string | null;
}

export default function SettingsClient({
  initialGoalSettings,
  error: initialError,
}: SettingsClientProps) {
  const { t } = useLanguage();
  const { logOut } = useAuth();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [goalSettings, setGoalSettings] = useState<GoalSettings>(
    initialGoalSettings || {
      weeklyGoal: 10,
      monthlyGoal: 30,
    }
  );

  const saveGoalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const savePromise = apiService.put("/settings/goal", goalSettings);

    toast.promise(savePromise, {
      loading: t("settings.saving") as string,
      success: () => {
        setSaving(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        return t("settings.successSave") as string;
      },
      error: (err) => {
        setSaving(false);
        return err.message || (t("settings.errorSave") as string);
      },
    });
  };

  const handleInputChange = (field: keyof GoalSettings, value: string) => {
    setGoalSettings((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const handleDisconnectAllServices = async () => {
    if (!window.confirm(t("settings.confirmDisconnect") as string)) return;
    setIsDisconnecting(true);
    const disconnectPromise = apiService.delete("/user-profile/services/all", {});
    toast.promise(disconnectPromise, {
      loading: t("settings.pendingDisconnect") as string,
      success: () => {
        setIsDisconnecting(false);
        return t("settings.successDisconnect") as string;
      },
      error: (err) => {
        setIsDisconnecting(false);
        return `${t("settings.errorDisconnect") as string}: ${
          err.message || (t("settings.tryAgain") as string)
        }`;
      },
    });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t("settings.confirmDeleteAccount") as string)) {
      setIsDeleting(true);
      try {
        await apiService.delete("/user/me", {});
        toast.success(t("settings.sucessDeleteAccount") as string);
        logOut();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (t("settings.errorDeleteAccount") as string);
        toast.error(`Une erreur est survenue: ${errorMessage}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (error) {
    return (
      <div className={styles.settingsContainer}>
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <h1>{t("settings.title") as string}</h1>
        <p>{t("settings.description") as string}</p>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.settingsSection}>
          <div className={styles.sectionHeader}>
            <h2>{t("settings.account") as string}</h2>
            <p>{t("settings.accountDescription") as string}</p>
          </div>
          <div className={styles.accountActions}>
            <div className={styles.actionItem}>
              <div className={styles.actionText}>
                <strong>{t("settings.disconnectServices") as string}</strong>
                <p className={styles.actionDescription}>
                  {t("settings.disconnectServicesDescription") as string}
                </p>
              </div>
              <button
                onClick={handleDisconnectAllServices}
                className={styles.btnSecondary}
                disabled={isDisconnecting}
              >
                {isDisconnecting
                  ? t("settings.disconnecting")
                  : t("settings.disconnectEverything")}
              </button>
            </div>
            <div className={styles.actionItem}>
              <div className={styles.actionText}>
                <strong>{t("settings.deleteAccount") as string}</strong>
                <p className={styles.actionDescription}>
                  {t("settings.deleteAccountDescription") as string}
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className={styles.btnDanger}
                disabled={isDeleting}
              >
                {isDeleting
                  ? t("settings.deletingAccount")
                  : t("settings.deleteAccount")}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.sectionHeader}>
            <h2>{t("settings.objectives") as string}</h2>
            <p>{t("settings.objectivesDescription") as string}</p>
          </div>
          <form onSubmit={saveGoalSettings} className={styles.goalForm}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="weeklyGoal">
                  {t("settings.weeklyGoal") as string}
                </label>
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
                <small>{t("settings.weeklyGoalDescription") as string}</small>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="monthlyGoal">
                  {t("settings.monthlyGoal") as string}
                </label>
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
                <small>{t("settings.monthlyGoalDescription") as string}</small>
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className={styles.btnSpinner}></div>
                    {t("settings.saving") as string}
                  </>
                ) : (
                  <>{t("settings.save") as string}</>
                )}
              </button>
            </div>
            {success && (
              <div className={styles.successMessage}>
                {t("settings.successSave") as string}
              </div>
            )}
          </form>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.sectionHeader}>
            <h2>{t("settings.notifications") as string}</h2>
            <p>{t("settings.notificationsDescription") as string}</p>
          </div>
          <div className={styles.featureComingSoon}>
            <p>{t("settings.availableSoon") as string}</p>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.sectionHeader}>
            <h2>{t("settings.appearance") as string}</h2>
            <p>{t("settings.appearanceDescription") as string}</p>
          </div>
          <div className={styles.featureComingSoon}>
            <p>{t("settings.availableSoon") as string}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
