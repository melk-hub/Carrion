import React, { useState } from "react";
import "../styles/Navbar.css";

function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
    return (
      <div className="layout">
        <div className="topbar">
          <div className="logo right">
            <span className="icon">🌀</span>
            <span className="text">CARRION</span>
          </div>
          <div className="notifications">
            <span className="bell">🔔</span>
          </div>
          <div className="user-profile">
            <img alt="User" className="avatar" />
            <span className="username">Jeremy</span>
          </div>
        </div>
  
        <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
          <ul className="menu">
            <li>
              <span>🏠</span> {!isCollapsed && "Accueil"}
            </li>
            <li>
              <span>📄</span> {!isCollapsed && "Candidatures"}
            </li>
            <li>
              <span>📊</span> {!isCollapsed && "Données"}
            </li>
          </ul>
        </div>
      </div>
    );
};

export default Navbar;