
"use client";

import type { Metadata } from 'next';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Flame, Gem, Cog, User, BellRing, MessageSquare, Trash2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubscriptionModal } from '@/components/user/SubscriptionModal';
import { SetupModal } from '@/components/user/SetupModal';
import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/lib/types';
import { loadState, saveState } from '@/lib/localStorageUtils'; // Corrected import path
import { getInitialUserProfile } from '@/lib/habitUtils'; // Ensure correct path
import { DEFAULT_USER_NAME } from '@/lib/constants'; // Corrected import for DEFAULT_USER_NAME
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// export const metadata: Metadata = { // Metadata should be defined in a server component or moved
//   title: 'Habit Track',
//   description: 'Track new habits and monitor your progress.',
// };

const USER_PROFILE_KEY = 'habitForge_userProfile';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userProfile, setUserProfile] = useState<UserProfile>(getInitialUserProfile());
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const { requestPermission, permission } = useNotifications();

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      let loadedProfile = loadState<UserProfile>(USER_PROFILE_KEY, getInitialUserProfile());
      if (loadedProfile.isSubscribed === undefined) {
        loadedProfile = { ...loadedProfile, isSubscribed: false };
      }
      setUserProfile(prev => ({...prev, ...loadedProfile}));
    }
  }, []);

  const handleSubscribe = useCallback(() => {
    setUserProfile(prev => {
      const newProfile = { ...prev, isSubscribed: true };
      saveState(USER_PROFILE_KEY, newProfile);
      return newProfile;
    });
    toast({ title: "Subscribed!", description: "Welcome to Premium! Cloud sync is now notionally active." });
    setIsSubscriptionModalOpen(false);
  }, []);

  const handleProfileNameUpdate = useCallback((name: string) => {
    const effectiveName = name.trim() === '' ? (userProfile.userName || DEFAULT_USER_NAME) : name.trim();
    setUserProfile(prev => {
      const newProfile = { ...prev, userName: effectiveName, hasCompletedSetup: true };
      saveState(USER_PROFILE_KEY, newProfile);
      return newProfile;
    });
    toast({ title: "Profile Updated!", description: `Name changed to ${effectiveName}.` });
    setIsEditProfileModalOpen(false);
  }, [userProfile.userName]);


  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* It's good practice to put metadata tags directly in head if layout is client component */}
        <title>Habit Track</title>
        <meta name="description" content="Track new habits and monitor your progress." />
      </head>
      <body className={`${poppins.variable} antialiased`} suppressHydrationWarning={true}>
        <div className="flex flex-col min-h-screen">
          <nav className="w-full bg-card border-b border-border shadow-sm sticky top-0 z-50">
            <div className="container mx-auto flex h-14 items-center px-4">
              {/* Left Side: Logo and Title */}
              <Link href="/" className="flex items-center gap-2 mr-6 text-foreground hover:text-primary transition-colors">
                <Flame className="w-7 h-7 text-primary" />
                <span className="text-lg font-bold">Habit Track</span>
              </Link>

              {/* Middle: Navigation Links */}
              <Link href="/landing" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 px-3">
                Home
              </Link>
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 px-3">
                My Habits
              </Link>
              <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2 px-3">
                Admin
              </Link>

              <div className="flex-grow"></div> {/* Spacer */}

              {/* Right Side: Actions */}
              <div className="flex items-center gap-3">
                {!userProfile.isSubscribed ? (
                  <Button onClick={() => setIsSubscriptionModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                    <Gem className="w-5 h-5 mr-2" /> Upgrade to Premium
                  </Button>
                ) : (
                  <Button onClick={() => toast({title: "Manage Subscription", description:"Subscription management coming soon."})} variant="outline" className="text-sm">
                    <Gem className="w-5 h-5 mr-2 text-primary" /> Manage Subscription
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="text-sm w-9 h-9">
                      <Cog className="w-5 h-5" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setIsEditProfileModalOpen(true)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Profile Name</span>
                    </DropdownMenuItem>
                    {permission !== 'granted' && (
                      <DropdownMenuItem onSelect={requestPermission}>
                        <BellRing className="mr-2 h-4 w-4" />
                        <span>Enable Notifications</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => toast({title: "Feedback", description: "This feature is coming soon!"})}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Share Feedback</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem
                        onSelect={() => toast({title: "Action Required", description: "Please use the settings menu on the 'My Habits' page to delete all habits.", duration: 5000})}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete All Habits</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => toast({title: "Action Required", description: "Please use the settings menu on the 'My Habits' page to reset everything.", duration: 5000})}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        <span>Reset Everything</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </nav>

          <main className="flex-grow">
            {children}
          </main>
        </div>
        <Toaster />
        <SubscriptionModal
          open={isSubscriptionModalOpen}
          onOpenChange={setIsSubscriptionModalOpen}
          onSubscribe={handleSubscribe}
        />
        {/* SetupModal for profile name edit from global settings */}
        <SetupModal
            open={isEditProfileModalOpen}
            onOpenChange={setIsEditProfileModalOpen}
            onSubmit={(name) => handleProfileNameUpdate(name)}
            currentUserName={userProfile.userName}
            isEditing={true} // This modal is now for name editing only in this context
        />
      </body>
    </html>
  );
}
