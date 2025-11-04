"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import apiService from "@/services/api";
import { UserProfile } from "@/interface/user.interface";

interface AuthContextType {
  isAuthenticated: boolean;
  loadingAuth: boolean;
  userProfile: UserProfile | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  logOut: (callApi?: boolean) => void;
  checkAuthStatus: () => Promise<void>;
  getUserDisplayName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  /**
   * Logs the user out by calling the API and clearing the local state.
   */
  const logOut = useCallback(async (callApi: boolean = true) => {
    if (callApi) {
      try {
        await apiService.get("/auth/logout");
      } catch (error) {
        console.error(
          "Logout request failed, clearing session locally anyway.",
          error
        );
      }
    }

    setIsAuthenticated(false);
    setUserProfile(null);
    setLoadingAuth(false);
  }, []);

  /**
   * Checks the user's authentication status by fetching their profile.
   * This function will be called by protected layouts.
   */
  const checkAuthStatus = useCallback(async () => {
    setLoadingAuth(true);
    try {
      const profileData = await apiService.get<UserProfile>("/user/profile");

      if (profileData) {
        setUserProfile(profileData);
        setIsAuthenticated(true);
      } else {
        setUserProfile(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUserProfile(null);
      setIsAuthenticated(false);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    apiService.registerLogoutCallback(logOut);
  }, [logOut]);

  /**
   * Returns a display-friendly user name or a default value.
   */
  const getUserDisplayName = useCallback((): string => {
    if (!userProfile) return "Carrion";
    const { firstName, lastName } = userProfile;
    const displayName = `${firstName || ""} ${lastName || ""}`.trim();
    return displayName || "Carrion";
  }, [userProfile]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      loadingAuth,
      userProfile,
      setIsAuthenticated,
      logOut,
      checkAuthStatus,
      getUserDisplayName,
    }),
    [
      isAuthenticated,
      loadingAuth,
      userProfile,
      logOut,
      checkAuthStatus,
      getUserDisplayName,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
