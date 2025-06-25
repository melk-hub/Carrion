import React, { useState, useEffect } from "react";
import "../styles/Notification.css";
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState("all")
  const [selectedNotifications, setSelectedNotifications] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`${API_URL}/notifications`, {
        withCredentials: true,
      })

      setNotifications(response.data)
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la récupération des notifications")
      console.error("Erreur:", err)

      // Fallback vers des données mockées en cas d'erreur
      setNotifications([
        {
          id: 1,
          type: "success",
          title: "Candidature acceptée",
          message: "Votre candidature chez Tech Solutions a été acceptée ! Félicitations.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          company: "Tech Solutions",
        },
        {
          id: 2,
          type: "info",
          title: "Nouvelle opportunité",
          message: "Une nouvelle offre d'emploi correspond à votre profil : Développeur React Senior.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: false,
          company: "StartupXYZ",
        },
        {
          id: 3,
          type: "warning",
          title: "Entretien programmé",
          message: "Votre entretien avec Acme Corp est prévu demain à 14h00. N'oubliez pas de vous préparer.",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: true,
          company: "Acme Corp",
        },
        {
          id: 4,
          type: "error",
          title: "Candidature refusée",
          message: "Malheureusement, votre candidature chez Digital Agency n'a pas été retenue.",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          company: "Digital Agency",
        },
        {
          id: 5,
          type: "info",
          title: "Profil consulté",
          message: "Votre profil a été consulté par 3 recruteurs cette semaine.",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          company: null,
        },
        {
          id: 6,
          type: "success",
          title: "CV mis à jour",
          message: "Votre CV a été mis à jour avec succès. Il est maintenant visible par les recruteurs.",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          company: null,
        },
        {
          id: 7,
          type: "warning",
          title: "Rappel de suivi",
          message: "Il est temps de faire un suivi pour votre candidature chez Innovation Labs.",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          company: "Innovation Labs",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          withCredentials: true,
        },
      )

      // Mise à jour local
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (err) {
      console.error("Erreur lors du marquage comme lu:", err)
    }
  }

  const markAsUnread = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          withCredentials: true,
        },
      )

      // Mettre à jour l'état local
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: false } : notification)),
      )
    } catch (err) {
      console.error("Erreur lors du marquage comme non lu:", err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`, {
        withCredentials: true,
      })

      // Mise a jour local
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      setSelectedNotifications((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Marque toutes les notifications non lues comme lues
      const unreadNotifications = notifications.filter((n) => !n.read)

      const promises = unreadNotifications.map((notification) =>
        axios.patch(
          `${API_URL}/notifications/${notification.id}/read`,
          {},
          {
            withCredentials: true,
          },
        ),
      )

      await Promise.all(promises)

      // Mise a jour local
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    } catch (err) {
      console.error("Erreur lors du marquage de toutes comme lues:", err)
    }
  }

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read)
      case "read":
        return notifications.filter((n) => n.read)
      case "success":
        return notifications.filter((n) => n.type === "success")
      case "warning":
        return notifications.filter((n) => n.type === "warning")
      case "error":
        return notifications.filter((n) => n.type === "error")
      case "info":
        return notifications.filter((n) => n.type === "info")
      default:
        return notifications
    }
  }

  const deleteSelected = async () => {
    try {
      // Supprime chaque notification sélectionnée
      const deletePromises = Array.from(selectedNotifications).map((id) =>
        axios.delete(`${API_URL}/notifications/${id}`, {
          withCredentials: true,
        }),
      )

      await Promise.all(deletePromises)

      // Mise a jour local
      setNotifications((prev) => prev.filter((notification) => !selectedNotifications.has(notification.id)))
      setSelectedNotifications(new Set())
    } catch (err) {
      console.error("Erreur lors de la suppression en lot:", err)
    }
  }

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      case "info":
        return "ℹ️"
      default:
        return "📢"
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `Il y a ${hours}h`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `Il y a ${days}j`
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter((n) => !n.read).length

  // Affichage loading
  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement des notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  // Affichage erreur
  if (error && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Erreur de chargement</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchNotifications}>
              Réessayer
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
            <h1>Notifications</h1>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount} non lues</span>}
          </div>

          <div className="header-actions">
            <button className="action-button" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Tout marquer comme lu
            </button>
            {selectedNotifications.size > 0 && (
              <button className="action-button delete" onClick={deleteSelected}>
                Supprimer sélectionnées ({selectedNotifications.size})
              </button>
            )}
            <button className="action-button refresh" onClick={fetchNotifications}>
              🔄 Actualiser
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
              Toutes ({notifications.length})
            </button>
            <button
              className={`filter-button ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Non lues ({unreadCount})
            </button>
            <button className={`filter-button ${filter === "read" ? "active" : ""}`} onClick={() => setFilter("read")}>
              Lues ({notifications.length - unreadCount})
            </button>
            <button
              className={`filter-button ${filter === "success" ? "active" : ""}`}
              onClick={() => setFilter("success")}
            >
              Succès
            </button>
            <button
              className={`filter-button ${filter === "warning" ? "active" : ""}`}
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
            <button className={`filter-button ${filter === "info" ? "active" : ""}`} onClick={() => setFilter("info")}>
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
                className={`notification-item ${notification.type} ${!notification.read ? "unread" : ""} ${selectedNotifications.has(notification.id) ? "selected" : ""}`}
              >
                <div className="notification-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                  />
                </div>

                <div className="notification-icon">{getNotificationIcon(notification.type)}</div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
                  </div>

                  <p className="notification-message">{notification.message}</p>

                  {notification.company && <span className="notification-company">📍 {notification.company}</span>}
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
                  : `Aucune notification ${filter === "unread" ? "non lue" : filter} trouvée.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
