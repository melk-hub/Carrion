import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const RecentApplicationsCard = ({ className = '' }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchRecentApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/job_applies/get_jobApply`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error('❌ Data is not an array:', data);
          setApplications([]);
          return;
        }

        const sortedApplications = data
          .filter(app => app && app.createdAt)
          .sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          })
          .slice(0, 3);
        
        setApplications(sortedApplications);
      } catch (error) {
        setError(error.message);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentApplications();
  }, [API_URL]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return t('shared.time.unknown') || 'Date inconnue';

    const now = new Date();
    const applicationDate = new Date(dateString);

    if (isNaN(applicationDate.getTime())) {
      return t('shared.time.unknown') || 'Date inconnue';
    }

    const diffInMinutes = Math.floor((now - applicationDate) / (1000 * 60));

    if (diffInMinutes < 1) {
      return t('shared.time.now') || 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return t('shared.time.minutes', { minutes: diffInMinutes }) || `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return t('shared.time.hoursAgo', { count: hours }) || `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return t('shared.time.daysAgo', { count: days }) || `Il y a ${days}j`;
    }
  };

  // Fonction pour obtenir le texte du statut traduit
  const getStatusText = (status) => {
    const statusKey = `shared.status.${status?.toLowerCase()}`;
    const statusTexts = {
      'pending': 'En attente',
      'accepted': 'Acceptée',
      'rejected': 'Refusée',
      'interview': 'Entretien',
      'archived': 'Archivée'
    };
    
    return t(statusKey) || statusTexts[status?.toLowerCase()] || status || 'Inconnu';
  };

  // Fonction pour obtenir la première lettre de l'entreprise pour le placeholder
  const getCompanyInitial = (company) => {
    return company ? company.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return (
      <div className={`card recent-applications ${className}`}>
        <div className="card-header">
          <h3>{t("home.recentApplications") || "Dernières candidatures"}</h3>
          <button
            className="see-all-btn"
            onClick={() => navigate("/dashboard")}
          >
            {t("home.seeAll") || "Voir tout"}
          </button>
        </div>
        <div className="applications-list">
          <div className="application-item">
            <div className="application-info">
              <h4>{t('shared.loading') || 'Chargement...'}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card recent-applications ${className}`}>
        <div className="card-header">
          <h3>{t("home.recentApplications") || "Dernières candidatures"}</h3>
          <button
            className="see-all-btn"
            onClick={() => navigate("/dashboard")}
          >
            {t("home.seeAll") || "Voir tout"}
          </button>
        </div>
        <div className="applications-list">
          <div className="application-item">
            <div className="application-info">
              <h4>Erreur: {error}</h4>
              <p>Impossible de charger les candidatures</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className={`card recent-applications ${className}`}>
        <div className="card-header">
          <h3>{t("home.recentApplications") || "Dernières candidatures"}</h3>
          <button
            className="see-all-btn"
            onClick={() => navigate("/dashboard")}
          >
            {t("home.seeAll") || "Voir tout"}
          </button>
        </div>
        <div className="applications-list">
          <div className="application-item">
            <div className="application-info">
              <h4>{t('home.noApplications') || 'Aucune candidature'}</h4>
              <p>{t('home.noApplicationsMessage') || 'Vos candidatures apparaîtront ici'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card recent-applications ${className}`}>
      <div className="card-header">
        <h3>{t("home.recentApplications") || "Dernières candidatures"}</h3>
        <button
          className="see-all-btn"
          onClick={() => navigate("/dashboard")}
        >
          {t("home.seeAll") || "Voir tout"}
        </button>
      </div>
      <div className="applications-list">
        {applications.map((application) => (
          <div className="application-item" key={application.id}>
            <div className="company-logo">
              {application.imageUrl ? (
                <img
                  src={application.imageUrl}
                  alt={application.company}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="placeholder-logo" 
                style={{ display: application.imageUrl ? 'none' : 'flex' }}
              >
                {getCompanyInitial(application.company)}
              </div>
            </div>
            <div className="application-info">
              <h4>{application.company || t('shared.unknown') || 'Entreprise inconnue'}</h4>
              <p>
                {application.contractType && `${application.contractType} - `}
                {application.title || t('shared.unknownPosition') || 'Poste non précisé'}
              </p>
              <span className={`status ${application.status?.toLowerCase() || 'pending'}`}>
                {getStatusText(application.status)}
              </span>
            </div>
            <div className="application-time">
              <span>{formatTimeAgo(application.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentApplicationsCard; 