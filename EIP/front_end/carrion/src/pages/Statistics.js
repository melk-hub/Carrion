import React, { useEffect, useState, useMemo } from "react";
import apiService from "../services/api.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { format, subDays, isToday, isThisWeek, isThisMonth, endOfWeek, endOfMonth } from 'date-fns';
import "../styles/Statistics.css";
import Loading from '../components/Loading';
import { useLanguage } from '../contexts/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Statistics() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [activeGoalType, setActiveGoalType] = useState('weekly');
  const [goalSettings, setGoalSettings] = useState({
    weeklyGoal: 5,
    monthlyGoal: 20
  });
  const [userRanking, setUserRanking] = useState(null);
  
  // États pour le carousel des statuts
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchGoalSettings();
    fetchUserRanking();
  }, []);

  // Auto-scroll pour le carousel des statuts
  // Supprimé - pas d'autoplay

  useEffect(() => {
    if (stats?.statusDistribution) {
      const statusCount = Object.keys(stats.statusDistribution).length;
      if (currentStatusIndex >= statusCount) {
        setCurrentStatusIndex(0);
      }
    }
  }, [stats?.statusDistribution, currentStatusIndex]);

    const fetchStats = async () => {
      try {
      setLoading(true);
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
              totalUsers: allUsers.length,
            });
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du classement :", error);
    }
  };

  // Mémoriser les données statistiques pour éviter les recalculs constants
  const statsData = useMemo(() => {
    if (!stats || !stats.applicationsPerDay) return null;

    const now = new Date();
    let days = [];
    let daysCount = 30;

    switch (timeRange) {
      case '7days':
        daysCount = 7;
        break;
      case '30days':
        daysCount = 30;
        break;
      case '3months':
        daysCount = 90;
        break;
      case '6months':
        daysCount = 180;
        break;
      default:
        daysCount = 30;
    }

    // Générer les jours
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      days.push({
        date: dateStr,
        dateObj: date,
        count: stats.applicationsPerDay[dateStr] || 0,
      });
    }

    // Calculer les totaux
    const totals = {
      today: days.filter(d => isToday(d.dateObj)).reduce((sum, d) => sum + d.count, 0),
      thisWeek: days.filter(d => isThisWeek(d.dateObj, { weekStartsOn: 1 })).reduce((sum, d) => sum + d.count, 0),
      thisMonth: days.filter(d => isThisMonth(d.dateObj)).reduce((sum, d) => sum + d.count, 0),
      total: days.reduce((sum, d) => sum + d.count, 0),
      weekAverage: Math.round((days.filter(d => isThisWeek(d.dateObj, { weekStartsOn: 1 })).reduce((sum, d) => sum + d.count, 0)) / 7 * 10) / 10,
      monthAverage: Math.round((days.filter(d => isThisMonth(d.dateObj)).reduce((sum, d) => sum + d.count, 0)) / 30 * 10) / 10,
    };

    return { days, totals };
  }, [stats, timeRange]);

  // Mémoriser la configuration du graphique en ligne pour éviter les recalculs
  const lineChartConfig = useMemo(() => {
    if (!statsData) return null;

    const labels = statsData.days.map(d => {
      if (timeRange === '7days') {
        return format(new Date(d.date), 'EEE');
      } else {
        return format(new Date(d.date), 'dd/MM');
      }
    });

    const data = {
      labels,
      datasets: [
        {
          label: 'Candidatures',
          data: statsData.days.map(d => d.count),
          borderColor: '#132238',
          backgroundColor: 'rgba(19, 34, 56, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#fbb75f',
          pointBorderColor: '#132238',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
    tooltip: {
          backgroundColor: '#132238',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#fbb75f',
      borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#64748b',
    },
    grid: {
            color: '#e2e8f0',
          },
        },
        x: {
          ticks: {
            color: '#64748b',
          },
          grid: {
            display: false,
          },
        },
      },
    };

    return { data, options };
  }, [statsData, timeRange]);

  // Mémoriser la configuration du graphique de statuts pour éviter les recalculs
  const statusChartInfo = useMemo(() => {
    if (!stats || !stats.statusDistribution) return null;

    const statusColors = {
      APPLIED: '#fbb75f',
      PENDING: '#f59e0b',
      INTERVIEW_SCHEDULED: '#3b82f6',
      OFFER_RECEIVED: '#10b981',
      REJECTED_BY_COMPANY: '#ef4444',
      OFFER_ACCEPTED: '#22c55e',
    };

    const labels = Object.keys(stats.statusDistribution);
    const values = Object.values(stats.statusDistribution);
    const total = values.reduce((sum, val) => sum + val, 0);
    const backgroundColors = labels.map(status => statusColors[status] || '#94a3b8');

    const data = {
      labels: labels.map(status => {
        switch (status) {
          case 'APPLIED': return 'Postulé';
          case 'PENDING': return 'En attente';
          case 'INTERVIEW_SCHEDULED': return 'Entretien';
          case 'OFFER_RECEIVED': return 'Offre reçue';
          case 'REJECTED_BY_COMPANY': return 'Refusé';
          case 'OFFER_ACCEPTED': return 'Accepté';
          default: return status;
        }
      }),
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: '#ffffff',
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '77.5%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#132238',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#fbb75f',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const percentage = total > 0 ? Math.round((context.raw / total) * 100) : 0;
              return `${context.label}: ${context.raw} (${percentage}%)`;
            }
          }
        },
      },
    };

    return { data, options, total, values, labels: data.labels };
  }, [stats]);

  // Mémoriser le calcul des progrès d'objectif pour éviter les recalculs constants
  const goalProgress = useMemo(() => {
    if (!stats || !statsData) return { current: 0, target: 10, percentage: 0, timeLeft: '', period: 'semaine' };

    let current = 0;
    let target = goalSettings.weeklyGoal;
    let period = 'semaine';
    let timeLeft = '';

    if (activeGoalType === 'weekly') {
      current = statsData.totals.thisWeek;
      target = goalSettings.weeklyGoal;
      period = 'semaine';
      const now = new Date();
      const endWeek = endOfWeek(now, { weekStartsOn: 1 });
      const daysLeft = Math.ceil((endWeek - now) / (1000 * 60 * 60 * 24));
      timeLeft = `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`;
    } else {
      current = statsData.totals.thisMonth;
      target = goalSettings.monthlyGoal;
      period = 'mois';
      const now = new Date();
      const endMonth = endOfMonth(now);
      const daysLeft = Math.ceil((endMonth - now) / (1000 * 60 * 60 * 24));
      timeLeft = `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`;
    }

    const percentage = Math.min((current / target) * 100, 100);
    
    return { current, target, percentage, timeLeft, period };
  }, [stats, statsData, goalSettings, activeGoalType]);

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

  if (loading) {
    return <Loading message="Chargement des statistiques..." />;
  }

  return (
    <div className="carrion-statistics">
      {statsData && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.today}</div>
            <div className="kpi-label">Aujourd'hui</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.thisWeek}</div>
            <div className="kpi-label">Cette semaine</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.thisMonth}</div>
            <div className="kpi-label">Ce mois</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.total}</div>
            <div className="kpi-label">Total</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.weekAverage}</div>
            <div className="kpi-label">Moyenne/semaine</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{stats.streak || 0}</div>
            <div className="kpi-label">Série actuelle</div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
        <div className="charts-grid">
        {/* Evolution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Évolution des candidatures</h3>
            <div className="time-range-selector">
              <button 
                className={timeRange === '7days' ? 'active' : ''}
                onClick={() => setTimeRange('7days')}
              >
                7j
              </button>
              <button 
                className={timeRange === '30days' ? 'active' : ''}
                onClick={() => setTimeRange('30days')}
              >
                30j
              </button>
              <button 
                className={timeRange === '3months' ? 'active' : ''}
                onClick={() => setTimeRange('3months')}
              >
                3m
              </button>
              <button 
                className={timeRange === '6months' ? 'active' : ''}
                onClick={() => setTimeRange('6months')}
              >
                6m
              </button>
            </div>
          </div>
          <div className="chart-container">
            {lineChartConfig ? (
              <Line data={lineChartConfig.data} options={lineChartConfig.options} />
            ) : (
              <div className="empty-state">
                <p>Aucune donnée disponible</p>
                <small>Commencez à postuler pour voir vos statistiques !</small>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Répartition par statut</h3>
          </div>
          <div className="chart-container">
            {statusChartInfo && statusChartInfo.data && statusChartInfo.data.datasets.length > 0 && statusChartInfo.total > 0 ? (
              <div className="status-chart-wrapper">
                <div className="doughnut-container">
                  <Doughnut data={statusChartInfo.data} options={statusChartInfo.options} />
                  <div className="chart-center-content">
                    <div className="center-total">{statusChartInfo.total}</div>
                    <div className="center-label">Total</div>
                  </div>
                </div>
                
                {/* Status Distribution Carousel */}
                <div className="status-legend-carousel">

              {(() => {
                    const statusEntries = Object.entries(stats.statusDistribution);
                    const statusLabels = {
                      APPLIED: 'Postulé',
                      PENDING: 'En attente',
                      INTERVIEW_SCHEDULED: 'Entretien',
                      OFFER_RECEIVED: 'Offre reçue',
                      REJECTED_BY_COMPANY: 'Refusé',
                      OFFER_ACCEPTED: 'Accepté',
                    };
                    const statusColors = {
                      APPLIED: '#fbb75f',
                      PENDING: '#f59e0b',
                      INTERVIEW_SCHEDULED: '#3b82f6',
                      OFFER_RECEIVED: '#10b981',
                      REJECTED_BY_COMPANY: '#ef4444',
                      OFFER_ACCEPTED: '#22c55e',
                    };

                return (
                  <>
                        {/* Navigation buttons */}
                        {statusEntries.length > 1 && (
                          <>
                            <button 
                              className="carousel-nav-btn prev"
                              onClick={() => {
                                setCurrentStatusIndex(prev => 
                                  prev === 0 ? statusEntries.length - 1 : prev - 1
                                );
                              }}
                            >
                              ‹
                            </button>
                            <button 
                              className="carousel-nav-btn next"
                              onClick={() => {
                                setCurrentStatusIndex(prev => 
                                  (prev + 1) % statusEntries.length
                                );
                              }}
                            >
                              ›
                            </button>
                          </>
                        )}
                        
                        {/* Carousel container */}
                        <div className="carousel-container">
                          <div 
                            className="carousel-track-single"
                            style={{
                              transform: `translateX(-${currentStatusIndex * 100}%)`,
                              transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
                            }}
                            onMouseDown={(e) => {
                              setIsDragging(true);
                              setStartX(e.clientX);
                              setCurrentX(e.clientX);
                            }}
                            onMouseMove={(e) => {
                              if (!isDragging) return;
                              e.preventDefault();
                              setCurrentX(e.clientX);
                            }}
                            onMouseUp={() => {
                              if (isDragging) {
                                const diff = startX - currentX;
                                const threshold = 50;
                                
                                if (Math.abs(diff) > threshold) {
                                  if (diff > 0 && currentStatusIndex < statusEntries.length - 1) {
                                    // Glisser vers la gauche - carte suivante
                                    setCurrentStatusIndex(prev => prev + 1);
                                  } else if (diff < 0 && currentStatusIndex > 0) {
                                    // Glisser vers la droite - carte précédente
                                    setCurrentStatusIndex(prev => prev - 1);
                                  }
                                }
                                
                                setIsDragging(false);
                                setStartX(0);
                                setCurrentX(0);
                              }
                            }}
                            onMouseLeave={() => {
                              if (isDragging) {
                                setIsDragging(false);
                                setStartX(0);
                                setCurrentX(0);
                              }
                            }}
                          >
                            {/* Afficher une carte à la fois */}
                            {statusEntries.map(([status, count], index) => {
                              const label = statusLabels[status] || status;
                              const color = statusColors[status] || '#94a3b8';
                              const percentage = statusChartInfo.total > 0 ? Math.round((count / statusChartInfo.total) * 100) : 0;
                              
                              return (
                                <div 
                                  key={`status-${status}-${index}`} 
                                  className="carousel-status-card-single"
                                  style={{'--status-color': color}}
                                >
                                  <div className="status-name">{label}</div>
                                  <div className="stats-row">
                                    <div className="count-badge">{count}</div>
                                    <div 
                                      className="percentage-badge"
                                      style={{ backgroundColor: color }}
                                    >
                                      {percentage}%
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                      </div>
                        
                        {/* Indicateurs de carte */}
                        {statusEntries.length > 1 && (
                          <div className="carousel-indicators">
                            {statusEntries.map((_, index) => (
                              <div
                                key={`indicator-${index}`}
                                className={`carousel-dot ${index === currentStatusIndex ? 'active' : ''}`}
                                onClick={() => {
                                  setCurrentStatusIndex(index);
                                }}
                              />
                            ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
              </div>
            ) : (
              <div className="status-chart-no-data">
                <div className="no-data-icon">
                  📊
                </div>
                <h3>Aucune candidature</h3>
                <p>Commencez à postuler pour voir la répartition de vos candidatures par statut</p>
              </div>
            )}
          </div>
        </div>

        {/* Goal Progress */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Objectif {activeGoalType === 'weekly' ? 'hebdomadaire' : 'mensuel'}</h3>
            <div className="goal-type-selector">
              <button 
                className={activeGoalType === 'weekly' ? 'active' : ''}
                onClick={() => setActiveGoalType('weekly')}
              >
                Semaine
              </button>
              <button 
                className={activeGoalType === 'monthly' ? 'active' : ''}
                onClick={() => setActiveGoalType('monthly')}
              >
                Mois
              </button>
            </div>
          </div>
          <div className="chart-container">
            <div className="goal-progress-card-improved">
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
                  candidatures cette {activeGoalType === 'weekly' ? 'semaine' : 'mois'}
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
                  <span className="stat-number">{Math.round((goalProgress.current / Math.max(goalProgress.target, 1)) * 100)}%</span>
                  <span className="stat-label">Progression</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Performance</h3>
          </div>
          <div className="chart-container">
            <div className="performance-insights">
              <div className="insight-item">
                <span className="insight-label">{t("home.stats.totalApplications")}</span>
                <span className="insight-value">
                  {stats?.totalApplications || 0}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">{t("home.stats.todayApplications")}</span>
                <span className="insight-value">
                  {stats?.applicationsToday || 0}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">{t("home.stats.userRanking")}</span>
                <span className="insight-value">
                  {formatRanking(userRanking)}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Record de série</span>
                <span className="insight-value">
                  {stats?.bestStreak || stats?.streak || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Comparaison hebdomadaire</h3>
          </div>
          <div className="chart-container">
            <div className="weekly-comparison">
              <div className="comparison-item">
                <span className="comparison-label">Cette semaine</span>
                <span className="comparison-value">{statsData?.totals.thisWeek || 0}</span>
                <div className="comparison-bar">
                  <div 
                    className="comparison-fill current" 
                    style={{ width: `${Math.min((statsData?.totals.thisWeek || 0) / Math.max(statsData?.totals.thisWeek || 1, goalSettings.weeklyGoal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">Semaine dernière</span>
                <span className="comparison-value">
                  {statsData ? statsData.days.filter(d => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    const startOfLastWeek = new Date(weekAgo);
                    startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay() + 1);
                    const endOfLastWeek = new Date(startOfLastWeek);
                    endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
                    const dayDate = new Date(d.date);
                    return dayDate >= startOfLastWeek && dayDate <= endOfLastWeek;
                  }).reduce((sum, d) => sum + d.count, 0) : 0}
                  </span>
                <div className="comparison-bar">
                  <div 
                    className="comparison-fill last" 
                    style={{ width: `${Math.min((statsData ? statsData.days.filter(d => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      const startOfLastWeek = new Date(weekAgo);
                      startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay() + 1);
                      const endOfLastWeek = new Date(startOfLastWeek);
                      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
                      const dayDate = new Date(d.date);
                      return dayDate >= startOfLastWeek && dayDate <= endOfLastWeek;
                    }).reduce((sum, d) => sum + d.count, 0) : 0) / Math.max(statsData?.totals.thisWeek || 1, goalSettings.weeklyGoal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
                </div>
              </div>
            </div>

        {/* Additional Stats */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Statistiques détaillées</h3>
          </div>
          <div className="chart-container">
            <div className="advanced-stats">
              <div className="stat-row">
                <span className="comparison-label">Entretiens obtenus</span>
                <span className="stat-value">{stats?.interviewCount || 0}</span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">Dernière candidature</span>
                <span className="stat-value">
                  {stats?.lastApplicationDate 
                    ? format(new Date(stats.lastApplicationDate), 'dd/MM/yyyy') 
                    : 'Aucune'}
                </span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">Moyenne mensuelle</span>
                <span className="stat-value">{statsData?.totals.monthAverage || 0}</span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">Total candidatures</span>
                <span className="stat-value">{stats?.totalApplications || 0}</span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">Meilleure série</span>
                <span className="stat-value">{stats?.bestStreak || stats?.streak || 0} jours</span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">Offres reçues</span>
                <span className="stat-value">{stats?.statusDistribution?.OFFER_RECEIVED || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
