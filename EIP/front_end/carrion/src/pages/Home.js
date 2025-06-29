import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import InfosModal from "../components/InfosModal";
import WeeklyGoalCard from "../components/WeeklyGoalCard";
import DailyTipCard from "../components/DailyTipCard";
import AddApplicationModal from "../components/AddApplicationModal";
import { useLanguage } from "../contexts/LanguageContext";
import { useNotifications } from "../contexts/NotificationContext";
import apiService from "../services/api";
import "../styles/Home.css";
import candidature from "../assets/candidate-profile.png"
import newApplicationIcon from "../assets/plus.png"
import statistics from "../assets/pie-chart.png"
import settings from "../assets/settings.png"

export default function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApplication, setNewApplication] = useState(null);
  const [stats, setStats] = useState(null);
  const [userRanking, setUserRanking] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { notifications, fetchNotifications } = useNotifications();
  const API_URL = process.env.REACT_APP_API_URL;

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === true) {
      return;
    }
    effectRan.current = true;

    const checkUserProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/utils/hasProfile`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const hasProfile = await response.json();

        if (hasProfile === false) setShowWelcomeModal(true);
      } catch (error) {
        console.error(
          "Impossible de vérifier le profil de l'utilisateur:",
          error
        );
      }
    };

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await apiService.get("/statistics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchUserRanking = async () => {
      try {
        const [usersResponse, currentUserResponse] = await Promise.all([
          apiService.get("/user/all-users", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          apiService.get("/user/profile", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
        ]);

        if (usersResponse.ok && currentUserResponse.ok) {
          const allUsers = await usersResponse.json();
          const currentUser = await currentUserResponse.json();

          if (allUsers && Array.isArray(allUsers) && currentUser) {
            // Trier les utilisateurs par nombre total de candidatures
            const sortedUsers = allUsers.sort((a, b) => b.totalApplications - a.totalApplications);
            
            // Trouver le rang de l'utilisateur actuel
            const userIndex = sortedUsers.findIndex(user => user.id === currentUser.id);
            if (userIndex !== -1) {
              setUserRanking({
                rank: userIndex + 1,
                totalUsers: allUsers.length
              });
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du classement :", error);
      }
    };

    checkUserProfile();
    fetchNotifications();
    fetchStats();
    fetchUserRanking();
  }, [API_URL, fetchNotifications]);

  // Fonction pour formater le classement avec traduction
  const formatRanking = (ranking) => {
    if (!ranking) return t("home.ranking.noRank");
    
    const { rank } = ranking;
    const ordinalKey = rank.toString();
    
    // Vérifier si on a une traduction spécifique pour ce rang
    const ordinal = t(`home.ranking.ordinals.${ordinalKey}`) !== `home.ranking.ordinals.${ordinalKey}` 
      ? t(`home.ranking.ordinals.${ordinalKey}`)
      : `${rank}${t("home.ranking.suffix")}`;
    
    return `${ordinal}`;
  };

  // Fonction pour formater le temps écoulé
  const formatTimestamp = (created_at) => {
    if (!created_at) return 'Il y a un moment';

    const now = new Date();
    const notificationTime = new Date(created_at);

    if (isNaN(notificationTime.getTime())) {
      return 'Il y a un moment';
    }

    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) { // 24 heures
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days}j`;
    }
  };

  // Fonction pour obtenir l'icône selon le type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'POSITIVE':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'NEGATIVE':
        return '❌';
      case 'INFO':
      default:
        return '📋';
    }
  };

  // Fonction pour obtenir un titre simplifié
  const getSimplifiedTitle = (notification) => {
    if (notification.titleKey && notification.titleKey.includes('application.updated')) {
      return 'Candidature mise à jour';
    }
    if (notification.titleKey && notification.titleKey.includes('application.created')) {
      return 'Nouvelle candidature';
    }
    if (notification.titleKey && notification.titleKey.includes('interview')) {
      return 'Entretien programmé';
    }
    return notification.title || 'Nouvelle activité';
  };

  // Obtenir les 3 dernières notifications
  const getRecentNotifications = () => {
    return notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  };

  const recentNotifications = getRecentNotifications();

  // Status map for the modal
  const statusMap = {
    APPLIED: t('dashboard.statuses.APPLIED'),
    PENDING: t('dashboard.statuses.PENDING'),
    REJECTED_BY_COMPANY: t('dashboard.statuses.REJECTED_BY_COMPANY'),
  };

  // Functions for handling the add application modal
  const openAddModal = () => {
    setNewApplication({
      company: "",
      title: "",
      status: "PENDING",
      location: "",
      salary: "",
      contractType: "Full-time",
      interviewDate: "",
      imageUrl: "https://via.placeholder.com/100",
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setNewApplication(null);
    setShowAddModal(false);
  };

  const handleAddApplication = async () => {
    try {
      const response = await apiService.post('/job_applies/add_jobApply', {
        title: newApplication.title,
        company: newApplication.company,
        status: newApplication.status,
        location: newApplication.location || undefined,
        salary: newApplication.salary ? parseInt(newApplication.salary) : undefined,
        contractType: newApplication.contractType || "Full-time",
      });

      if (!response.ok) {
        throw new Error(`${t('dashboard.errors.addError')} ${response.status}`);
      }

      // Close modal and show success
      closeAddModal();
      console.log('Application added successfully');
      
    } catch (error) {
      console.error(t('dashboard.errors.addError'), error);
    }
  };

  return (
    <div className="home-container">
      <InfosModal
        isOpen={showWelcomeModal}
        onClose={() => {
          setShowWelcomeModal(false);

          window.location.reload();
        }}
      />

      <div className="welcome-section">
        <div className="welcome-content" style={{ marginRight: "2vw" }}>
          <h1 className="welcome-title">{t("home.welcome")}</h1>
          <p className="welcome-subtitle">{t("home.welcomeMessage")}</p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <span className="stat-number">
              {loadingStats ? t("home.ranking.loading") : (stats?.totalApplications || 0)}
            </span>
            <span className="stat-label">{t("home.stats.totalApplications")}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {loadingStats ? t("home.ranking.loading") : (stats?.applicationsToday || 0)}
            </span>
            <span className="stat-label">{t("home.stats.todayApplications")}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {loadingStats ? t("home.ranking.loading") : (userRanking ? formatRanking(userRanking) : t("home.ranking.noRank"))}
            </span>
            <span className="stat-label">{t("home.stats.userRanking")}</span>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="card quick-actions">
          <div className="card-header">
            <h3>{t("home.quickAccess")}</h3>
          </div>
          <div className="actions-grid">
            <button
              className="action-btn primary"
              onClick={() => navigate("/dashboard")}
            >
              <img src={candidature} alt="Candidature" className="menu-icon" style={{width: '30px', height: '30px', marginBottom: "15%"}}/>
              <span>{t("home.myApplications")}</span>
            </button>
            <button 
              className="action-btn primary"
              onClick={openAddModal}
            >
              <img src={newApplicationIcon} alt="Candidature" className="menu-icon" style={{width: '30px', height: '30px', marginBottom: "15%"}}/>
              <span>{t("home.newApplications")}</span>
            </button>
            <button
              className="action-btn primary"
              onClick={() => navigate("/statistics")}
            >
              <img src={statistics} alt="Statistics" className="menu-icon" style={{width: '30px', height: '30px', marginBottom: "15%"}}/>
              <span>{t("home.statistics")}</span>
            </button>
            <button
              className="action-btn primary"
              onClick={() => navigate("/settings")}
            >
              <img src={settings} alt="Settings" className="menu-icon" style={{width: '30px', height: '30px', marginBottom: "15%"}}/>
              <span>{t("home.myInformation")}</span>
            </button>
          </div>
        </div>

        <div className="card activity-timeline">
          <div className="card-header">
            <h3>{t("home.recentActivity")}</h3>
            <button
              className="see-all-btn"
              onClick={() => navigate("/notification")}
            >
              Voir plus
            </button>
          </div>
          <div className="timeline">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div className="timeline-item" key={notification.id}>
                  <div className={`timeline-dot ${notification.type?.toLowerCase() || 'info'}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="timeline-content">
                    <h4>{getSimplifiedTitle(notification)}</h4>
                    <p>{notification.variables?.company && notification.variables?.jobTitle 
                      ? `${notification.variables.company} - ${notification.variables.jobTitle}`
                      : notification.message?.substring(0, 60) + (notification.message?.length > 60 ? '...' : '')
                    }</p>
                    <span className="timeline-time">{formatTimestamp(notification.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="timeline-item">
                <div className="timeline-dot info">📋</div>
                <div className="timeline-content">
                  <h4>Aucune activité récente</h4>
                  <p>Vos dernières notifications apparaîtront ici</p>
                  <span className="timeline-time">-</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <WeeklyGoalCard showGoToStatsButton={true} />

        <DailyTipCard />

        {/* Recent Applications Card */}
        <div className="card recent-applications">
          <div className="card-header">
            <h3>{t("home.recentApplications")}</h3>
            <button
              className="see-all-btn"
              onClick={() => navigate("/dashboard")}
            >
              Voir tout
            </button>
          </div>
          <div className="applications-list">
            <div className="application-item">
              <div className="company-logo">
                <img
                  src="https://cdn.shopify.com/assets/images/logos/shopify-bag.png"
                  alt="Shopify"
                />
              </div>
              <div className="application-info">
                <h4>Shopify</h4>
                <p>Stage - Product Owner</p>
                <span className="status pending">En attente</span>
              </div>
              <div className="application-time">
                <span>Il y a 17h</span>
              </div>
            </div>

            <div className="application-item">
              <div className="company-logo">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Boursorama_Logo_2021.png"
                  alt="Boursorama"
                />
              </div>
              <div className="application-info">
                <h4>Boursorama</h4>
                <p>CDD - Développeur Full Stack Junior</p>
                <span className="status accepted">Acceptée</span>
              </div>
              <div className="application-time">
                <span>Il y a 5h</span>
              </div>
            </div>

            <div className="application-item">
              <div className="company-logo">
                <div className="placeholder-logo">G</div>
              </div>
              <div className="application-info">
                <h4>Google</h4>
                <p>CDI - Software Engineer</p>
                <span className="status interview">Entretien</span>
              </div>
              <div className="application-time">
                <span>Il y a 2j</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <AddApplicationModal
          newApplication={newApplication}
          setNewApplication={setNewApplication}
          onAdd={handleAddApplication}
          onClose={closeAddModal}
          statusMap={statusMap}
        />
      )}
    </div>
  );
}
