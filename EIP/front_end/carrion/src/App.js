import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Archives from './pages/Archives';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Charger l'état d'authentification à partir de localStorage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  return (
    <Router>
      <AppLayout isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </Router>
  );
}

function AppLayout({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Sauvegarde la dernière page visitée dans localStorage
  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location]);

  // Redirection vers la dernière page visitée après le rechargement
  useEffect(() => {
    const lastPath = localStorage.getItem('lastPath');
    if (lastPath && location.pathname === '/') {
      navigate(lastPath);
    }
  }, [navigate, location.pathname]);

  return (
    <div>
      {/* Afficher le header sur certaines pages */}
      {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && <Header />}

      <Routes>
        {/* Page Landing */}
        <Route path="/" element={<Landing setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Page Login */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Page Register */}
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Page Dashboard avec redirection si non authentifié */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              // <Navigate to="/login" replace />
              <Navigate to="/dashboard" replace />
            )
          }
        />
        {/* Page Archives avec redirection si non authentifié */}
        <Route
          path="/archives"
          element={
            isAuthenticated ? (
              <Archives />
            ) : (
              // <Navigate to="/login" replace />
              <Navigate to="/archives" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
