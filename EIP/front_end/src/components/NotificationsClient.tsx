"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Loading from "@/components/Loading";
import {
  Notification,
} from "@/interface/notification.interface";

export default function NotificationsClient() {
  const { t } = useLanguage();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<string>("all");
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    // Le contexte gère déjà l'appel initial, mais on peut le rappeler si nécessaire.
    // Si le contexte ne le fait pas, cette ligne est correcte.
    fetchNotifications();
  }, [fetchNotifications]);

  const getFilteredNotifications = (): Notification[] => {
    const filterFunc = (n: Notification): boolean => {
      switch (filter) {
        case "unread":
          return !n.read;
        case "read":
          return n.read;
        case "POSITIVE":
        case "WARNING":
        case "NEGATIVE":
        case "INFO":
          return n.type === filter;
        default:
          return true;
      }
    };
    return notifications
      .filter(filterFunc)
      .sort(
        (a, b) =>
          (a.read === b.read ? 0 : a.read ? 1 : -1) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedNotifications).map((id) => deleteNotification(id))
      );
      setSelectedNotifications(new Set());
    } catch (err: unknown) {
      console.error("Erreur lors de la suppression en lot:", err);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const selectAll = () =>
    setSelectedNotifications(
      new Set(getFilteredNotifications().map((n) => n.id))
    );
  const deselectAll = () => setSelectedNotifications(new Set());
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) markAsRead(notification.id);
  };

  const formatNotificationMessage = (
    messageKey?: string,
    variables?: Record<string, string | number>
  ): string => {
    if (!messageKey) return "";
    if (!variables) return t(messageKey) as string;

    if (messageKey === "notifications.application.updated") {
      const baseMessage = t("notifications.application.updated.base", {
        company: variables.company,
        jobTitle: variables.jobTitle,
      }) as string;
      const changes: string[] = [];
      if (
        variables.statusStart &&
        variables.statusEnd &&
        variables.statusStart !== variables.statusEnd
      ) {
        changes.push(
          t("notifications.changes.status", {
            from: variables.statusStart,
            to: variables.statusEnd,
          }) as string
        );
      }
      // ... Ajoutez vos autres logiques de 'changes' ici
      return changes.length > 0
        ? `${baseMessage}\n${changes.join("\n")}`
        : baseMessage;
    }

    return t(messageKey, variables) as string;
  };

  const formatTimestamp = (created_at: string): string => {
    if (!created_at) return t("notifications.time.unknown") as string;
    const now = new Date();
    const notificationTime = new Date(created_at);
    if (isNaN(notificationTime.getTime()))
      return t("notifications.time.unknown") as string;
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return t("notifications.time.now") as string;
    if (diffInMinutes < 60)
      return t("notifications.time.minutes", {
        minutes: diffInMinutes,
      }) as string;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return t("notifications.time.hours", { hours }) as string;
    }
    const days = Math.floor(diffInMinutes / 1440);
    return t("notifications.time.days", { days }) as string;
  };

  const filteredNotifications = getFilteredNotifications();

  if (loading && notifications.length === 0) {
    return <Loading message={t("notifications.loading") as string} />;
  }

  if (error && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>{t("notifications.errors.title") as string}</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchNotifications}>
              {t("notifications.actions.retry") as string}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-title">
            <h1>{t("notifications.title") as string}</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">
                {t("notifications.unread.badge", { count: unreadCount })}
              </span>
            )}
          </div>
          <div className="header-actions">
            <button
              className="action-button all-read"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              {t("notifications.actions.markAllRead") as string}
            </button>
            {selectedNotifications.size > 0 && (
              <button className="action-button delete" onClick={deleteSelected}>
                {t("notifications.actions.deleteSelected", {
                  count: selectedNotifications.size,
                })}
              </button>
            )}
            <button
              className="action-button refresh"
              onClick={fetchNotifications}
            >
              {t("notifications.actions.refresh") as string}
            </button>
          </div>
        </div>

        <div className="notifications-controls">
          <div className="filter-buttons">
            <button
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              {t("notifications.filters.all", { count: notifications.length })}
            </button>
            <button
              className={`filter-button ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              {t("notifications.filters.unread", { count: unreadCount })}
            </button>
            <button
              className={`filter-button ${filter === "read" ? "active" : ""}`}
              onClick={() => setFilter("read")}
            >
              {t("notifications.filters.read", {
                count: notifications.length - unreadCount,
              })}
            </button>
            <button
              className={`filter-button ${
                filter === "POSITIVE" ? "active" : ""
              }`}
              onClick={() => setFilter("POSITIVE")}
            >
              {t("notifications.filters.positive") as string}
            </button>
            <button
              className={`filter-button ${
                filter === "WARNING" ? "active" : ""
              }`}
              onClick={() => setFilter("WARNING")}
            >
              {t("notifications.filters.warning") as string}
            </button>
            <button
              className={`filter-button ${
                filter === "NEGATIVE" ? "active" : ""
              }`}
              onClick={() => setFilter("NEGATIVE")}
            >
              {t("notifications.filters.negative") as string}
            </button>
            <button
              className={`filter-button ${filter === "INFO" ? "active" : ""}`}
              onClick={() => setFilter("INFO")}
            >
              {t("notifications.filters.info") as string}
            </button>
          </div>
          {filteredNotifications.length > 0 && (
            <div className="selection-controls">
              <button className="selection-button" onClick={selectAll}>
                {t("notifications.actions.selectAll") as string}
              </button>
              <button className="selection-button" onClick={deselectAll}>
                {t("notifications.actions.deselectAll") as string}
              </button>
            </div>
          )}
        </div>

        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.type} ${
                  !notification.read ? "unread" : ""
                } ${
                  selectedNotifications.has(notification.id) ? "selected" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div
                  className="notification-checkbox"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                  />
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">
                      {notification.titleKey
                        ? t(notification.titleKey, notification.variables as Record<string, string | number>)
                        : notification.title ||
                          t("notifications.titles.application.updated")}
                    </h3>
                    <span className="notification-time">
                      {formatTimestamp(notification.createdAt)}
                    </span>
                  </div>
                  <div
                    className="notification-message"
                    dangerouslySetInnerHTML={{
                      __html: (
                        formatNotificationMessage(
                          notification.messageKey,
                          notification.variables
                        ) ||
                        notification.message ||
                        ""
                      ).replace(/\n/g, "<br>"),
                    }}
                  />
                  {notification.company && (
                    <span className="notification-company">
                      📍 {notification.company}
                    </span>
                  )}
                </div>
                <div
                  className="notification-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="notification-status">
                    {!notification.read ? (
                      <div className="unread-indicator-modern">
                        <span className="unread-dot"></span>
                        <span className="unread-text">
                          {t("notifications.status.unread") as string}
                        </span>
                      </div>
                    ) : (
                      <div className="read-indicator">
                        <span className="read-icon">✓</span>
                        <span className="read-text">
                          {t("notifications.status.read") as string}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3 className="empty-title">
                {t("notifications.empty.title") as string}
              </h3>
              <p className="empty-text">
                {filter === "all"
                  ? t("shared.empty.noNotifications")
                  : t("notifications.empty.noFilteredNotifications", {
                      filter: t(
                        `notifications.filters.${filter.toLowerCase()}`
                      ) as string,
                    })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
