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
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

interface AuthContextType {
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthPage: boolean;
  setIsAuthPage: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  loadedProfile: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthPage, setIsAuthPage] = useState(false);
  const pathname = usePathname();
  let loadedProfile = loadState<any>(USER_PROFILE_KEY, {});

  useEffect(() => {
    const isAuth = pathname === "/login" || pathname === "/signup";
    setIsAuthPage(isAuth);
  }, [pathname]);

  useEffect(() => {
    if (!loadedProfile?.hasCompletedSetup && !loadedProfile?.uid) {
      router.replace("/landing");
    }
    const fetchloginUser = async () => {
      const UserInfoResponse = await axiosInstance.get("api/fetch-user", {
        params: { userId: loadedProfile?.uid },
      });
      setCurrentUser(UserInfoResponse.data.userInfo);
    };
    if (loadedProfile?.uid) {
      fetchloginUser();
    }
  }, [loadedProfile?.uid]);

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
        loadedProfile,
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
