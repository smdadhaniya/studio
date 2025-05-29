// AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { clearState, loadState } from "@/lib/localStorageUtils";
import { FirebaseUser } from "@/lib/types";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_PROFILE_KEY,
} from "@/lib/constants";
import axios from "axios";
import { nullable } from "zod";

interface AuthContextType {
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<FirebaseUser | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthPage: boolean;
  setIsAuthPage: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthPage, setIsAuthPage] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isAuth = pathname === "/login" || pathname === "/signup";
    setIsAuthPage(isAuth);
  }, [pathname]);

  useEffect(() => {
    // Load tokens and user profile from localStorage
    const token = loadState(ACCESS_TOKEN_KEY, "");
    const userProfile = loadState(USER_PROFILE_KEY, "");
    if (token && userProfile) {
      setCurrentUser(userProfile);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setCurrentUser(null);
    clearState(ACCESS_TOKEN_KEY);
    clearState(REFRESH_TOKEN_KEY);
    clearState(USER_PROFILE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        setLoading,
        isAuthPage,
        setIsAuthPage,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
