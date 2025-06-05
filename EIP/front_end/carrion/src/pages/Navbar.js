import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { House, FileUser, Archive, Bell, ChevronRight, ChevronLeft } from "lucide-react";
import logo from '../assets/carrion_logo_crop.png';
import "../styles/Navbar.css";
import axios from 'axios';

function Navbar({ sidebarCollapsed, setSidebarCollapsed, setIsAuthenticated }) {  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = process.env.REACT_APP_API_URL;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  return (
      <header className="navbar">
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="logo" onClick={() => navigate('/home')}>
            <img src={logo} alt="Carrion" className="logo-img"/>
            {!sidebarCollapsed && <span className="logo-text">CARRION</span>}
          </div>
          <ul className="navbar-menu">
            <li onClick={() => navigate('/home')} className={isActive('/home') ? 'active' : ''}>
              <House />
              <span className="menu-text">Accueil</span>
            </li>
            <li onClick={() => navigate('/dashboard')} className={isActive('/dashboard') ? 'active' : ''}>
              <FileUser />
              <span className="menu-text">Candidatures</span>
            </li>
            <li onClick={() => navigate('/archives')} className={isActive('/archives') ? 'active' : ''}>
              <Archive />
              <span className="menu-text">Archives</span>
            </li>
          </ul>
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {sidebarCollapsed ? (
              <ChevronRight size={24} color="white" />
            ) : (
              <ChevronLeft size={24} color="white" />
            )}
          </button>
        </div>

        <div className="corner-bg" />
        <div className="corner-curve" />

        <div className="topbar">
          <div className="notifications"><Bell /></div>

          <div className="user-profile" ref={dropdownRef} onClick={handleToggleDropdown}>
            <img alt="User" className="avatar" src="/path/to/avatar.jpg" />
            <span className="username">Jeremy</span>

          {isDropdownOpen && (
            <ul className="dropdown-menu">
              <li onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}>Mon profil</li>
              <li onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}>Paramètres</li>
              <li onClick={() => { handleLogout(); setIsDropdownOpen(false); }} style={{color: 'red'}}>Se déconnecter</li>
            </ul>
          )}
        </div>
        </div>
      </header>
    );
}

export default Navbar;
