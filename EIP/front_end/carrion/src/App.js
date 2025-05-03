import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Archives from './pages/Archives';
import { useAuth, AuthProvider } from './AuthContext'; // Import du Context

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

function AppLayout() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
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
      {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && (
        <Header setIsAuthenticated={setIsAuthenticated} />
      )}

      <Routes>
        <Route path="/" element={<Landing setIsAuthenticated={setIsAuthenticated} />} />        
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />        
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/home" element={
            isAuthenticated ? (
              <Home />
            ) : (
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
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/archives"
          element={
            isAuthenticated ? (
              <Archives />
            ) : (
              <Navigate to="/archives" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
