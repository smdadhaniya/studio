
"use client";

import type { FirebaseUser, UserProfile } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { HabitForgeAuth } from '../../firebase/firebase.config'; // Corrected relative import path
import { toast } from '@/hooks/use-toast';
import { loadState, saveState } from '@/lib/localStorageUtils';
import { getInitialUserProfile } from '@/lib/habitUtils';
import { DEFAULT_USER_NAME } from '@/lib/constants';

const USER_PROFILE_KEY = 'habitForge_userProfile';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signup: (email: string, password: string, fullName: string) => Promise<FirebaseUser | null>;
  login: (email: string, password: string) => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(HabitForgeAuth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const signup = async (email: string, password: string, fullName: string): Promise<FirebaseUser | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(HabitForgeAuth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: fullName });

        // Update UserProfile in localStorage
        const existingProfile = loadState<UserProfile>(USER_PROFILE_KEY, getInitialUserProfile());
        const newProfile: UserProfile = {
          ...existingProfile, // Preserve XP, level, badges, subscription status
          userName: fullName || DEFAULT_USER_NAME,
          hasCompletedSetup: true,
        };
        saveState(USER_PROFILE_KEY, newProfile);
        // This will indirectly update RootLayout's userProfile state on next load/refresh
        // and HabitForgeApp's userProfile state when it mounts or re-renders.

        setCurrentUser(userCredential.user); // Update context state immediately
        toast({ title: 'Signup Successful!', description: `Welcome, ${fullName}!` });
        setLoading(false);
        return userCredential.user;
      }
      setLoading(false);
      return null;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({ title: 'Signup Failed', description: error.message || 'Please try again.', variant: 'destructive' });
      setLoading(false);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<FirebaseUser | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(HabitForgeAuth, email, password);
      setCurrentUser(userCredential.user);
      toast({ title: 'Login Successful!', description: 'Welcome back!' });
      setLoading(false);
      return userCredential.user;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ title: 'Login Failed', description: error.message || 'Invalid credentials. Please try again.', variant: 'destructive' });
      setLoading(false);
      return null;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(HabitForgeAuth);
      setCurrentUser(null);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      // Optionally, clear or reset parts of localStorage UserProfile if desired,
      // e.g., saveState(USER_PROFILE_KEY, getInitialUserProfile());
      // For now, localStorage profile persists, user can log back in to same local data.
      setLoading(false);
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ title: 'Logout Failed', description: error.message || 'Please try again.', variant: 'destructive' });
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
