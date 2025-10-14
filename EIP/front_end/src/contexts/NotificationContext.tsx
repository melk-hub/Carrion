"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import apiService from '@/services/api';
import { Notification } from '@/interface/notification.interface';
import { useAuth } from './AuthContext'; // Importation cruciale pour connaître l'état de connexion

// --- Définition des types ---
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

// --- Création du Contexte ---
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- Hook personnalisé pour une utilisation facile ---
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// --- Props du Provider ---
interface NotificationProviderProps {
  children: ReactNode;
}

// --- Le Composant Provider ---
export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  // On utilise le AuthContext pour savoir si l'utilisateur est connecté.
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false); // L'état initial est `false`
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    // Condition de garde : Si l'utilisateur n'est pas authentifié, on ne fait RIEN.
    if (!isAuthenticated) {
      setNotifications([]); // On s'assure que les notifications sont vides
      setUnreadCount(0);
      setLoading(false); // On s'assure que le chargement est terminé
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // apiService.get peut retourner `Notification[]` ou `null`
      const data = await apiService.get<Notification[]>('/notifications');
      
      if (data) { // On vérifie que les données ne sont pas nulles
        const sortedData = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(sortedData);
        setUnreadCount(sortedData.filter(n => !n.read).length);
      } else {
        // Si data est null (ex: échec silencieux de la session), on vide l'état
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]); // `isAuthenticated` est maintenant une dépendance

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiService.patch(`/notifications/${notificationId}/read`, {});
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.post('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await apiService.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Optionnel: recalculer unreadCount si besoin
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  }, []);

  useEffect(() => {
    // Cet effet se déclenchera à chaque fois que `isAuthenticated` change
    // (connexion ou déconnexion), ainsi qu'au premier chargement.
    fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }), [notifications, unreadCount, loading, error, fetchNotifications, markAsRead, markAllAsRead, deleteNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};