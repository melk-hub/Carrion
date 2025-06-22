import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageDropdown from '../components/LanguageDropdown';
import ToggleSwitch from '../components/ToogleSwitch';
import logo from '../assets/carrion_logo_crop.png';
import "../styles/Navbar.css";
import axios from 'axios';
import home from '../assets/home-button.png';
import candidature from '../assets/candidate-profile.png';
import archives from '../assets/archives.png';
import bell  from "../assets/bell.png";
import avatar from "../assets/avatar.png";
import notification_icon from "../assets/notification.png";
// import ReduceMotionToggle from '../components/ToogleSwitch';

function Navbar({ sidebarCollapsed, setSidebarCollapsed, setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const API_URL = process.env.REACT_APP_API_URL;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [notification, setNotification] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    toggleSidebar();
  }, [reduceMotion]);

  return (
    <header className="navbar">
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo" onClick={() => navigate('/home')}>
            <img src={logo} alt="Carrion" className="logo-img"/>
            <span className="logo-text">CARRION</span>
          </div>
        </div>
        <span className="username">{t('common.hello')} Jeremy Smith</span>
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
                <li onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}>{t('navbar.profile')}</li>
                <li onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}>{t('navbar.settings')}</li>
                <li onClick={() => { handleLogout(); setIsDropdownOpen(false); }} style={{color: 'red'}}>{t('navbar.logout')}</li>
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <ul className="navbar-menu">
          <li onClick={() => navigate('/home')} className={isActive('/home') ? 'active' : ''}>
            <img src={home} alt="Home" className="menu-icon" style={{width: '20px', height: '20px'}}/>
            <span className="menu-text">{t('navbar.home')}</span>
          </li>
          <li onClick={() => navigate('/dashboard')} className={isActive('/dashboard') ? 'active' : ''}>
            <img src={candidature} alt="Candidature" className="menu-icon" style={{width: '20px', height: '20px'}}/>
            <span className="menu-text">{t('navbar.applications')}</span>
          </li>
          <li onClick={() => navigate('/archives')} className={isActive('/archives') ? 'active' : ''}>
            <img src={archives} alt="Archives" className="menu-icon" style={{width: '20px', height: '20px'}}/>
            <span className="menu-text">{t('navbar.archives')}</span>
          </li>
        </ul>
        <div className="motion-toggle">
          <ToggleSwitch 
            isChecked={reduceMotion}
            setIsChecked={setReduceMotion}
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
