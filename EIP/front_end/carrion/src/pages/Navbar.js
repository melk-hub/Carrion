import React from "react";
import { useNavigate } from 'react-router-dom';
import logo from '../assets/carrion_logo_crop.png';
import "../styles/Navbar.css";

function Navbar() {
    const navigate = useNavigate();
  return (
      <div className="layout">
      <header className="topbar">
        <div className="notifications">
          <span className="bell">🔔</span>
        </div>
        <div className="user-profile" onClick={() => navigate('/parameters')}>
          <img alt="User" className="avatar" />
          <span className="username">Jeremy</span>
        </div>
      </header>
  
      <div className="layout-body">
        <nav className={`sidebar`}>
        <div className="logo">
          <span className="icon" onClick={() => navigate('/home')}>
            <img src={logo} alt="Carrion" className="logo-img"/>
            <span className="logo-text">CARRION</span>
          </span>
        </div>
          <ul className="menu">
            <li onClick={() => navigate('/home')}>
              <span>🏠</span> {"Accueil"}
            </li>
            <li onClick={() => navigate('/dashboard')}>
              <span>📄</span> {"Candidatures"}
            </li>
            <li onClick={() => navigate('/archives')}>
              <span>📊</span> {"Archives"}
            </li>
          </ul>
        </nav>
      </div>
        <main className="main-content">
          {/* mettre page ici*/}
        </main>
        </div>
    );
}

export default Navbar;