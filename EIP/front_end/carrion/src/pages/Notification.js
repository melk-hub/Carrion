import React, { useState, useEffect } from "react";
import "../styles/Notification.css";
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import Loading from "../components/Loading";

function Notifications() {
  const { t } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification
  } = useNotifications();
  
  const [filter, setFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    // Rafraîchir les notifications quand on arrive sur la page
    fetchNotifications();
  }, []);

  const getFilteredNotifications = () => {
    let filtered = [];
    
    switch (filter) {
      case "unread":
        filtered = notifications.filter((n) => !n.read)
        break;
      case "read":
        filtered = notifications.filter((n) => n.read)
        break;
      case "POSITIVE":
        filtered = notifications.filter((n) => n.type === "POSITIVE")
        break;
      case "WARNING":
        filtered = notifications.filter((n) => n.type === "WARNING")
        break;
      case "NEGATIVE":
        filtered = notifications.filter((n) => n.type === "NEGATIVE")
        break;
      case "INFO":
        filtered = notifications.filter((n) => n.type === "INFO")
        break;
      default:
        filtered = notifications
    }

    // Trier par statut (non lues en premier) puis par date (plus récent en premier)
    return filtered.sort((a, b) => {
      // D'abord trier par statut de lecture (non lues en premier)
      if (a.read !== b.read) {
        return a.read ? 1 : -1; // Les non lues (read=false) viennent en premier
      }
      // Puis trier par date (plus récent en premier)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  const deleteSelected = async () => {
    try {
      // Supprime chaque notification sélectionnée en utilisant le contexte
      const deletePromises = Array.from(selectedNotifications).map((id) =>
        deleteNotification(id)
      );

      await Promise.all(deletePromises);
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error("Erreur lors de la suppression en lot:", err);
    }
  };

  const toggleSelection = (id) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAll = () => {
    const filteredNotifications = getFilteredNotifications()
    setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)))
  }

  const deselectAll = () => {
    setSelectedNotifications(new Set())
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const formatNotificationMessage = (messageKey, variables = {}) => {
    if (!messageKey) return '';
    
    if (messageKey === 'notifications.application.updated') {
      const baseMessage = t('notifications.application.updated.base', { company: variables.company, jobTitle: variables.jobTitle });
      
      const changes = [];
      
      if (variables.statusStart && variables.statusEnd && variables.statusStart !== variables.statusEnd) {
        const statusStart = variables.statusStart;
        const statusEnd = variables.statusEnd;
        changes.push(t('notifications.changes.status', { from: statusStart, to: statusEnd }));
      }
      
      if (variables.locationStart && variables.locationEnd && variables.locationStart !== variables.locationEnd) {
        const locationStart = variables.locationStart.startsWith('notifications.') 
          ? t(variables.locationStart) 
          : variables.locationStart;
        const locationEnd = variables.locationEnd;
        changes.push(t('notifications.changes.location', { from: locationStart, to: locationEnd }));
      }
      
      if (variables.salaryStart && variables.salaryEnd && variables.salaryStart !== variables.salaryEnd) {
        const salaryStart = variables.salaryStart === 'notifications.noSalary' 
          ? t('notifications.noSalary') 
          : `${variables.salaryStart}€`;
        const salaryEnd = variables.salaryEnd === 'notifications.noSalary' 
          ? t('notifications.noSalary') 
          : `${variables.salaryEnd}€`;
        changes.push(t('notifications.changes.salary', { from: salaryStart, to: salaryEnd }));
      }
      
      if (variables.contractTypeStart && variables.contractTypeEnd && variables.contractTypeStart !== variables.contractTypeEnd) {
        const contractTypeStart = variables.contractTypeStart.startsWith('notifications.') 
          ? t(variables.contractTypeStart) 
          : variables.contractTypeStart;
        const contractTypeEnd = variables.contractTypeEnd;
        changes.push(t('notifications.changes.contractType', { from: contractTypeStart, to: contractTypeEnd }));
      }
      
      if (variables.interviewStart && variables.interviewEnd && variables.interviewStart !== variables.interviewEnd) {
        const interviewStart = variables.interviewStart === 'notifications.noInterview' 
          ? t('notifications.noInterview') 
          : variables.interviewStart;
        const interviewEnd = variables.interviewEnd;
        changes.push(t('notifications.changes.interview', { from: interviewStart, to: interviewEnd }));
      }
      
      if (variables.titleStart && variables.titleEnd && variables.titleStart !== variables.titleEnd) {
        changes.push(t('notifications.changes.title', { from: variables.titleStart, to: variables.titleEnd }));
      }
      
      if (variables.companyStart && variables.companyEnd && variables.companyStart !== variables.companyEnd) {
        changes.push(t('notifications.changes.company', { from: variables.companyStart, to: variables.companyEnd }));
      }
      
      if (changes.length > 0) {
        return `${baseMessage}\n${changes.join('\n')}`;
      } else {
        return baseMessage;
      }
    }
    
    // Pour les autres messages, utiliser la traduction normale
    return t(messageKey, variables);
  };

  const formatTimestamp = (created_at) => {
    if (!created_at) return t('notifications.time.unknown');
    
    const now = new Date()
    const notificationTime = new Date(created_at)
    
    // Vérifier si la date est valide
    if (isNaN(notificationTime.getTime())) {
      return t('notifications.time.unknown');
    }
    
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))

    if (diffInMinutes < 1) {
      return t('notifications.time.now')
    } else if (diffInMinutes < 60) {
      return t('notifications.time.minutes', { minutes: diffInMinutes })
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return t('notifications.time.hours', { hours })
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return t('notifications.time.days', { days })
    }
  }

  const filteredNotifications = getFilteredNotifications()

  // Affichage loading
  if (loading) {
    return <Loading message={t('notifications.loading')} />
  }

  // Affichage erreur
  if (error && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>{t('notifications.errors.title')}</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchNotifications}>
              {t('notifications.actions.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-title">
            <h1>{t('notifications.title')}</h1>
            {unreadCount > 0 && <span className="unread-badge">{t('notifications.unread.badge', { count: unreadCount })}</span>}
          </div>

          <div className="header-actions">
            <button className="action-button all-read" onClick={markAllAsRead} disabled={unreadCount === 0}>
              {t('notifications.actions.markAllRead')}
            </button>
            {selectedNotifications.size > 0 && (
              <button className="action-button delete" onClick={deleteSelected}>
                {t('notifications.actions.deleteSelected', { count: selectedNotifications.size })}
              </button>
            )}
            <button className="action-button refresh" onClick={fetchNotifications}>
              {t('notifications.actions.refresh')}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="notifications-controls">
          <div className="filter-buttons">
            <button className={`filter-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              {t('notifications.filters.all', { count: notifications.length })}
            </button>
            <button
              className={`filter-button ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              {t('notifications.filters.unread', { count: unreadCount })}
            </button>
            <button className={`filter-button ${filter === "read" ? "active" : ""}`} onClick={() => setFilter("read")}>
              {t('notifications.filters.read', { count: notifications.length - unreadCount })}
            </button>
            <button
              className={`filter-button ${filter === "POSITIVE" ? "active" : ""}`}
              onClick={() => setFilter("POSITIVE")}
            >
              {t('notifications.filters.positive')}
            </button>
            <button
              className={`filter-button ${filter === "WARNING" ? "active" : ""}`}
              onClick={() => setFilter("WARNING")}
            >
              {t('notifications.filters.warning')}
            </button>
            <button
              className={`filter-button ${filter === "NEGATIVE" ? "active" : ""}`}
              onClick={() => setFilter("NEGATIVE")}
            >
              {t('notifications.filters.negative')}
            </button>
            <button className={`filter-button ${filter === "INFO" ? "active" : ""}`} onClick={() => setFilter("INFO")}>
              {t('notifications.filters.info')}
            </button>
          </div>

          {filteredNotifications.length > 0 && (
            <div className="selection-controls">
              <button className="selection-button" onClick={selectAll}>
                {t('notifications.actions.selectAll')}
              </button>
              <button className="selection-button" onClick={deselectAll}>
                {t('notifications.actions.deselectAll')}
              </button>
            </div>
          )}
        </div>

        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.type} ${!notification.read ? "unread" : ""} ${selectedNotifications.has(notification.id) ? "selected" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-checkbox" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                  />
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{
                      notification.titleKey 
                        ? t(notification.titleKey, notification.variables || {})
                        : notification.title || t('notifications.titles.application.updated')
                    }</h3>
                    <span className="notification-time">{formatTimestamp(notification.createdAt)}</span>
                  </div>

                  <div 
                    className="notification-message"
                    dangerouslySetInnerHTML={{
                      __html: (notification.messageKey 
                        ? formatNotificationMessage(notification.messageKey, notification.variables || {})
                        : notification.message || ''
                      ).replace(/\n/g, '<br>')
                    }}
                  />

                  {notification.company && <span className="notification-company">📍 {notification.company}</span>}
                </div>

                <div className="notification-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="notification-status">
                    {!notification.read ? (
                      <div className="unread-indicator-modern">
                        <span className="unread-dot"></span>
                        <span className="unread-text">{t('notifications.status.unread')}</span>
                      </div>
                    ) : (
                      <div className="read-indicator">
                        <span className="read-icon">✓</span>
                        <span className="read-text">{t('notifications.status.read')}</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3 className="empty-title">{t('notifications.empty.title')}</h3>
              <p className="empty-text">
                {filter === "all"
                  ? t('notifications.empty.noNotifications')
                  : t('notifications.empty.noFilteredNotifications', { filter: t(`notifications.filters.${filter.toLowerCase()}`) })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
