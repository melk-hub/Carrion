import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Navbar.css";
// import '../styles/Header.css';
import logo from '../assets/carrion_logo.png';
import axios from 'axios';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Archives from '../pages/Archives';

function Header({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [activeSection, setActiveSection] = useState("Accueil");

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
    <div className="layout">
    <header className="topbar">
      <div className="logo right">
        <span className="icon" onClick={() => navigate('/home')} ><img src={logo} alt="Carrion" /></span>

      </div>
      <div className="notifications">
        <span className="bell" onClick={handleLogout}>🔔</span>
      </div>
      <div className="user-profile" onClick={() => navigate('/parameters')}>
        <img alt="User" className="avatar" />
        <span className="username">Jeremy</span>
      </div>
    </header>

    <div className="layout-body">
      <nav className={`sidebar`}>
        <ul className="menu">
          <li onClick={() => setActiveSection("Accueil")}>
            <span>🏠</span> {"Accueil"}
          </li>
          <li onClick={() => setActiveSection("Candidature")}>
            <span>📄</span> {"Candidatures"}
          </li>
          <li onClick={() => setActiveSection("Archives")}>
            <span>📊</span> {"Archives"}
          </li>
        </ul>
      </nav>
      <main className="main-content">
      {activeSection === "Accueil" && <Home/>}
      {activeSection === "Candidature" && <Dashboard/>}
      {activeSection === "Archives" && <Archives/>}
      </main>
    </div>

  </div>
  
  );
}

/*
<header className="header">
  <h1 onClick={() => navigate('/dashboard')} className="logo-button">
    <img src={logo} alt="Carrion" />
  </h1>
*/
  {/* Conteneur pour centrer la navigation */}
/*
  <div className="navigation-container">
    <div className="navigation-buttons">
      <button onClick={() => navigate('/dashboard')} className='applications-button'>Candidatures</button>
      <button onClick={() => navigate('/archives')} className='archives-button'>Archives</button>
      <button onClick={() => navigate('/objectives')} className='objectives-button'>Objectifs</button>
      <button onClick={() => navigate('/parameters')} className='parameters-button'>Profil</button>
    </div>
  </div>

  <button onClick={handleLogout} className="logout-button">Déconnexion</button>
</header>
*/
export default Header;
