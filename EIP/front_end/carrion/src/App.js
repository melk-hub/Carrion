import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Archives from './pages/Archives';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/check`, { withCredentials: true });

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error while verifying authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  console.log("app is rendering");

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
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const lastPath = localStorage.getItem('lastPath');
    if (lastPath && location.pathname === '/') {
      navigate(lastPath);
    }
  }, [navigate, location.pathname]);

  return (
    <div>
      {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && <Header setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        <Route path="/" element={<Landing setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/archives"
          element={
            isAuthenticated ? (
              <Archives />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
