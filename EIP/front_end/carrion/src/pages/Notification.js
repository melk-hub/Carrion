import React, { useState, useEffect } from "react";
import "../styles/Notification.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  useEffect(() => {
    // données de notifications pour test
    const mockNotifications = [
      {
        id: 1,
        type: "success",
        title: "Candidature acceptée",
        message:
          "Votre candidature chez Tech Solutions a été acceptée ! Félicitations.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
        read: false,
        company: "Tech Solutions",
      },
      {
        id: 2,
        type: "info",
        title: "Nouvelle opportunité",
        message:
          "Une nouvelle offre d'emploi correspond à votre profil : Développeur React Senior.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
        read: false,
        company: "StartupXYZ",
      },
      {
        id: 3,
        type: "warning",
        title: "Entretien programmé",
        message:
          "Votre entretien avec Acme Corp est prévu demain à 14h00. N'oubliez pas de vous préparer.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
        read: true,
        company: "Acme Corp",
      },
      {
        id: 4,
        type: "error",
        title: "Candidature refusée",
        message:
          "Malheureusement, votre candidature chez Digital Agency n'a pas été retenue.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        read: true,
        company: "Digital Agency",
      },
      {
        id: 5,
        type: "info",
        title: "Profil consulté",
        message: "Votre profil a été consulté par 3 recruteurs cette semaine.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        read: false,
        company: null,
      },
      {
        id: 6,
        type: "success",
        title: "CV mis à jour",
        message:
          "Votre CV a été mis à jour avec succès. Il est maintenant visible par les recruteurs.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        read: true,
        company: null,
      },
      {
        id: 7,
        type: "warning",
        title: "Rappel de suivi",
        message:
          "Il est temps de faire un suivi pour votre candidature chez Innovation Labs.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        read: false,
        company: "Innovation Labs",
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "read":
        return notifications.filter((n) => n.read);
      case "success":
        return notifications.filter((n) => n.type === "success");
      case "warning":
        return notifications.filter((n) => n.type === "warning");
      case "error":
        return notifications.filter((n) => n.type === "error");
      case "info":
        return notifications.filter((n) => n.type === "info");
      default:
        return notifications;
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAsUnread = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: false } : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteSelected = () => {
    setNotifications((prev) =>
      prev.filter((notification) => !selectedNotifications.has(notification.id))
    );
    setSelectedNotifications(new Set());
  };

  const toggleSelection = (id) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const filteredNotifications = getFilteredNotifications();
    setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
  };

  const deselectAll = () => {
    setSelectedNotifications(new Set());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days}j`;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-title">
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} non lues</span>
            )}
          </div>

          <div className="header-actions">
            <button className="action-button" onClick={markAllAsRead}>
              Tout marquer comme lu
            </button>
            {selectedNotifications.size > 0 && (
              <button className="action-button delete" onClick={deleteSelected}>
                Supprimer sélectionnées ({selectedNotifications.size})
              </button>
            )}
          </div>
        </div>

        <div className="notifications-controls">
          <div className="filter-buttons">
            <button
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Toutes ({notifications.length})
            </button>
            <button
              className={`filter-button ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Non lues ({unreadCount})
            </button>
            <button
              className={`filter-button ${filter === "read" ? "active" : ""}`}
              onClick={() => setFilter("read")}
            >
              Lues ({notifications.length - unreadCount})
            </button>
            <button
              className={`filter-button ${
                filter === "success" ? "active" : ""
              }`}
              onClick={() => setFilter("success")}
            >
              Succès
            </button>
            <button
              className={`filter-button ${
                filter === "warning" ? "active" : ""
              }`}
              onClick={() => setFilter("warning")}
            >
              Avertissements
            </button>
            <button
              className={`filter-button ${filter === "error" ? "active" : ""}`}
              onClick={() => setFilter("error")}
            >
              Erreurs
            </button>
            <button
              className={`filter-button ${filter === "info" ? "active" : ""}`}
              onClick={() => setFilter("info")}
            >
              Infos
            </button>
          </div>

          {filteredNotifications.length > 0 && (
            <div className="selection-controls">
              <button className="selection-button" onClick={selectAll}>
                Tout sélectionner
              </button>
              <button className="selection-button" onClick={deselectAll}>
                Tout désélectionner
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
              >
                <div className="notification-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                  />
                </div>

                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>

                  <p className="notification-message">{notification.message}</p>

                  {notification.company && (
                    <span className="notification-company">
                      📍 {notification.company}
                    </span>
                  )}
                </div>

                <div className="notification-actions">
                  {!notification.read ? (
                    <button
                      className="notification-action-button"
                      onClick={() => markAsRead(notification.id)}
                      title="Marquer comme lu"
                    >
                      👁️
                    </button>
                  ) : (
                    <button
                      className="notification-action-button"
                      onClick={() => markAsUnread(notification.id)}
                      title="Marquer comme non lu"
                    >
                      👁️‍🗨️
                    </button>
                  )}

                  <button
                    className="notification-action-button delete"
                    onClick={() => deleteNotification(notification.id)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>

                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3 className="empty-title">Aucune notification</h3>
              <p className="empty-text">
                {filter === "all"
                  ? "Vous n'avez aucune notification pour le moment."
                  : `Aucune notification ${
                      filter === "unread" ? "non lue" : filter
                    } trouvée.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
