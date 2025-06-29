import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, isThisWeek, endOfWeek } from 'date-fns';
import apiService from '../services/api.js';
import '../styles/WeeklyGoalCard.css';
import { useLanguage } from '../contexts/LanguageContext';

const WeeklyGoalCard = ({ showGoToStatsButton = false }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [goalSettings, setGoalSettings] = useState({
    weeklyGoal: 5,
    monthlyGoal: 20
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchGoalSettings();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalSettings = async () => {
    try {
      const response = await apiService.get("/settings/goal", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoalSettings({
          weeklyGoal: data.weeklyGoal || 5,
          monthlyGoal: data.monthlyGoal || 20
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres d'objectif :", error);
    }
  };

  // Mémoriser les données préparées pour éviter les recalculs constants
  const statsData = useMemo(() => {
    if (!stats || !stats.applicationsPerDay) return null;

    const now = new Date();
    let days = [];
    const daysCount = 7;

    // Générer les 7 derniers jours
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      days.push({
        date: dateStr,
        dateObj: date,
        count: stats.applicationsPerDay[dateStr] || 0,
      });
    }

    const totals = {
      thisWeek: days.filter(d => isThisWeek(d.dateObj, { weekStartsOn: 1 })).reduce((sum, d) => sum + d.count, 0),
    };

    return { days, totals };
  }, [stats]);

  // Mémoriser le calcul des progrès pour éviter les recalculs constants
  const goalProgress = useMemo(() => {
    if (!stats || !statsData) {
      return { current: 0, target: 5, percentage: 0, timeLeft: '' };
    }

    const current = statsData.totals.thisWeek;
    const target = goalSettings.weeklyGoal;
    
    const now = new Date();
    const endWeek = endOfWeek(now, { weekStartsOn: 1 });
    const daysLeft = Math.ceil((endWeek - now) / (1000 * 60 * 60 * 24));
    const timeLeft = `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`;

    const percentage = Math.min((current / target) * 100, 100);
    
    return { current, target, percentage, timeLeft };
  }, [stats, statsData, goalSettings.weeklyGoal]);

  if (loading) {
    return (
      <div className="weekly-goal-card loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-goal-card">
        <div className="card-header">
          <h3>Objectif hebdomadaire</h3>
        </div>
        <div className="goal-progress-content" style={{ justifyContent: 'center' }}>
          <p style={{ color: '#ef4444', textAlign: 'center', margin: '0 0 16px 0' }}>
            Erreur de chargement: {error}
          </p>
          <button 
            onClick={() => {
              fetchStats();
              fetchGoalSettings();
            }}
            style={{
              background: '#fbb75f',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-goal-card">
      <div className="card-header">
        <h3>Objectif hebdomadaire</h3>
        {showGoToStatsButton && (
          <button 
            className="see-all-btn"
            onClick={() => navigate('/statistics')}
            title="Voir toutes les statistiques"
          >
            {t("home.seeAll") || "Voir tout"}
          </button>
        )}
      </div>
      
      <div className="goal-progress-content">
        <div className="progress-circle-container">
          <svg className="progress-circle" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#f1f5f9"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#132238"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - goalProgress.percentage / 100)}`}
              strokeLinecap="round"
              className="progress-stroke"
            />
          </svg>
          <div className="progress-percentage">
            {Math.round(goalProgress.percentage)}%
          </div>
        </div>

        <div className="goal-main-info">
          <div className="goal-title">
            {goalProgress.current} / {goalProgress.target}
          </div>
          <div className="goal-subtitle">
            candidatures cette semaine
          </div>
          <div className="time-remaining">
            {goalProgress.timeLeft}
          </div>
        </div>

        <div className="goal-stats-row">
          <div className="goal-stat-item">
            <span className="stat-number">{goalProgress.current}</span>
            <span className="stat-label">Réalisé</span>
          </div>
          <div className="goal-stat-item">
            <span className="stat-number">{Math.max(goalProgress.target - goalProgress.current, 0)}</span>
            <span className="stat-label">Restant</span>
          </div>
          <div className="goal-stat-item">
            <span className="stat-number">{Math.round(goalProgress.percentage)}%</span>
            <span className="stat-label">Progression</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyGoalCard; 
 
 