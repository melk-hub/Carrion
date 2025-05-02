import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Archives from './pages/Archives';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
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

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location]);

  useEffect(() => {
    const lastPath = localStorage.getItem('lastPath');
    if (lastPath && location.pathname === '/') {
      navigate(lastPath);
    }
  }, [navigate, location.pathname]);

  return (
    <div>
      {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && <Header />}

      <Routes>
        <Route path="/" element={<Landing setIsAuthenticated={setIsAuthenticated} />} />        
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />        
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/home" element={
            isAuthenticated ? (
              <Home />
            ) : (
              // <Navigate to="/login" replace />
              <Navigate to="/home" replace />
            )
          }
        />
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
