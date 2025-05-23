import React from "react";
import { useNavigate } from 'react-router-dom';
import logo from '../assets/carrion_logo_crop.png';
import "../styles/Navbar.css";
import axios from 'axios';

function Navbar({ setIsAuthenticated }) {
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const handleLogout = async () => {
      try {
        await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
        setIsAuthenticated(false);
        navigate('/')
      } catch (error) {
        console.error('Error while logging out', error);
      }
    };
  return (
      <header className="topbar">
        <div className="sidebar">
          <div className="logo" onClick={() => navigate('/home')}>
            <img src={logo} alt="Carrion" className="logo-img"/>
            <span className="logo-text">CARRION</span>
          </div>
          <ul className="menu">
            <li onClick={() => navigate('/home')}>
              <span>🏠</span> Accueil
            </li>
            <li onClick={() => navigate('/dashboard')}>
              <span>📄</span> Candidatures
            </li>
            <li onClick={() => navigate('/archives')}>
              <span>📊</span> Archives
            </li>
          </ul>
        </div>

        <div className="topbar-right">
          <div className="notifications">🔔</div>
          {/* <div className="user-profile" onClick={() => navigate('/parameters')}> */}
          <div className="user-profile" onClick={() => handleLogout()}>
          <img alt="User" className="avatar" src="/path/to/avatar.jpg" />
            <span className="username">Jeremy</span>
          </div>
        </div>
      </header>
    );
}

export default Navbar;