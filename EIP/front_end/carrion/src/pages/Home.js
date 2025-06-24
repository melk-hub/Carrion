import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import InfosModal from "../components/InfosModal";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/Home.css";

export default function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const navigate = useNavigate();
  const { t } = useLanguage();
  const API_URL = process.env.REACT_APP_API_URL;

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === true) {
      return;
    }
    effectRan.current = true;

    const checkUserProfile = async () => {
      try {
        console.log("Fetching profile status...");
        const response = await fetch(`${API_URL}/utils/hasProfile`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const hasProfile = await response.json();
        console.log("API response from /hasProfile:", hasProfile);

        if (hasProfile === false) {
          console.log("Profile does not exist. Showing modal.");
          setShowWelcomeModal(true);
        } else {
          console.log("Profile exists. Not showing modal.");
        }
      } catch (error) {
        console.error(
          "Impossible de vérifier le profil de l'utilisateur:",
          error
        );
      }
    };

    checkUserProfile();
  }, [API_URL]);

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
        <div className="welcome-content" style={{ marginRight: "2vw" }} >
          <h1 className="welcome-title">{t("home.welcome")}</h1>
          <p className="welcome-subtitle">{t("home.welcomeMessage")}</p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Applications actives</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">3</span>
            <span className="stat-label">Entretiens programmés</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">85%</span>
            <span className="stat-label">Taux de réponse</span>
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
              <div className="action-icon">📋</div>
              <span>{t("home.myApplications")}</span>
            </button>
            <button className="action-btn secondary">
              <div className="action-icon">➕</div>
              <span>{t("home.newApplications")}</span>
            </button>
            <button
              className="action-btn tertiary"
              onClick={() => navigate("/Archives")}
            >
              <div className="action-icon">📊</div>
              <span>{t("home.statistics")}</span>
            </button>
            <button
              className="action-btn quaternary"
              onClick={() => navigate("/Paramaters")}
            >
              <div className="action-icon">⚙️</div>
              <span>{t("home.myInformation")}</span>
            </button>
          </div>
        </div>

        <div className="card activity-timeline">
          <div className="card-header">
            <h3>{t("home.recentActivity")}</h3>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot accepted"></div>
              <div className="timeline-content">
                <h4>Candidature acceptée</h4>
                <p>Boursorama - Développeur Full Stack</p>
                <span className="timeline-time">Il y a 5h</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot pending"></div>
              <div className="timeline-content">
                <h4>Nouvelle candidature</h4>
                <p>Shopify - Product Owner</p>
                <span className="timeline-time">Il y a 17h</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot interview"></div>
              <div className="timeline-content">
                <h4>Entretien programmé</h4>
                <p>Google - Software Engineer</p>
                <span className="timeline-time">Il y a 2j</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card progress-card">
          <div className="card-header">
            <h3>Progression du mois</h3>
          </div>
          <div className="progress-content">
            <div className="progress-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray="75, 100"
                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">
                  75%
                </text>
              </svg>
            </div>
            <div className="progress-details">
              <div className="progress-item">
                <span className="progress-label">Objectif mensuel</span>
                <span className="progress-value">15 candidatures</span>
              </div>
              <div className="progress-item">
                <span className="progress-label">Réalisé</span>
                <span className="progress-value">12 candidatures</span>
              </div>
              <div className="progress-item">
                <span className="progress-label">Restant</span>
                <span className="progress-value">3 candidatures</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card tips-card">
          <div className="card-header">
            <h3>💡 Conseil du jour</h3>
          </div>
          <div className="tip-content">
            <p>
              Personnalisez votre lettre de motivation pour chaque candidature.
              Les recruteurs apprécient les candidats qui montrent un réel
              intérêt pour leur entreprise.
            </p>
            <button className="tip-btn">Plus de conseils</button>
          </div>
        </div>
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
        </div>
    );
}
