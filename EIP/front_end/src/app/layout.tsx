import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

import "./globals.css";
import { AuthModalProvider } from "@/contexts/AuthModalContext";

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
						<AuthModalProvider>
							<NotificationProvider>{children}</NotificationProvider>
						</AuthModalProvider>
					</LanguageProvider>
				</AuthProvider>
				<div id="datepicker-portal"></div>
			</body>
		</html>
	);
}
