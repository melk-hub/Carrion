export interface NotificationContent {
  company: string;
  jobTitle: string;
}

export interface Notification {
  id: string;
  read: boolean;
  type: 'POSITIVE' | 'WARNING' | 'NEGATIVE' | 'INFO';
  createdAt: string;
  titleKey?: string;
  title?: string;
  messageKey?: string;
  message?: string;
  variables?: Record<string, NotificationContent>;
  company?: string;
}
