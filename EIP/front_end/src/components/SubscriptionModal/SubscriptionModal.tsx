"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import apiService from "@/services/api";
import styles from "../AddApplicationModal/Modal.module.css";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
}: SubscriptionModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      // Appel au backend pour créer une session Stripe Checkout
      const response = await apiService.post<{ url: string }>(
        "/subscription/create-checkout-session",
        {}
      );

      if (response?.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = response.url;
      } else {
        setError(t("subscription.errors.createSession") as string);
      }
    } catch (err: unknown) {
      console.error("Erreur lors de la création de la session Stripe:", err);
      setError(
        err instanceof Error
          ? err.message
          : (t("subscription.errors.generic") as string)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {t("subscription.title") as string}
          </h2>
          <button
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label={t("common.close") as string}
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.subscriptionContent}>
            <h3 className={styles.subscriptionSubtitle}>
              {t("subscription.subtitle") as string}
            </h3>
            <ul className={styles.subscriptionFeatures}>
              <li>✓ {t("subscription.features.feature1") as string}</li>
              <li>✓ {t("subscription.features.feature2") as string}</li>
              <li>✓ {t("subscription.features.feature3") as string}</li>
              <li>✓ {t("subscription.features.feature4") as string}</li>
            </ul>
            {error && (
              <div
                style={{
                  color: "#ef4444",
                  padding: "0.75rem",
                  marginTop: "1rem",
                  backgroundColor: "#fee2e2",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={`${styles.modalButton} ${styles.cancel}`}
            onClick={onClose}
            disabled={loading}
          >
            {t("common.cancel") as string}
          </button>
          <button
            className={`${styles.modalButton} ${styles.confirm}`}
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading
              ? (t("subscription.processing") as string)
              : (t("subscription.subscribe") as string)}
          </button>
        </div>
      </div>
    </div>
  );
}

