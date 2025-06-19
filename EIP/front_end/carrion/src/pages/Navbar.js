import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../AuthContext';
import LanguageDropdown from '../components/LanguageDropdown';
import ToggleSwitch from '../components/ToogleSwitch';
import logo from '../assets/carrion_logo_crop.png';
import "../styles/Navbar.css";
import axios from 'axios';
import home from '../assets/home-button.png';
import candidature from '../assets/candidate-profile.png';
import archives from '../assets/archives.png';
import statistics from '../assets/statistics.jpg';
import bell  from "../assets/bell.png";
import avatar from "../assets/avatar.png";
import notification_icon from "../assets/notification.png";

function Navbar({ sidebarCollapsed, setSidebarCollapsed, setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { getUserDisplayName } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notification, setNotification] = useState(false);
  const dropdownRef = useRef(null);

  // Fonction pour obtenir le nom de la page actuelle
  const getCurrentPageName = () => {
    switch (location.pathname) {
      case '/home':
        return t('navbar.home');
      case '/dashboard':
        return t('navbar.applications');
      case '/archives':
        return t('navbar.archives');
      case '/profile':
        return t('navbar.profile');
      case '/settings':
        return t('navbar.settings');
      default:
        return '';
    }
  };

  // Fonction pour naviguer et remonter en haut de page
  const navigateAndScrollTop = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
      setIsAuthenticated(false);
      navigate('/')
    } catch (error) {
      console.error('Error while logging out', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <header className="navbar">
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo" onClick={() => navigateAndScrollTop('/home')}>
            <img src={logo} alt="Carrion" className="logo-img"/>
            <span className="logo-text">CARRION</span>
          </div>
        </div>
        <span className="username">
          {t('common.hello')} {getUserDisplayName()} - {getCurrentPageName()}
        </span>
        <div className="topbar-right">
          <LanguageDropdown className="dark-theme" style={{color: 'white'}}/>
          <img 
            src={notification ? notification_icon : bell} 
            alt={notification ? "Notification" : "Bell"} 
            className="menu-icon notifications" 
            style={{width: '30px', height: '30px'}} 
            onClick={() => setNotification(!notification)}
          />
          <div className="user-profile" ref={dropdownRef} onClick={handleToggleDropdown}>
            <img src={avatar} alt="User" className="avatar" />
            {isDropdownOpen && (
              <ul className="dropdown-menu">
                <li onClick={() => { navigateAndScrollTop('/profile'); setIsDropdownOpen(false); }}>{t('navbar.profile')}</li>
                <li onClick={() => { navigateAndScrollTop('/settings'); setIsDropdownOpen(false); }}>{t('navbar.settings')}</li>
                <li onClick={() => { handleLogout(); setIsDropdownOpen(false); }} style={{color: 'red'}}>{t('navbar.logout')}</li>
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <ul className="navbar-menu">
          <li onClick={() => navigateAndScrollTop('/home')} className={isActive('/home') ? 'active' : ''}>
            <img src={home} alt="Home" className="menu-icon" style={{width: '20px', height: '20px'}}/>
            <span className="menu-text">{t('navbar.home')}</span>
          </li>
          <li onClick={() => navigateAndScrollTop('/dashboard')} className={isActive('/dashboard') ? 'active' : ''}>
            <img src={candidature} alt="Candidature" className="menu-icon" style={{width: '20px', height: '20px'}}/>
            <span className="menu-text">{t('navbar.applications')}</span>
          </li>
          <li onClick={() => navigateAndScrollTop('/archives')} className={isActive('/archives') ? 'active' : ''}>
            <img src={archives} alt="Archives" className="menu-icon" style={{width: '20px', height: '20px'}}/>
            <span className="menu-text">{t('navbar.archives')}</span>
          </li>
          <li onClick={() => navigate('/statistics')} className={isActive('/statistics') ? 'active' : ''}>
            <img src={statistics} alt="Statistics" className="menu-icon" style={{width: '20px', height: '20px'}}/>
            <span className="menu-text">{t('navbar.statistics')}</span>
          </li>
        </ul>
        <div className="motion-toggle">
          <ToggleSwitch 
            isChecked={sidebarCollapsed}
            setIsChecked={toggleSidebar}
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
