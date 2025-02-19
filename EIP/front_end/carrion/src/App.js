import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Archives from './pages/Archives';
import { useAuth, AuthProvider } from './AuthContext';

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
  const { isAuthenticated, setIsAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, location.pathname, isLoading]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && (
        <Header setIsAuthenticated={setIsAuthenticated} />
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/archives"
          element={
            isAuthenticated ? <Archives /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
