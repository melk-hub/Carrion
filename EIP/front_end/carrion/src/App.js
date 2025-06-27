import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Archives from "./pages/Archives";
import Statistics from "./pages/Statistics";
import AuthCallback from "./components/AuthCallback";
import { useAuth, AuthProvider } from "./AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useLanguage } from "./contexts/LanguageContext";
import Navbar from "./pages/Navbar";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notification";

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                style: {
                  background: "#4CAF50",
                },
              },
              error: {
                style: {
                  background: "#F44336",
                },
              },
            }}
          />
          <AppLayout />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

function AppLayout() {
  const { isAuthenticated, setIsAuthenticated, loadingAuth } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

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
        navigate(lastPath && lastPath !== "/" ? lastPath : "/home", {
          replace: true,
        });
      } else if (lastPath && lastPath === "/") {
        navigate("/home", { replace: true });
      }
    }
  }, [isAuthenticated, loadingAuth, navigate, location.pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  if (loadingAuth) {
    return <div>{t("common.loadingAuth")}</div>;
  }

  return (
    <div>
      {location.pathname !== "/" && (
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          setIsAuthenticated={setIsAuthenticated}
        />
      )}

      <main
        className={
          location.pathname !== "/"
            ? sidebarCollapsed
              ? "navbar-content collapsed"
              : "navbar-content"
            : ""
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/home"
            element={
              isAuthenticated ? (
                <Home sidebarCollapsed={sidebarCollapsed} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard sidebarCollapsed={sidebarCollapsed} />
              ) : (
                <Navigate to="/" replace state={{ from: location }} />
              )
            }
          />
          <Route
            path="/archives"
            element={
              isAuthenticated ? (
                <Archives sidebarCollapsed={sidebarCollapsed} />
              ) : (
                <Navigate to="/" replace state={{ from: location }} />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <Profile />
              ) : (
                <Navigate to="/" replace state={{ from: location }} />
              )
            }
          />
          <Route
            path="/statistics"
            element={
              isAuthenticated ? (
                <Statistics sidebarCollapsed={sidebarCollapsed}/>
              ) : (
                <Navigate to="/" replace state={{ from: location }} />
              )
            }
          />
          <Route
            path="/settings"
            element={
              isAuthenticated ? (
                <Settings />
              ) : (
                <Navigate to="/" replace state={{ from: location }} />
              )
            }
          />
          <Route
            path="/notification"
            element={
              isAuthenticated ? (
                <Notifications sidebarCollapsed={sidebarCollapsed}/>
              ) : (
                <Navigate to="/" replace state={{ from: location }} />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
