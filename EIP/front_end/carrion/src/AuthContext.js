import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import apiService from './services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.get("/user-profile");
      if (response.ok) {
        const profileData = await response.json();
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setLoadingAuth(true);
      try {
        const response = await axios.get(`${API_URL}/auth/check?nocache=${new Date().getTime()}`, { withCredentials: true });
        if (response.status === 200) {
          setIsAuthenticated(true);
          // Récupérer le profil utilisateur après authentification
          await fetchUserProfile();
        } else {
          setIsAuthenticated(false);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error while verifying authentication:', error);
        setIsAuthenticated(false);
        setUserProfile(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, [API_URL]);

  const logOut = async () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    localStorage.removeItem('lastPath');
  };

  const getUserDisplayName = () => {
    if (!userProfile) return 'Carrion';
    
    const firstName = userProfile.firstName || '';
    const lastName = userProfile.lastName || '';
    
    if (!firstName.trim() && !lastName.trim()) {
      return 'Carrion';
    }
    
    // Sinon, retourner le nom complet (avec gestion des espaces)
    return `${firstName} ${lastName}`.trim();
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated, 
      logOut, 
      loadingAuth, 
      userProfile, 
      setUserProfile,
      getUserDisplayName,
      fetchUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};