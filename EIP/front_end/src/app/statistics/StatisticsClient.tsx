"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
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
  ChartOptions,
  ChartData,
} from "chart.js";

import {
  format,
  subDays,
  isToday,
  isThisWeek,
  isThisMonth,
  endOfWeek,
  endOfMonth,
} from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoalSettings } from "@/interface/misc.interface";
import {
  StatisticsData,
  UserRankingInfo,
} from "@/interface/statistics.interface";

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

const DynamicLine = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  {
    ssr: false,
  }
);
const DynamicDoughnut = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Doughnut),
  {
    ssr: false,
  }
);

interface StatisticsClientProps {
  stats: StatisticsData | null;
  goalSettings: GoalSettings | null;
  userRanking: UserRankingInfo | null;
  error: string | null;
}

const defaultGoals: GoalSettings = { weeklyGoal: 10, monthlyGoal: 30 };

export default function StatisticsClient({
  stats,
  goalSettings = defaultGoals,
  userRanking,
  error,
}: StatisticsClientProps) {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState("7days");
  const [activeGoalType, setActiveGoalType] = useState("weekly");
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const statsData = useMemo(() => {
    if (!stats?.applicationsPerDay) return null;
    const now = new Date();
    const days: { date: string; dateObj: Date; count: number }[] = [];
    let daysCount = 30;

    switch (timeRange) {
      case "7days":
        daysCount = 7;
        break;
      case "30days":
        daysCount = 30;
        break;
      case "3months":
        daysCount = 90;
        break;
      case "6months":
        daysCount = 180;
        break;
      default:
        daysCount = 30;
    }

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");
      days.push({
        date: dateStr,
        dateObj: date,
        count: stats.applicationsPerDay[dateStr] || 0,
      });
    }

    const totals = {
      today: days
        .filter((d) => isToday(d.dateObj))
        .reduce((sum, d) => sum + d.count, 0),
      thisWeek: days
        .filter((d) => isThisWeek(d.dateObj, { weekStartsOn: 1 }))
        .reduce((sum, d) => sum + d.count, 0),
      thisMonth: days
        .filter((d) => isThisMonth(d.dateObj))
        .reduce((sum, d) => sum + d.count, 0),
      total: days.reduce((sum, d) => sum + d.count, 0),
      weekAverage:
        Math.round(
          (days
            .filter((d) => isThisWeek(d.dateObj, { weekStartsOn: 1 }))
            .reduce((sum, d) => sum + d.count, 0) /
            7) *
            10
        ) / 10,
      monthAverage:
        Math.round(
          (days
            .filter((d) => isThisMonth(d.dateObj))
            .reduce((sum, d) => sum + d.count, 0) /
            30) *
            10
        ) / 10,
    };
    return { days, totals };
  }, [stats, timeRange]);

  const lineChartConfig = useMemo(() => {
    if (!statsData) return null;
    const labels = statsData.days.map((d) =>
      timeRange === "7days"
        ? format(new Date(d.date), "EEE")
        : format(new Date(d.date), "dd/MM")
    );
    const data: ChartData<"line"> = {
      labels,
      datasets: [
        {
          label: "Candidatures",
          data: statsData.days.map((d) => d.count),
          borderColor: "#132238",
          backgroundColor: "rgba(19, 34, 56, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#fbb75f",
          pointBorderColor: "#132238",
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    };
    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#132238",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#fbb75f",
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: "#64748b" },
          grid: { color: "#e2e8f0" },
        },
        x: { ticks: { color: "#64748b" }, grid: { display: false } },
      },
    };
    return { data, options };
  }, [statsData, timeRange]);

  const statusChartInfo = useMemo(() => {
    if (!stats?.statusDistribution) return null;
    const statusColors: Record<string, string> = {
      APPLIED: "#fbb75f",
      PENDING: "#f59e0b",
      INTERVIEW_SCHEDULED: "#3b82f6",
      OFFER_RECEIVED: "#10b981",
      REJECTED_BY_COMPANY: "#ef4444",
      OFFER_ACCEPTED: "#22c55e",
    };
    const labels = Object.keys(stats.statusDistribution);
    const values = Object.values(stats.statusDistribution) as number[];
    const total = values.reduce((sum, val) => sum + val, 0);
    const data: ChartData<"doughnut"> = {
      labels: labels.map(
        (status) => t(`dashboard.statuses.${status}`) as string
      ),
      datasets: [
        {
          data: values,
          backgroundColor: labels.map(
            (status) => statusColors[status] || "#94a3b8"
          ),
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: "#ffffff",
        },
      ],
    };
    const options: ChartOptions<"doughnut"> = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "77.5%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#132238",
          callbacks: {
            label: (context) =>
              `${context.label}: ${context.raw} (${
                total > 0
                  ? Math.round(((context.raw as number) / total) * 100)
                  : 0
              }%)`,
          },
        },
      },
    };
    return { data, options, total };
  }, [stats, t]);

  const goalProgress = useMemo(() => {
    if (!statsData || !goalSettings)
      return {
        current: 0,
        target: 10,
        percentage: 0,
        timeLeft: "0",
        period: "semaine",
      };
    const now = new Date();
    const { weeklyGoal, monthlyGoal } = goalSettings;
    if (activeGoalType === "weekly") {
      const current = statsData.totals.thisWeek;
      const target = weeklyGoal || 1;
      const endWeek = endOfWeek(now, { weekStartsOn: 1 });
      const daysLeft = Math.ceil(
        (endWeek.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        current,
        target,
        percentage: Math.min((current / target) * 100, 100),
        timeLeft: `${daysLeft}`,
        period: "semaine",
      };
    } else {
      const current = statsData.totals.thisMonth;
      const target = monthlyGoal || 1;
      const endMonth = endOfMonth(now);
      const daysLeft = Math.ceil(
        (endMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        current,
        target,
        percentage: Math.min((current / target) * 100, 100),
        timeLeft: `${daysLeft}`,
        period: "mois",
      };
    }
  }, [statsData, goalSettings, activeGoalType]);

  const formatRanking = (ranking: UserRankingInfo | null) => {
    if (!ranking) return t("home.ranking.noRank") as string;
    const { rank } = ranking;
    const ordinalKey = `home.ranking.ordinals.${rank}`;
    const ordinalTranslation = t(ordinalKey) as string;
    return ordinalTranslation !== ordinalKey
      ? ordinalTranslation
      : `${rank}${t("home.ranking.suffix") as string}`;
  };

  if (error)
    return (
      <main className="carrion-statistics-error">
        <p>Erreur: {error}</p>
      </main>
    );
  if (!stats)
    return (
      <main className="carrion-statistics-empty">
        <p>{t("statistics.noData") as string}</p>
      </main>
    );

  const statusEntries = Object.entries(stats.statusDistribution || {});

  return (
    <main className="carrion-statistics">
      {statsData && (
        <section
          className="kpi-grid"
          aria-label={t("statistics.kpiSectionLabel") as string}
        >
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.today}</div>
            <div className="kpi-label">{t("statistics.today") as string}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.thisWeek}</div>
            <div className="kpi-label">
              {t("statistics.thisWeek") as string}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.thisMonth}</div>
            <div className="kpi-label">
              {t("statistics.thisMonth") as string}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.total}</div>
            <div className="kpi-label">{t("shared.stats.total") as string}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{statsData.totals.weekAverage}</div>
            <div className="kpi-label">
              {t("statistics.weekAverage") as string}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{stats.streak || 0}</div>
            <div className="kpi-label">{t("statistics.streak") as string}</div>
          </div>
        </section>
      )}

      <section
        className="charts-grid"
        aria-label={t("statistics.chartsSectionLabel") as string}
      >
        <article className="chart-card">
          <header className="chart-header">
            <h3>{t("statistics.evolution") as string}</h3>
            <div className="time-range-selector">
              <button
                className={timeRange === "7days" ? "active" : ""}
                onClick={() => setTimeRange("7days")}
              >
                7{t("statistics.days") as string}
              </button>
              <button
                className={timeRange === "30days" ? "active" : ""}
                onClick={() => setTimeRange("30days")}
              >
                30{t("statistics.days") as string}
              </button>
              <button
                className={timeRange === "3months" ? "active" : ""}
                onClick={() => setTimeRange("3months")}
              >
                3m
              </button>
              <button
                className={timeRange === "6months" ? "active" : ""}
                onClick={() => setTimeRange("6months")}
              >
                6m
              </button>
            </div>
          </header>
          <div className="chart-container">
            {lineChartConfig ? (
              <DynamicLine
                data={lineChartConfig.data}
                options={lineChartConfig.options}
              />
            ) : (
              <div className="empty-state">
                <p>{t("statistics.noData") as string}</p>
                <small>{t("statistics.noDataDescription") as string}</small>
              </div>
            )}
          </div>
        </article>

        <article className="chart-card">
          <header className="chart-header">
            <h3>{t("statistics.repartition") as string}</h3>
          </header>
          <div className="chart-container">
            {statusChartInfo && statusChartInfo.total > 0 ? (
              <div className="status-chart-wrapper">
                <div className="doughnut-container">
                  <DynamicDoughnut
                    data={statusChartInfo.data}
                    options={statusChartInfo.options}
                  />
                  <div className="chart-center-content">
                    <div className="center-total">{statusChartInfo.total}</div>
                    <div className="center-label">Total</div>
                  </div>
                </div>
                <div className="status-legend-carousel">
                  {statusEntries.length > 1 && (
                    <>
                      <button
                        className="carousel-nav-btn prev"
                        onClick={() =>
                          setCurrentStatusIndex((prev) =>
                            prev === 0 ? statusEntries.length - 1 : prev - 1
                          )
                        }
                      >
                        ‹
                      </button>
                      <button
                        className="carousel-nav-btn next"
                        onClick={() =>
                          setCurrentStatusIndex(
                            (prev) => (prev + 1) % statusEntries.length
                          )
                        }
                      >
                        ›
                      </button>
                    </>
                  )}
                  <div className="carousel-container">
                    <div
                      className="carousel-track-single"
                      style={{
                        transform: `translateX(-${currentStatusIndex * 100}%)`,
                        transition: isDragging
                          ? "none"
                          : "transform 0.3s ease-in-out",
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
                            if (
                              diff > 0 &&
                              currentStatusIndex < statusEntries.length - 1
                            ) {
                              setCurrentStatusIndex((prev) => prev + 1);
                            } else if (diff < 0 && currentStatusIndex > 0) {
                              setCurrentStatusIndex((prev) => prev - 1);
                            }
                          }
                          setIsDragging(false);
                        }
                      }}
                      onMouseLeave={() => {
                        if (isDragging) setIsDragging(false);
                      }}
                    >
                      {statusEntries.map(([status, count], index) => {
                        const label = t(
                          `dashboard.statuses.${status}`
                        ) as string;
                        const color =
                          (
                            statusChartInfo.data.datasets[0]
                              .backgroundColor as string[]
                          )[index] || "#94a3b8";
                        const percentage =
                          statusChartInfo.total > 0
                            ? Math.round(
                                ((count as number) / statusChartInfo.total) *
                                  100
                              )
                            : 0;
                        return (
                          <div
                            key={`status-${status}-${index}`}
                            className="carousel-status-card-single"
                            style={
                              { "--status-color": color } as React.CSSProperties
                            }
                          >
                            <div className="status-name">{label}</div>
                            <div className="stats-row">
                              <div className="count-badge">
                                {count as number}
                              </div>
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
                  {statusEntries.length > 1 && (
                    <div className="carousel-indicators">
                      {statusEntries.map((_, index) => (
                        <div
                          key={`indicator-${index}`}
                          className={`carousel-dot ${
                            index === currentStatusIndex ? "active" : ""
                          }`}
                          onClick={() => setCurrentStatusIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="status-chart-no-data">
                <div className="no-data-icon">📊</div>
                <h3>{t("statistics.noData") as string}</h3>
                <p>{t("statistics.noDataDescription") as string}</p>
              </div>
            )}
          </div>
        </article>

        <article className="chart-card">
          <header className="chart-header">
            <h3>
              {t("statistics.objective") as string}{" "}
              {activeGoalType === "weekly"
                ? (t("statistics.weekly") as string)
                : (t("statistics.monthly") as string)}
            </h3>
            <div className="goal-type-selector">
              <button
                className={activeGoalType === "weekly" ? "active" : ""}
                onClick={() => setActiveGoalType("weekly")}
              >
                {t("statistics.week") as string}
              </button>
              <button
                className={activeGoalType === "monthly" ? "active" : ""}
                onClick={() => setActiveGoalType("monthly")}
              >
                {t("statistics.month") as string}
              </button>
            </div>
          </header>
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
                    strokeDashoffset={`${
                      2 * Math.PI * 42 * (1 - goalProgress.percentage / 100)
                    }`}
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
                  {t("ranking.stats.applications") as string}{" "}
                  {activeGoalType === "weekly"
                    ? (t("statistics.thisWeek") as string)
                    : (t("statistics.thisMonth") as string)}
                </div>
                <div className="time-remaining">
                  {goalProgress.timeLeft}{" "}
                  {t("home.objectives.daysLeft") as string}
                </div>
              </div>
              <div className="goal-stats-row">
                <div className="goal-stat-item">
                  <span className="stat-number">{goalProgress.current}</span>
                  <span className="stat-label">
                    {t("home.objectives.accomplished") as string}
                  </span>
                </div>
                <div className="goal-stat-item">
                  <span className="stat-number">
                    {Math.max(goalProgress.target - goalProgress.current, 0)}
                  </span>
                  <span className="stat-label">
                    {t("home.objectives.remaining") as string}
                  </span>
                </div>
                <div className="goal-stat-item">
                  <span className="stat-number">
                    {Math.round(
                      (goalProgress.current /
                        Math.max(goalProgress.target, 1)) *
                        100
                    )}
                    %
                  </span>
                  <span className="stat-label">
                    {t("home.objectives.progress") as string}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="chart-card">
          <header className="chart-header">
            <h3>{t("statistics.performance") as string}</h3>
          </header>
          <div className="chart-container">
            <div className="performance-insights">
              <div className="insight-item">
                <span className="insight-label">
                  {t("home.stats.totalApplications") as string}
                </span>
                <span className="insight-value">
                  {stats?.totalApplications || 0}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">
                  {t("home.stats.todayApplications") as string}
                </span>
                <span className="insight-value">
                  {stats?.applicationsToday || 0}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">
                  {t("home.stats.userRanking") as string}
                </span>
                <span className="insight-value">
                  {formatRanking(userRanking)}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">
                  {t("statistics.streakRecord") as string}
                </span>
                <span className="insight-value">
                  {stats?.bestStreak || stats?.streak || 0}
                </span>
              </div>
            </div>
          </div>
        </article>

        <article className="chart-card">
          <header className="chart-header">
            <h3>{t("statistics.weeklyComparison") as string}</h3>
          </header>
          <div className="chart-container">
            <div className="weekly-comparison">
              <div className="comparison-item">
                <span className="comparison-label">
                  {t("statistics.thisWeek") as string}
                </span>
                <span className="comparison-value">
                  {statsData?.totals.thisWeek || 0}
                </span>
                <div className="comparison-bar">
                  <div
                    className="comparison-fill current"
                    style={{
                      width: `${Math.min(
                        ((statsData?.totals.thisWeek || 0) /
                          Math.max(
                            statsData?.totals.thisWeek || 1,
                            goalSettings?.weeklyGoal || 10
                          )) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">
                  {t("statistics.lastWeek") as string}
                </span>
                <span className="comparison-value">
                  {statsData
                    ? statsData.days
                        .filter((d) => {
                          const weekAgo = subDays(new Date(), 7);
                          const startOfLastWeek = new Date(weekAgo);
                          startOfLastWeek.setDate(
                            startOfLastWeek.getDate() -
                              startOfLastWeek.getDay() +
                              1
                          );
                          const endOfLastWeek = new Date(startOfLastWeek);
                          endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
                          const dayDate = new Date(d.date);
                          return (
                            dayDate >= startOfLastWeek &&
                            dayDate <= endOfLastWeek
                          );
                        })
                        .reduce((sum, d) => sum + d.count, 0)
                    : 0}
                </span>
                <div className="comparison-bar">
                  <div
                    className="comparison-fill last"
                    style={{
                      width: `${Math.min(
                        ((statsData
                          ? statsData.days
                              .filter((d) => {
                                const weekAgo = subDays(new Date(), 7);
                                const startOfLastWeek = new Date(weekAgo);
                                startOfLastWeek.setDate(
                                  startOfLastWeek.getDate() -
                                    startOfLastWeek.getDay() +
                                    1
                                );
                                const endOfLastWeek = new Date(startOfLastWeek);
                                endOfLastWeek.setDate(
                                  endOfLastWeek.getDate() + 6
                                );
                                const dayDate = new Date(d.date);
                                return (
                                  dayDate >= startOfLastWeek &&
                                  dayDate <= endOfLastWeek
                                );
                              })
                              .reduce((sum, d) => sum + d.count, 0)
                          : 0) /
                          Math.max(
                            statsData?.totals.thisWeek || 1,
                            goalSettings?.weeklyGoal || 10
                          )) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="chart-card">
          <header className="chart-header">
            <h3>{t("statistics.detailedStats") as string}</h3>
          </header>
          <div className="chart-container">
            <div className="advanced-stats">
              <div className="stat-row">
                <span className="comparison-label">
                  {t("statistics.interview") as string}
                </span>
                <span className="stat-value">{stats?.interviewCount || 0}</span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">
                  {t("statistics.lastApplication") as string}
                </span>
                <span className="stat-value">
                  {stats?.lastApplicationDate
                    ? format(new Date(stats.lastApplicationDate), "dd/MM/yyyy")
                    : ""}
                </span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">
                  {t("statistics.monthAverage") as string}
                </span>
                <span className="stat-value">
                  {statsData?.totals.monthAverage || 0}
                </span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">
                  {t("shared.stats.totalApplications") as string}
                </span>
                <span className="stat-value">
                  {stats?.totalApplications || 0}
                </span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">
                  {t("statistics.bestStreak") as string}
                </span>
                <span className="stat-value">
                  {stats?.bestStreak || stats?.streak || 0}{" "}
                  {t("statistics.days") as string}
                </span>
              </div>
              <div className="stat-row">
                <span className="comparison-label">
                  {t("statistics.offersReceived") as string}
                </span>
                <span className="stat-value">
                  {stats?.statusDistribution?.OFFER_RECEIVED || 0}
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
