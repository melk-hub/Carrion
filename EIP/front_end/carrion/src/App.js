import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import Header from './components/Header';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <AppLayout isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </Router>
  );
}

function AppLayout({ isAuthenticated, setIsAuthenticated }) {
  const location = useLocation();

  return (
    <div>
      {location.pathname !== '/' && <Header />}

      <Routes>
        <Route path="/" element={<LandingPage setIsAuthenticated={setIsAuthenticated} />} />

        <Route
          path="/home"
          element={
            isAuthenticated ? <HomePage /> : <Navigate to="/" />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
