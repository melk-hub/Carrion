import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/Providers";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carrion",
  description: "Optimisez votre recherche d'emploi avec Carrion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={geistSans.variable}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
