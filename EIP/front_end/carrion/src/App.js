import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
// import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Archives from './pages/Archives';
import { useAuth, AuthProvider } from './AuthContext'; // Import du Context
import Navbar from './pages/Navbar';

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
      navigate('/home');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const lastPath = localStorage.getItem('lastPath');
    if (lastPath && location.pathname === '/') {
      navigate(lastPath);
    }
  }, [navigate, location.pathname]);

  return (
    <div>
      {location.pathname !== '/' && (
        <Navbar setIsAuthenticated={setIsAuthenticated} />
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <Home />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/archives"
          element={
            isAuthenticated ? (
              <Archives />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;