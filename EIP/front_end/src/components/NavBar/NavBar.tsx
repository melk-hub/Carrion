"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import ApiService from "@/services/api";
import LanguageDropdown from "@/components/LanguageDropdown/LanguageDropdown";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import SubscriptionModal from "@/components/SubscriptionModal/SubscriptionModal";
import styles from "./NavBar.module.css";

export default function Navbar({ children }: { children: React.ReactNode }) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const { setIsAuthenticated, organizationMemberInfo, userProfile } = useAuth();

	const router = useRouter();
	const pathname = usePathname();
	const { t } = useLanguage();
	const { unreadCount } = useNotifications();

	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [avatarUrl, setAvatarUrl] = useState("/assets/avatar.png");

	useEffect(() => {
		const fetchSafeAvatarUrl = async () => {
			const rawPath = userProfile?.userProfile?.imageUrl;

			if (!rawPath) {
				setAvatarUrl("/assets/avatar.png");
				return;
			}

			if (!rawPath.startsWith("http")) {
				try {
					const response = await ApiService.get<{ signedUrl: string }>(
						"/s3/download?filename=profile"
					);
					if (response?.signedUrl) {
						setAvatarUrl(response.signedUrl);
					} else {
						setAvatarUrl("/assets/avatar.png");
					}
				} catch (error) {
					console.error("Erreur lors de la récupération de l'URL signée de l'avatar", error);
					setAvatarUrl("/assets/avatar.png");
				}
			} else {
				setAvatarUrl(rawPath);
			}
		};

		fetchSafeAvatarUrl();
	}, [userProfile])

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		try {
			await ApiService.get(`/auth/logout`);
			setIsAuthenticated(false);
			router.push("/");
		} catch (error) {
			console.error("Error during logout", error);
		}
	};

	const navLinks = useMemo(() => {
		const links = [
			{ href: "/home", labelKey: "home", icon: "/assets/home-button.png" },
			{
				href: "/dashboard",
				labelKey: "applications",
				icon: "/assets/candidate-profile.png",
			},
			{ href: "/archives", labelKey: "archives", icon: "/assets/archives.png" },
			{
				href: "/statistics",
				labelKey: "statistics",
				icon: "/assets/pie-chart.png",
			},
			{
				href: "/leaderboard",
				labelKey: "ranking",
				icon: "/assets/podium.png",
			},
		];

		if (organizationMemberInfo) {
			links.push({
				href: "/organization",
				labelKey: "organization",
				icon: "/assets/organization.png",
			});
		}

		return links;
	}, [organizationMemberInfo]);

	return (
		<div className={`${styles.dashboardContainer} ${sidebarCollapsed ? styles.collapsed : ""}`}>
			<header className={styles.topbar}>
				<div className={styles.topbarLeft}>
					<div className={styles.logo}>
						<Image
							src="/assets/carrion_logo_crop.png"
							alt="Logo"
							width={40}
							height={40}
							priority
							className={styles.logoImg}
						/>
						<span className={styles.logoText}>CARRION</span>
					</div>
				</div>
				<div className={styles.topbarRight}>
					<LanguageDropdown style={{ color: "white" }} />
					<div className={styles.userProfile} ref={dropdownRef}>
						<Image
							src={avatarUrl}
							alt="Avatar"
							width={40}
							height={40}
							className={styles.avatar}
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						/>
						{isDropdownOpen && (
							<ul className={styles.dropdownMenu}>
								<li onClick={() => { router.push("/profile"); setIsDropdownOpen(false); }}>
									{t("navbar.profile")}
								</li>
								<li onClick={() => { router.push("/settings"); setIsDropdownOpen(false); }}>
									{t("navbar.settings")}
								</li>
								<li onClick={handleLogout} style={{ color: "#ef4444" }}>
									{t("navbar.logout")}
								</li>
							</ul>
						)}
					</div>
				</div>
			</header>

			<aside
				className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""
					}`}
			>
				<div>
					<ul className={styles.navbarMenu}>
						{navLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className={`${styles.navLink} ${pathname === link.href ? styles.active : ""
										}`}
								>
									<Image
										src={link.icon}
										alt={t(`navbar.${link.labelKey}`) as string}
										width={24}
										height={24}
										className={styles.menuIcon}
									/>
									<span className={styles.menuText}>
										{t(`navbar.${link.labelKey}`)}
									</span>
									<span className={styles.tooltipText}>
										{t(`navbar.${link.labelKey}`)}
									</span>
								</Link>
							</li>
						))}
						<li>
							<Link
								href="/notification"
								className={`${styles.navLink} ${pathname === "/notification" ? styles.active : ""
									}`}
							>
								<div className={styles.notifications}>
									<Image
										src="/assets/bell.png"
										alt="Notifications"
										width={24}
										height={24}
										className={styles.menuIcon}
									/>
									{unreadCount > 0 && (
										<span className={styles.notificationBadge}>
											{unreadCount}
										</span>
									)}
								</div>
								<span className={styles.menuText}>
									{t("navbar.notification")}
								</span>
								<span className={styles.tooltipText}>
									{t("navbar.notification")}
								</span>
							</Link>
						</li>
					</ul>
				</div>
				<div className={styles.motionToggle}>
					<ToggleSwitch
						isChecked={sidebarCollapsed}
						setIsChecked={setSidebarCollapsed}
					/>
				</div>
			</aside>

			<main
				className={`${styles.content} ${sidebarCollapsed ? styles.collapsed : ""
					}`}
			>
				{children}
			</main>
		</div>
	);
}