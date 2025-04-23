import React, { useState } from "react";
import "../styles/Navbar.css";

function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("Accueil");

  return (
    <div className="layout">
      <header className="topbar">
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
      </header>

      <div className="layout-body">
        <nav className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
          <ul className="menu">
            <li onClick={() => setActiveSection("Accueil")}>
              <span>🏠</span> {!isCollapsed && "Accueil"}
            </li>
            <li onClick={() => setActiveSection("Candidatures")}>
              <span>📄</span> {!isCollapsed && "Candidatures"}
            </li>
            <li onClick={() => setActiveSection("Données")}>
              <span>📊</span> {!isCollapsed && "Données"}
            </li>
          </ul>
        </nav>

        <main className="main-content">
          {activeSection === "Accueil" && <div>Accueil</div>}
          {activeSection === "Candidatures" && <div>Candidatures</div>}
          {activeSection === "Données" && <div>Données</div>}
        </main>
      </div>
    </div>
    );
};

export default Navbar;