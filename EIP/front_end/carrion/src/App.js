import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Archives from './pages/Archives';
import Objectives from './pages/Objectives';
import Statistics from './pages/Statistics';
import Career from './pages/Career';
import Leaderboard from './pages/Leaderboard';
import Home from './pages/Home';
import { useAuth, AuthProvider } from './AuthContext';
import Layout from './components/Layout';

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location]);

  useEffect(() => {
    const lastPath = localStorage.getItem('lastPath');
    navigate(lastPath);
  }, [navigate, location.pathname]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout><Dashboard /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/archives"
          element={
            isAuthenticated ? (
              <Layout><Archives /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/objectives"
          element={
            isAuthenticated ? (
              <Layout><Objectives /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <Layout><Home /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/statistics"
          element={
            isAuthenticated ? (
              <Layout><Statistics /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/career"
          element={
            isAuthenticated ? (
              <Layout><Career /></Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/leaderboard"
          element={
            isAuthenticated ? (
              <Layout><Leaderboard /></Layout>
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
