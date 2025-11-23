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
import { OrganizationMemberInfo } from "@/interface/organization.interface";

interface AuthContextType {
  isAuthenticated: boolean;
  loadingAuth: boolean;
  userProfile: UserProfile | null;
  isMember: boolean;
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
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);

  const logOut = useCallback(async (callApi: boolean = true) => {
    if (callApi) {
      try {
        await apiService.get("/auth/logout");
      } catch (error) {
        console.error("Logout error", error);
      }
    }
    setIsAuthenticated(false);
    setUserProfile(null);
    setIsMember(false);
    setLoadingAuth(false);
  }, []);

  const checkAuthStatus = useCallback(async () => {
    setLoadingAuth(true);
    try {

      const profileData = await apiService.get<UserProfile>("/user/profile");

      if (profileData) {
        setUserProfile(profileData);
        setIsAuthenticated(true);


        try {
          const orgData = await apiService.get<OrganizationMemberInfo[]>('/organization');
          if (orgData === null) { setIsMember(false);
          } else {
            setIsMember(orgData && orgData.length > 0);
          }
        } catch (e) {
          setIsMember(false);
        }

      } else {
        setUserProfile(null);
        setIsAuthenticated(false);
        setIsMember(false);
      }
    } catch (error) {
      setUserProfile(null);
      setIsAuthenticated(false);
      setIsMember(false);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    apiService.registerLogoutCallback(logOut);
  }, [logOut]);

  const getUserDisplayName = useCallback((): string => {
    if (!userProfile) return "Carrion";
    const { firstName, lastName } = userProfile;
    return `${firstName || ""} ${lastName || ""}`.trim() || "Carrion";
  }, [userProfile]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      loadingAuth,
      userProfile,
      isMember,
      setIsAuthenticated,
      logOut,
      checkAuthStatus,
      getUserDisplayName,
    }),
    [
      isAuthenticated,
      loadingAuth,
      userProfile,
      isMember,
      logOut,
      checkAuthStatus,
      getUserDisplayName,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};