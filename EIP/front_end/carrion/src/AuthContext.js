import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const checkAuth = async () => {
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
      }
    };

    checkAuth();
  }, []);

  const logOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('lastPath');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
