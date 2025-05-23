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
  const { isAuthenticated, setIsAuthenticated, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loadingAuth) {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location, loadingAuth]);

  useEffect(() => {
    if (loadingAuth) {
      console.log("Loading authentication...");
      return;
    }

    if (isAuthenticated) {
      const lastPath = localStorage.getItem("lastPath");
      if (location.pathname === "/") {
        navigate(lastPath && lastPath !== "/" ? lastPath : "/dashboard", {
          replace: true,
        });
      } else if (lastPath && lastPath === "/") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, loadingAuth, navigate, location.pathname]);

  if (loadingAuth) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div>
      {location.pathname !== '/' && (
        <Navbar setIsAuthenticated={setIsAuthenticated} />
      )}{" "}

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
          path="/home"
          element={
            isAuthenticated ? (
              <Home />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace state={{ from: location }} />
            )
          }
        />
        <Route
          path="/archives"
          element={
            isAuthenticated ? (
              <Archives />
            ) : (
              <Navigate to="/" replace state={{ from: location }} />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;