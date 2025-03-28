import React, { useState } from 'react';
import { Home, BarChart, Archive, Briefcase, Target, Trophy, LayoutDashboard, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Layout.css";
import { useAuth } from '../AuthContext';

const navItems = [
  { name: "Home", icon: Home, path: "/home" },
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Archives", icon: Archive, path: "/archives" },
  { name: "Statistiques", icon: BarChart, path: "/statistics" },
  { name: "Carrière", icon: Briefcase, path: "/career" },
  { name: "Objectifs", icon: Target, path: "/objectives" },
  { name: "Leaderboard", icon: Trophy, path: "/leaderboard" },
];

const API_URL = process.env.REACT_APP_API_URL;

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  // const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // const handleMouseEnter = () => {
  //   setIsExpanded(true);
  // };

  // const handleMouseLeave = () => {
  //   setIsExpanded(false);
  // };

  // return (
  //   <div className="layout-container">
  //     <aside className="sidebar">
  //       <div
  //         className="main-bubble-container"
  //         onMouseEnter={handleMouseEnter}
  //         onMouseLeave={handleMouseLeave}
  //       >
  //           <div className="main-bubble">
  //               <Menu size={40} />
  //           </div>
  //           <div className={`nav-dropdown ${isExpanded ? 'expanded' : ''}`}>
  //               {navItems.map((item) => (
  //               <button
  //                   key={item.name}
  //                   onClick={() => handleNavigation(item.path)}
  //                   className="nav-bubble"
  //                   onMouseEnter={() => setHoveredItem(item.name)}
  //                   onMouseLeave={() => setHoveredItem(null)}
  //               >
  //                   <item.icon size={30} />
  //                   {hoveredItem === item.name && (
  //                   <div className="tooltip">{item.name}</div>
  //                   )}
  //               </button>
  //               ))}
  //           </div>
  //       </div>
  //     </aside>

  //     <div className="main-content">
  //       <header className="header">
  //         <h1 className="logo">Carrion</h1>
  //         <div className="user-profile">
  //           <User size={24} />
  //           <button onClick={handleLogout} className="logout-button">Déconnexion</button>
  //         </div>
  //       </header>

  //       <main className="page-content">{children}</main>
  //     </div>
  //   </div>
  // );
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="nav-dropdown">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className="nav-bubble"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <item.icon size={30} />
              {hoveredItem === item.name && (
                <div className="tooltip">{item.name}</div>
              )}
            </button>
          ))}
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <h1 className="logo">Carrion</h1>
          <div className="user-profile">
            <User size={24} />
            <button onClick={handleLogout} className="logout-button">Déconnexion</button>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
