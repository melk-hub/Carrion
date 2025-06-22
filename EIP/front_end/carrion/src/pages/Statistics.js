import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import apiService from "../services/api.js";
import {
  PieChart, Pie,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line
} from "recharts";
import "../styles/Statistics.css";

function generateEmptyDays() {
  const days = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    days.push(date);
  }

  return days;
}

function Statistics() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [visibleIndex, setVisibleIndex] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

        const thresholds = Object.keys(data.milestones || {})
          .map(Number)
          .sort((a, b) => a - b);

        const firstUnachievedIndex = thresholds.findIndex(
          (t) => !data.milestones[String(t)]
        );

        setVisibleIndex(
          firstUnachievedIndex !== -1
            ? firstUnachievedIndex
            : thresholds.length - 1
        );
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats || !stats.milestones || !stats.totalApplications || visibleIndex === null) {
    return <div className="loading">{t('statistics.loading')}</div>;
  }

  const dailyData = generateEmptyDays().map(date => ({
    date,
    count: stats.applicationsPerDay?.[date] || 0,
  }));
  const maxCount = Math.max(...dailyData.map(d => d.count));

  return (
    <div className="statistics">
      <div className="container">
        <h1 className="stats-title">{t('statistics.title')}</h1>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <KpiCard title="Streak (jours)" value={stats.streak} />
          <KpiCard title="Aujourd'hui" value={stats.applicationsToday} />
          <KpiCard title="Cette semaine" value={stats.applicationsThisWeek} />
          <KpiCard title="Ce mois-ci" value={stats.applicationsThisMonth} />
          <KpiCard title="Total" value={stats.totalApplications} />
        </div>

        {/* Graphiques */}
        <div className="charts-grid">

          {/* Évolution quotidienne */}
          <ChartCard title="Évolution sur les 30 derniers jours:">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(dateStr) =>
                      new Date(dateStr).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => Number.isInteger(value) ? value : ''}
                    domain={[0, maxCount]}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#ff7f50" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">Aucune donnée pour les 30 derniers jours.</p>
            )}
          </ChartCard>

          {/* Milestones globaux de l'app */}
          <ChartCard title="Succès atteints:">
            <div className="milestone-wrapper">
                {Object.entries(stats.milestones || {})
                .filter(([, achieved]) => achieved)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([threshold]) => (
                    <div key={threshold} className="milestone achieved">
                    ✅ {threshold} candidatures
                    </div>
                ))}
    
                {(() => {
                const total = stats.totalApplications || 0;
                const sortedMilestones = Object.keys(stats.milestones || {})
                    .map(Number)
                    .sort((a, b) => a - b);
                const nextMilestone = sortedMilestones.find((t) => total < t);
    
                if (nextMilestone) {
                    return (
                    <div className="milestone-message">
                        🎉 Bravo, tu as envoyé <strong>{total}</strong> candidatures!<br />
                        Plus que <strong>{nextMilestone - total}</strong> avant le prochain palier
                    </div>
                    );
                } else if (sortedMilestones.length > 0) {
                    return (
                    <div className="milestone-message">
                        🏆 Félicitations, tu as atteint tous les paliers!
                    </div>
                    );
                }
                return null;
                })()}
            </div>
          </ChartCard>

          {/* Example d'Objectif personnel qu'il faudra definir autre par dans l'app*/}
          <ChartCard title={<>Objectif personnel:<br />{stats.personalGoal.target} candidatures cette semaine</>}>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                <Pie
                    data={[
                    {
                        name: "Envoyées",
                        value: Math.min(stats.personalGoal.current, stats.personalGoal.target),
                    },
                    {
                        name: "Restant",
                        value: Math.max(stats.personalGoal.target - stats.personalGoal.current, 0),
                    },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                >
                    <Cell fill="#FBB75F" />
                    <Cell fill="#ccc" />
                </Pie>
                <Tooltip />
                </PieChart>
            </ResponsiveContainer>

            <div className="milestone-status">
                {stats.personalGoal.achieved ? (
                <p>🎉 Bravo, objectif atteint ! Tu as envoyé {stats.personalGoal.current} candidatures cette semaine !</p>
                ) : (
                <p>
                    Progression : {stats.personalGoal.current} / {stats.personalGoal.target} candidatures cette semaine
                </p>
                )}
            </div>
            </ChartCard>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div className="kpi-card">
      <h2 className="kpi-title">{title}</h2>
      <p className="kpi-value">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      {children}
    </div>
  );
}

export default Statistics;
