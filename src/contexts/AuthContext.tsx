"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { loadState, saveState } from "@/lib/localStorageUtils";
import { FirebaseUser, UserProfile } from "@/lib/types";
import { getInitialUserProfile } from "@/lib/habitUtils";
import { DEFAULT_USER_NAME } from "@/lib/constants";

export const USER_PROFILE_KEY = "habitForge_userProfile";
export const ACCESS_TOKEN_KEY = "habitForge_accessToken";
export const REFRESH_TOKEN_KEY = "habitForge_refreshToken";

interface AuthContextType {
  currentUser: any;
  setCurrentUser: any;
  setLoading: any;
  loading: boolean;
  isAuthPage: boolean;
  setIsAuthPage: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthPage, setIsAuthPage] = useState(false);

  useEffect(() => {
    const accessToken = loadState<string>(ACCESS_TOKEN_KEY, "");
    const userProfile = loadState<any>(USER_PROFILE_KEY, "");

    if (accessToken && userProfile) {
      setCurrentUser(userProfile);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem(USER_PROFILE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
    setLoading,
    loading,
    logout,
    isAuthPage,
    setIsAuthPage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
