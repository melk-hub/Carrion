export interface Notification {
  id: string;
  read: boolean;
  type: "POSITIVE" | "WARNING" | "NEGATIVE" | "INFO";
  createdAt: string;
  titleKey?: string;
  title?: string;
  messageKey?: string;
  message?: string;
  variables?: Record<string, string | number>;
  company?: string;
}
