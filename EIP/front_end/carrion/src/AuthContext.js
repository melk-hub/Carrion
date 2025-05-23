import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const checkAuth = async () => {
      setLoadingAuth(true);
      try {
        const response = await axios.get(`${API_URL}/auth/check?nocache=${new Date().getTime()}`, { withCredentials: true });
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error while verifying authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, [API_URL]);

  const logOut = async () => {
    setIsAuthenticated(false);
    localStorage.removeItem('lastPath');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logOut, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
