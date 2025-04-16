import React from "react";
import "../styles/Navbar.css";

function Navbar() {
    return (
      <div className="sidebar">
        <div className="logo">
          <span className="icon">🌀</span>
          <span className="text">CARRION</span>
        </div>
        <ul className="menu">
          <li>
            <span>🏠</span>‎ ‎ ‎Accueil
          </li>
          <li>
            <span>📄</span>‎ ‎ ‎Candidatures
          </li>
          <li>
            <span>📊</span>‎ ‎ ‎Données
          </li>
        </ul>
      </div>
    );
};

export default Navbar;