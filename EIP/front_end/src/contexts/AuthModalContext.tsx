"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import AuthModal from "@/components/AuthModal/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthModalContextType {
	openAuthModal: (tab?: 'login' | 'register', email?: string) => void;
	closeAuthModal: () => void;
	isOpen: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
	const [prefilledEmail, setPrefilledEmail] = useState<string | undefined>(undefined);

	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const { checkAuthStatus } = useAuth();
	const { t } = useLanguage();


	useEffect(() => {
		const authParam = searchParams.get("auth");
		if (authParam === "signin") {
			setActiveTab("login");
			setIsOpen(true);
		} else if (authParam === "signup") {
			setActiveTab("register");
			setIsOpen(true);
		}
	}, [searchParams]);

	const openAuthModal = (tab: 'login' | 'register' = 'login', email?: string) => {
		setActiveTab(tab);
		if (email) setPrefilledEmail(email);
		setIsOpen(true);
	};

	const closeAuthModal = () => {
		setIsOpen(false);
		setPrefilledEmail(undefined);

		if (searchParams.get("auth")) {
			const newParams = new URLSearchParams(searchParams.toString());
			newParams.delete("auth");
			router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
		}
	};

	const handleSuccess = async () => {
		closeAuthModal();
		await checkAuthStatus();
		toast.success(t("auth.loginSuccess") as string);
	};

	return (
		<AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isOpen }}>
			{children}

			<AuthModal
				isOpen={isOpen}
				onClose={closeAuthModal}
				defaultTab={activeTab}
				invitedEmail={prefilledEmail}
				onSuccess={handleSuccess}
			/>
		</AuthModalContext.Provider>
	);
}

export const useAuthModal = () => {
	const context = useContext(AuthModalContext);
	if (!context) {
		throw new Error("useAuthModal must be used within an AuthModalProvider");
	}
	return context;
};