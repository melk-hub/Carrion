"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import apiService from "@/services/api";

import InfosModal from "@/components/InfosModal";
import WeeklyGoalCard from "@/components/WeeklyGoalCard";
import DailyTipCard from "@/components/DailyTipCard";
import RecentApplicationsCard from "@/components/RecentApplicationsCard";
import AddApplicationModal, {
  ApplicationFormData,
} from "@/components/AddApplicationModal";

import candidature from "/public/assets/candidate-profile.png";
import newApplicationIcon from "/public/assets/plus.png";
import statistics from "/public/assets/pie-chart.png";
import settings from "/public/assets/settings.png";

interface Stats {
  totalApplications: number;
  applicationsToday: number;
}
interface UserRankingInfo {
  rank: number;
  totalUsers: number;
}
interface Notification {
  id: string;
  type: "POSITIVE" | "WARNING" | "NEGATIVE" | "INFO";
  titleKey?: string;
  title?: string;
  message?: string;
  variables?: { company?: string; jobTitle?: string };
  createdAt: string;
}

interface HomeClientProps {
  hasProfile: boolean;
  stats: Stats | null;
  userRanking: UserRankingInfo | null;
  notifications: Notification[];
  error: string | null;
}

export default function HomeClient({
  hasProfile,
  stats,
  userRanking,
  notifications,
  error,
}: HomeClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!hasProfile) {
      setShowWelcomeModal(true);
    }
  }, [hasProfile]);

  const formatRanking = (ranking: UserRankingInfo | null) => {
    if (!ranking) return t("home.ranking.noRank") as string;
    const { rank } = ranking;
    const ordinalKey = `home.ranking.ordinals.${rank}`;
    const ordinalTranslation = t(ordinalKey) as string;
    return ordinalTranslation !== ordinalKey
      ? ordinalTranslation
      : `${rank}${t("home.ranking.suffix") as string}`;
  };

  const getRecentNotifications = () => {
    return [...notifications]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  };
  const recentNotifications = getRecentNotifications();

  const handleSaveNewApplication = async (
    applicationData: ApplicationFormData
  ) => {
    try {
      await apiService.post("/job_applies", applicationData);
      closeAddModal();

      router.refresh();
    } catch (err) {
      console.error(t("dashboard.errors.addError"), err);
    }
  };

  const statusMap = {
    APPLIED: t("dashboard.statuses.APPLIED") as string,
    PENDING: t("dashboard.statuses.PENDING") as string,
    REJECTED_BY_COMPANY: t("dashboard.statuses.REJECTED_BY_COMPANY") as string,
    INTERVIEW_SCHEDULED: t("dashboard.statuses.INTERVIEW_SCHEDULED") as string,
    OFFER_RECEIVED: t("dashboard.statuses.OFFER_RECEIVED") as string,
  };

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);
  const navigate = (path: string) => router.push(path);

  if (error) {
    return <div className="home-error-state">{error}</div>;
  }

  const formatTimestamp = (created_at: string) => {
    /* Votre logique de formatage */ return "Il y a un moment";
  };
  const getNotificationIcon = (type: string) => {
    /* Votre logique d'icônes */ return "📋";
  };
  const getSimplifiedTitle = (notification: Notification) => {
    /* Votre logique de titre */ return "Nouvelle activité";
  };

  return (
    <div className="home-container">
      <InfosModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">{t("home.welcome") as string}</h1>
          <p className="welcome-subtitle">
            {t("home.welcomeMessage") as string}
          </p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <span className="stat-number">{stats?.totalApplications ?? 0}</span>
            <span className="stat-label">
              {t("home.stats.totalApplications") as string}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats?.applicationsToday ?? 0}</span>
            <span className="stat-label">
              {t("home.stats.todayApplications") as string}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{formatRanking(userRanking)}</span>
            <span className="stat-label">
              {t("home.stats.userRanking") as string}
            </span>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="card quick-actions">
          <div className="card-header">
            <h3>{t("home.quickAccess") as string}</h3>
          </div>
          <div className="actions-grid">
            <button
              className="action-btn primary"
              onClick={() => navigate("/dashboard")}
            >
              <Image
                src={candidature}
                alt="Candidature"
                width={30}
                height={30}
              />
              <span>{t("home.myApplications") as string}</span>
            </button>
            <button className="action-btn primary" onClick={openAddModal}>
              <Image
                src={newApplicationIcon}
                alt="Nouvelle Candidature"
                width={30}
                height={30}
              />
              <span>{t("home.newApplications") as string}</span>
            </button>
            <button
              className="action-btn primary"
              onClick={() => navigate("/statistics")}
            >
              <Image
                src={statistics}
                alt="Statistiques"
                width={30}
                height={30}
              />
              <span>{t("home.statistics") as string}</span>
            </button>
            <button
              className="action-btn primary"
              onClick={() => navigate("/settings")}
            >
              <Image src={settings} alt="Paramètres" width={30} height={30} />
              <span>{t("home.myInformation") as string}</span>
            </button>
          </div>
        </div>

        <div className="card activity-timeline">
          <div className="card-header">
            <h3>{t("home.recentActivity") as string}</h3>
            <button
              className="see-all-btn"
              onClick={() => navigate("/notification")}
            >
              {t("home.seeMore") as string}
            </button>
          </div>
          <div className="timeline">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div className="timeline-item" key={notification.id}>
                  <div
                    className={`timeline-dot ${
                      notification.type?.toLowerCase() || "info"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="timeline-content">
                    <h4>{getSimplifiedTitle(notification)}</h4>
                    <p>{notification.message?.substring(0, 60)}</p>
                    <span className="timeline-time">
                      {formatTimestamp(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="timeline-item">
                <div className="timeline-dot info">📋</div>
                <div className="timeline-content">
                  <h4>{t("home.noActivity") as string}</h4>
                </div>
              </div>
            )}
          </div>
        </div>

        <WeeklyGoalCard showGoToStatsButton={true} />
        <DailyTipCard />
        <RecentApplicationsCard />
      </div>

      {showAddModal && (
        <AddApplicationModal
          onAdd={handleSaveNewApplication}
          onClose={closeAddModal}
          statusMap={statusMap}
        />
      )}
    </div>
  );
}
