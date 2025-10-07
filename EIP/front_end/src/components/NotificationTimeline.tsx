import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/NotificationTimeline.css';
import { Notification } from '@/interface/notification.interface';

const NotificationTimeline = ({ 
  notifications = [], 
  showOnlyUnread = false,
  maxItems = 5,
  className = ''
}) => {
  const { t } = useLanguage();

  // Filtrer les notifications selon les paramètres
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;
    
    if (showOnlyUnread) {
      filtered = filtered.filter((notification: Notification) => !notification.read);
    }
    
    // Trier par date (plus récent en premier)
    filtered = filtered.sort((a: Notification, b: Notification) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Limiter le nombre d'éléments
    return filtered.slice(0, maxItems);
  }, [notifications, showOnlyUnread, maxItems]);

  // Fonction pour formater le temps écoulé (identique à l'original)
  const formatTimestamp = (createdAt: string) => {
    if (!createdAt) return t('shared.time.unknown') || 'Il y a un moment';

    const now = new Date();
    const notificationTime = new Date(createdAt);

    if (isNaN(notificationTime.getTime())) {
      return t('shared.time.unknown') || 'Il y a un moment';
    }

    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return t('shared.time.now') || 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return t('shared.time.minutes', { minutes: diffInMinutes }) || `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) { // 24 heures
      const hours = Math.floor(diffInMinutes / 60);
      return t('shared.time.hoursAgo', { count: hours }) || `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return t('shared.time.daysAgo', { count: days }) || `Il y a ${days}j`;
    }
  };

  // Fonction pour obtenir l'icône selon le type (identique à l'original)
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'POSITIVE':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'NEGATIVE':
        return '❌';
      case 'INFO':
      default:
        return '📋';
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const { variables } = notification;
    
    if (variables?.company && variables?.jobTitle) {
      return `${variables.company} - ${variables.jobTitle}`;
    }
    
    if (notification.message) {
      return notification.message.length > 60 
        ? notification.message.substring(0, 60) + '...'
        : notification.message;
    }
    
    return t('notifications.message.default') || 'Notification';
  };

  // Fonction pour obtenir la classe CSS du type de notification
  const getNotificationTypeClass = (type: Notification['type']) => {
    switch (type) {
      case 'POSITIVE':
        return 'positive';
      case 'WARNING':
        return 'warning';
      case 'NEGATIVE':
        return 'negative';
      case 'INFO':
      default:
        return 'info';
    }
  };

  if (filteredNotifications.length === 0) {
    return (
      <div className={`timeline ${className}`}>
        <div className="timeline-item">
          <div className="timeline-dot info">📋</div>
          <div className="timeline-content">
            <h4>
              {showOnlyUnread 
                ? t('shared.empty.noNotifications') || 'Aucune notification non lue'
                : t('home.noActivity') || 'Aucune activité récente'
              }
            </h4>
            <p className="timeline-time">-</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`timeline ${className}`}>
      {filteredNotifications.map((notification: Notification) => (
        <div className="timeline-item" key={notification.id}>
          <div className={`timeline-dot ${getNotificationTypeClass(notification.type)}`}>
            {getNotificationIcon(notification.type)}
          </div>
          <div className="timeline-content">
            <h4>{notification.titleKey}</h4>
            <p>{getNotificationMessage(notification)}</p>
            <span className="timeline-time">
              {formatTimestamp(notification.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationTimeline; 