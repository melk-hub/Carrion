import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import apiService from "../services/api.js";
import ReactECharts from "echarts-for-react";
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

  if (
    !stats ||
    typeof stats.milestones !== "object" ||
    typeof stats.totalApplications !== "number" ||
    visibleIndex === null
  ) {
    return <div className="loading">{t("statistics.loading")}</div>;
  }

  let fullDailyData = generateEmptyDays().map((date) => ({
    date,
    count: stats.applicationsPerDay?.[date] || 0,
  }));

  const firstNonZeroIndex = fullDailyData.findIndex((entry) => entry.count > 0);

  const startIndex = Math.max(firstNonZeroIndex - 1, 0);

  const dailyData = firstNonZeroIndex !== -1 ? fullDailyData.slice(startIndex) : fullDailyData;

  const chartOptions = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#ccc",
      borderWidth: 1,
      textStyle: {
        color: "#333",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dailyData.map((item) =>
        new Date(item.date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        })
      ),
      axisLabel: {
        fontSize: 10,
        rotate: 45,
      },
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLabel: {
        fontSize: 10,
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#eee",
        },
      },
    },
    series: [
      {
        name: t("statistics.applications"),
        data: dailyData.map((item) => item.count),
        type: "line",
        smooth: true,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          color: "#ff7f50",
          width: 3,
        },
        areaStyle: {
          color: "rgba(255, 127, 80, 0.15)",
        },
        emphasis: {
          focus: "series",
        },
      },
    ],
  };

  return (
    <div className="statistics">
      <div className="container">
        {/* KPI Cards */}
        <div className="kpi-grid">
          <KpiCard title={t("statistics.streak")} value={stats.streak} />
          <KpiCard title={t("statistics.today")} value={stats.applicationsToday} />
          <KpiCard title={t("statistics.thisWeek")} value={stats.applicationsThisWeek} />
          <KpiCard title={t("statistics.thisMonth")} value={stats.applicationsThisMonth} />
          <KpiCard title={t("statistics.total")} value={stats.totalApplications} />
        </div>

        {/* Graphiques */}
        <div className="charts-grid">
          {/* Évolution quotidienne avec ECharts */}
          <ChartCard title={t("statistics.evolution")}>
            {dailyData.length > 0 ? (
              <ReactECharts option={chartOptions} style={{ height: 250, width: "100%" }} />
            ) : (
              <p className="no-data">{t("statistics.noData")}</p>
            )}
          </ChartCard>

          {/* Milestones globaux */}
          <ChartCard title={t("statistics.success")}>
            <div className="milestone-wrapper">
              {Object.entries(stats.milestones || {})
                .filter(([, achieved]) => achieved)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([threshold]) => (
                  <div key={threshold} className="milestone achieved">
                    ✅ {threshold} {t("statistics.applications")}
                  </div>
                ))}

              {(() => {
                const total = stats.totalApplications || 0;
                const sortedMilestones = Object.keys(stats.milestones || {})
                  .map(Number)
                  .sort((a, b) => a - b);
                const nextMilestone = sortedMilestones.find((t) => total < t);
                const justReached = sortedMilestones.some(
                  (threshold) => total === threshold
                );

                return (
                  <>
                    {justReached && (
                      <div className="milestone-message success">
                        🎉 {t("statistics.congratulations")} <strong>{total}</strong> {t("statistics.applications")} !
                      </div>
                    )}

                    {nextMilestone && (
                      <div className="milestone-message">
                        <strong>{nextMilestone - total}</strong> {t("statistics.nextStep")}
                      </div>
                    )}

                    {!nextMilestone && sortedMilestones.length > 0 && (
                      <div className="milestone-message">
                        🏆 {t("statistics.finish")}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </ChartCard>

          {/* Objectif personnel */}
          <ChartCard title={t("statistics.personalGoal")}>
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
                    strokeDasharray={`${Math.round((stats.personalGoal.current / stats.personalGoal.target) * 100)}, 100`}
                    d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">
                    {Math.round((stats.personalGoal.current / stats.personalGoal.target) * 100)}%
                  </text>
                </svg>
              </div>

              <div className="progress-details">
                <div className="progress-item">
                  <span className="progress-label">{t("statistics.goal")}</span>
                  <span className="progress-value">{stats.personalGoal.target} {t("statistics.applications")} </span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">{t("statistics.accomplished")}</span>
                  <span className="progress-value">{stats.personalGoal.current} {t("statistics.applications")}</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">{t("statistics.remaining")}</span>
                  <span className="progress-value">
                    {Math.max(stats.personalGoal.target - stats.personalGoal.current, 0)} {t("statistics.applications")}
                  </span>
                </div>
              </div>
            </div>

            <div className="milestone-status">
              {stats.personalGoal.achieved && (
                <p>🎉 Bravo, objectif atteint ! Tu as envoyé {stats.personalGoal.current} candidatures cette semaine !</p>
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
