import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import apiService from "./services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const logOut = useCallback(() => {
    setIsAuthenticated(false);
    setUserProfile(null);

    localStorage.clear();
  }, []);

  useEffect(() => {
    apiService.registerLogoutCallback(logOut);
  }, [logOut]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiService.get(
          `/auth/check?nocache=${new Date().getTime()}`
        );
        if (response.ok) {
          setIsAuthenticated(true);

          const profileResponse = await apiService.get("/user-profile");
          if (profileResponse.ok) {
            setUserProfile(await profileResponse.json());
          }
        } else {
          logOut();
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
        logOut();
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, [logOut]);

  const getUserDisplayName = () => {
    if (!userProfile) return "Carrion";

    const firstName = userProfile.firstName || "";
    const lastName = userProfile.lastName || "";

    if (!firstName.trim() && !lastName.trim()) {
      return "Carrion";
    }

    return `${firstName} ${lastName}`.trim();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        logOut,
        loadingAuth,
        userProfile,
        getUserDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
