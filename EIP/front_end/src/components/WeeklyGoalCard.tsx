"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, subDays, isThisWeek, endOfWeek } from "date-fns";
import apiService from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";

interface StatsData {
  applicationsPerDay: Record<string, number>;
}

interface GoalSettings {
  weeklyGoal: number;
  monthlyGoal: number;
}

interface WeeklyGoalCardProps {
  showGoToStatsButton?: boolean;
}

const WeeklyGoalCard = ({
  showGoToStatsButton = false,
}: WeeklyGoalCardProps) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [goalSettings, setGoalSettings] = useState<GoalSettings>({
    weeklyGoal: 5,
    monthlyGoal: 20,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token d'authentification manquant.");
      setLoading(false);
      return;
    }

    fetchStats(token);
    fetchGoalSettings(token);
  }, []);

  const fetchStats = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<StatsData>("/statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erreur lors du chargement des statistiques :", error);
        setError(error.message || "Erreur inconnue");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalSettings = async (token: string) => {
    try {
      const data = await apiService.get<GoalSettings>("/settings/goal", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoalSettings({
        weeklyGoal: data.weeklyGoal || 5,
        monthlyGoal: data.monthlyGoal || 20,
      });
    } catch (error) {
      console.error(
        "Erreur lors du chargement des paramètres d'objectif :",
        error
      );
    }
  };

  const statsData = useMemo(() => {
    if (!stats || !stats.applicationsPerDay) return null;

    const now = new Date();
    const days: { date: string; dateObj: Date; count: number }[] = [];
    const daysCount = 7;

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
      thisWeek: days
        .filter((d) => isThisWeek(d.dateObj, { weekStartsOn: 1 }))
        .reduce((sum, d) => sum + d.count, 0),
    };

    return { days, totals };
  }, [stats]);

  const goalProgress = useMemo(() => {
    if (!statsData) {
      return {
        current: 0,
        target: goalSettings.weeklyGoal,
        percentage: 0,
        timeLeft: "",
      };
    }

    const current = statsData.totals.thisWeek;
    const target = goalSettings.weeklyGoal;

    const now = new Date();
    const endWeek = endOfWeek(now, { weekStartsOn: 1 });
    const daysLeft = Math.ceil(
      (endWeek.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const timeLeft = `${daysLeft} ${t("home.objectives.daysLeft")}`;

    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

    return { current, target, percentage, timeLeft };
  }, [statsData, goalSettings.weeklyGoal, t]);

  if (loading) {
    return (
      <div className="weekly-goal-card loading">
        <div className="loading-spinner"></div>
        <p>{t("common.loading") as string}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-goal-card">
        <div className="card-header">
          <h3>{t("home.objectives.weekly") as string}</h3>
        </div>
        <div
          className="goal-progress-content"
          style={{ justifyContent: "center" }}
        >
          <p
            style={{
              color: "#ef4444",
              textAlign: "center",
              margin: "0 0 16px 0",
            }}
          >
            {t("home.error") as string}: {error}
          </p>
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              if (token) {
                fetchStats(token);
                fetchGoalSettings(token);
              }
            }}
            style={{
              background: "#fbb75f",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {t("common.retry") as string}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-goal-card">
      <div className="card-header">
        <h3>{t("home.objectives.weekly") as string}</h3>
        {showGoToStatsButton && (
          <button
            className="see-all-btn"
            onClick={() => router.push("/statistics")}
            title="Voir toutes les statistiques"
          >
            {(t("home.seeAll") as string) || "Voir tout"}
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
            {t("home.objectives.applications") as string}
          </div>
          <div className="time-remaining">{goalProgress.timeLeft}</div>
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
              {Math.round(goalProgress.percentage)}%
            </span>
            <span className="stat-label">
              {t("home.objectives.progress") as string}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyGoalCard;
