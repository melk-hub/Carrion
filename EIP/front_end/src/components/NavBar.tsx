"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import ApiService from "@/services/api";
import LanguageDropdown from "./LanguageDropdown";
import ToggleSwitch from "./ToogleSwitch";

import Image from "next/image";

interface NavbarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

function Navbar({
  sidebarCollapsed,
  setSidebarCollapsed,
  setIsAuthenticated,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { unreadCount, fetchNotifications } = useNotifications();
  const { getUserDisplayName } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const getCurrentPageName = () => {
    const pageKey = pathname.substring(1) || "home";
    return t(`navbar.${pageKey}`);
  };

  const handleLogout = async () => {
    try {
      await ApiService.get(`/auth/logout`); // Assumant qu'ApiService utilise déjà l'URL de base et withCredentials
      setIsAuthenticated(false);
      router.push("/");
    } catch (error) {
      console.error("Error while logging out", error);
    }
  };

  const isActive = (path: string) => pathname === path;

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

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const res = await ApiService.get(`/s3/download?filename=profile`);
        if (res instanceof Response) {
          const { signedUrl } = await res.json();
          if (signedUrl) setUploadedImage(signedUrl);
        }
      } catch (error) {
        console.error("Failed to load profile picture", error);
      }
    };
    fetchProfilePicture();
  }, [getUserDisplayName]);

  const handleToggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <header className="navbar">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/home" className="logo">
            <Image
              src="/assets/carrion_logo_crop.png"
              alt="Carrion"
              className="logo-img"
              width={40}
              height={40}
              priority
            />
            <span className="logo-text">CARRION</span>
          </Link>
        </div>
        <span className="username">
          {t("common.hello")} {getUserDisplayName()} - {getCurrentPageName()}
        </span>
        <div className="topbar-right">
          <LanguageDropdown className="dark-theme" style={{ color: "white" }} />
          <div
            className="user-profile"
            ref={dropdownRef}
            onClick={handleToggleDropdown}
          >
            <Image
              src={uploadedImage || "/assets/avatar.png"}
              alt="User Avatar"
              className="avatar"
              width={40}
              height={40}
            />
            {isDropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {t("navbar.profile")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {t("navbar.settings")}
                  </Link>
                </li>
                <li
                  onClick={handleLogout}
                  style={{ color: "red", cursor: "pointer" }}
                >
                  {t("navbar.logout")}
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <ul className="navbar-menu">
          <li className={isActive("/home") ? "active" : ""}>
            <Link href="/home">
              <div className="tooltip">
                <Image
                  src="/assets/home-button.png"
                  alt="Home"
                  className="menu-icon"
                  width={20}
                  height={20}
                />
                {sidebarCollapsed && (
                  <span className="tooltip-text">{t("navbar.home")}</span>
                )}
              </div>
              <span className="menu-text">{t("navbar.home")}</span>
            </Link>
          </li>
          <li className={isActive("/dashboard") ? "active" : ""}>
            <Link href="/dashboard">
              <div className="tooltip">
                <Image
                  src="/assets/candidate-profile.png"
                  alt="Candidature"
                  className="menu-icon"
                  width={20}
                  height={20}
                />
                {sidebarCollapsed && (
                  <span className="tooltip-text">
                    {t("navbar.applications")}
                  </span>
                )}
              </div>
              <span className="menu-text">{t("navbar.applications")}</span>
            </Link>
          </li>
          <li className={isActive("/archives") ? "active" : ""}>
            <Link href="/archives">
              <div className="tooltip">
                <Image
                  src="/assets/archives.png"
                  alt="Archives"
                  className="menu-icon"
                  width={20}
                  height={20}
                />
                {sidebarCollapsed && (
                  <span className="tooltip-text">{t("navbar.archives")}</span>
                )}
              </div>
              <span className="menu-text">{t("navbar.archives")}</span>
            </Link>
          </li>
          <li className={isActive("/statistics") ? "active" : ""}>
            <Link href="/statistics">
              <div className="tooltip">
                <Image
                  src="/assets/pie-chart.png"
                  alt="Statistics"
                  className="menu-icon"
                  width={20}
                  height={20}
                />
                {sidebarCollapsed && (
                  <span className="tooltip-text">{t("navbar.statistics")}</span>
                )}
              </div>
              <span className="menu-text">{t("navbar.statistics")}</span>
            </Link>
          </li>
          <li className={isActive("/leaderboard") ? "active" : ""}>
            <Link href="/leaderboard">
              <div className="tooltip">
                <Image
                  src="/assets/progression_landing.png"
                  alt="Leaderboard"
                  className="menu-icon"
                  width={20}
                  height={20}
                />
                {sidebarCollapsed && (
                  <span className="tooltip-text">{t("navbar.ranking")}</span>
                )}
              </div>
              <span className="menu-text">{t("navbar.ranking")}</span>
            </Link>
          </li>
          <li className={isActive("/notification") ? "active" : ""}>
            <Link href="/notification">
              <div
                className="tooltip notifications"
                style={{ position: "relative" }}
              >
                <Image
                  src={unreadCount > 0 ? "/assets/notification-icon.png" : "/assets/bell.png"}
                  alt={unreadCount > 0 ? "Notification" : "Bell"}
                  className={`menu-icon notifications ${
                    unreadCount > 0 ? "has-unread" : ""
                  }`}
                  width={25}
                  height={25}
                />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {sidebarCollapsed && (
                  <span className="tooltip-text">
                    {t("navbar.notification")}
                  </span>
                )}
              </div>
              <span className="menu-text">{t("navbar.notification")}</span>
            </Link>
          </li>
        </ul>
        <div className="motion-toggle">
          <ToggleSwitch
            isChecked={sidebarCollapsed}
            setIsChecked={toggleSidebar}
          />
        </div>
      </div>
      <div className="corner-bg" />
      <div className="corner-curve" />
    </header>
  );
}

export default Navbar;
