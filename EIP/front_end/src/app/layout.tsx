import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

import "./globals.css";

export const metadata: Metadata = {
  title: "Carrion",
  description: "Suivez vos candidatures.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
        <div id="datepicker-portal"></div>
      </body>
    </html>
  );
}
