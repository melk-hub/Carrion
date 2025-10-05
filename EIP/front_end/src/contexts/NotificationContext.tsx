"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import apiService from '@/services/api';
import { Notification } from '@/interface/notification.interface';

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

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.get<Notification[]>('/notification');
      const sortedData = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(sortedData);
      setUnreadCount(sortedData.filter(n => !n.read).length);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ... (Les autres fonctions markAsRead, markAllAsRead, deleteNotification restent les mêmes)
  const markAsRead = useCallback(async (notificationId: string) => { /* ... */ }, []);
  const markAllAsRead = useCallback(async () => { /* ... */ }, []);
  const deleteNotification = useCallback(async (notificationId: string) => { /* ... */ }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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