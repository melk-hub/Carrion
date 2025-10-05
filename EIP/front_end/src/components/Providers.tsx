"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}