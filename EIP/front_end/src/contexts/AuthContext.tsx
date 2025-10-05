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
  logOut: () => void;
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
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const logOut = useCallback(async () => {
    try {
      await apiService.post("/auth/logout", {});
    } catch (error) {
      console.error(
        "Logout request failed, clearing session locally anyway.",
        error
      );
    } finally {
      setIsAuthenticated(false);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    apiService.registerLogoutCallback(logOut);
  }, [logOut]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoadingAuth(true);
      try {
        const profileData = await apiService.get<UserProfile>("/user/profile");
        setUserProfile(profileData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error(
          "Initial auth check failed, user is not authenticated:",
          error
        );
        setIsAuthenticated(false);
        setUserProfile(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

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
      getUserDisplayName,
    }),
    [
      isAuthenticated,
      loadingAuth,
      userProfile,
      setIsAuthenticated,
      logOut,
      getUserDisplayName,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
