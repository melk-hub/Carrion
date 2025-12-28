"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import apiService from "@/services/api";
import { Notification } from "@/interface/notification.interface";
import { useAuth } from "./AuthContext";

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

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiService.get<Notification[]>("/notifications");

      if (data) {
        const sortedData = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sortedData);
        setUnreadCount(sortedData.filter((n) => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err: unknown) {
      // Le service API gère déjà les erreurs réseau silencieusement
      // Cette catch ne devrait normalement pas être atteint pour les erreurs réseau
      // mais on le garde pour les autres types d'erreurs
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch notifications";
      // Ne définir l'erreur que si ce n'est pas une erreur réseau
      if (!errorMessage.includes("Network error")) {
        setError(errorMessage);
      } else {
        // Pour les erreurs réseau, juste logger et ne pas afficher d'erreur à l'utilisateur
        console.warn("Network error fetching notifications (backend may be down)");
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiService.patch(`/notifications/${notificationId}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      console.log("Methode à fix dans le future");
      // TODO Methode à faire dans le back quand j'aurai le temps parce que la version pré-migration HORRIBLE
      // await apiService.post('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await apiService.delete(`/notifications/${notificationId}`, {});
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
