import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext"
import apiService from "../services/api.js"
import {
  PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line
} from "recharts";
import "../styles/Statistics.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c", "#d0ed57", "#888888", "#83a6ed", "#8dd1e1"];

function Statistics() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null);
  
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
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques :", error);
    }
  };
  
  fetchStats();
  }, []);

  if (!stats) return <div className="loading">{t('statistics.loading')}</div>;

  const toChartData = (obj) =>
    Object.entries(obj).map(([key, value]) => ({ name: key, value }));

  return (
    <div className="stats-container">
      <h1 className="stats-title">{t('statistics.title')}</h1>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard title="Total" value={stats.totalApplications} />
        <KpiCard title="Cette semaine" value={stats.applicationsThisWeek} />
        <KpiCard title="Ce mois-ci" value={stats.applicationsThisMonth} />
        <KpiCard title="Entretiens" value={stats.interviewCount} />
      </div>

      {/* Graphs */}
      <div className="charts-grid">
        <ChartCard title="Répartition par statut">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={toChartData(stats.statusDistribution)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {toChartData(stats.statusDistribution).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Candidatures par entreprise">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={toChartData(stats.companyDistribution)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Répartition géographique">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={toChartData(stats.locationDistribution)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Évolution hebdomadaire">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.applicationsPerWeek || []}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#ff7f50" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
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
