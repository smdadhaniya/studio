"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import {
  Flame,
  Gem,
  Cog,
  User,
  BellRing,
  MessageSquare,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  HomeIcon,
  ListChecks,
} from "lucide-react"; // Added LogOut, LogIn, UserPlus, ShieldCheck, HomeIcon, ListChecks
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SubscriptionModal,
  SubscriptionPlan,
} from "@/components/user/SubscriptionModal";
import { SetupModal } from "@/components/user/SetupModal";
import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types";
import { loadState, saveState } from "@/lib/localStorageUtils";
import { getInitialUserProfile } from "@/lib/habitUtils";
import { DEFAULT_USER_NAME } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // Import AuthProvider and useAuth
import { useRouter, usePathname } from "next/navigation"; // For redirecting
import axiosInstance from "@/lib/axios";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const USER_PROFILE_KEY = "habitForge_userProfile";

function AppContent({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, loading: authLoading, isAuthPage } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [userProfile, setUserProfile] = useState<UserProfile>(
    getInitialUserProfile()
  );
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
    useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] =
    useState<boolean>(false);
  const { requestPermission, permission } = useNotifications();

  useEffect(() => {
    const fetchloginUser = async () => {
      // const currentUserInfo = await axiosInstance.get("api/fetch-user", {
      //   params: { userId: currentUser?.uid },
      // });
    };
    if (currentUser?.uid) {
      fetchloginUser();
    }
  }, [currentUser?.uid]);

  const handleProfileNameUpdate = useCallback(
    (name: string) => {
      const effectiveName =
        name.trim() === ""
          ? userProfile.userName || DEFAULT_USER_NAME
          : name.trim();
      setUserProfile((prev) => {
        const newProfile = {
          ...prev,
          userName: effectiveName,
          hasCompletedSetup: true,
        };
        saveState(USER_PROFILE_KEY, newProfile);
        return newProfile;
      });

      toast({
        title: "Profile Updated!",
        description: `Name changed to ${effectiveName}.`,
      });
      setIsEditProfileModalOpen(false);
    },
    [userProfile.userName, currentUser]
  );

  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  // Hide nav on auth pages
  const noNavPaths = ["/login", "/signup"];
  const showNav = !noNavPaths.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <title>Habit Track</title>
        <meta
          name="description"
          content="Track new habits and monitor your progress."
        />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <div className="flex flex-col min-h-screen">
          {showNav && (
            <nav className="w-full bg-card border-b border-border shadow-sm sticky top-0 z-50">
              <div className="container mx-auto flex h-14 items-center px-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 mr-6 text-foreground hover:text-primary transition-colors"
                >
                  <Flame className="w-7 h-7 text-primary" />
                  <span className="text-lg font-bold">Habit Track</span>
                </Link>

                <Link
                  href="/landing"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 px-3 flex items-center"
                >
                  <HomeIcon className="w-4 h-4 mr-1.5" /> Home
                </Link>
                {currentUser && (
                  <Link
                    href="/"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 px-3 flex items-center"
                  >
                    <ListChecks className="w-4 h-4 mr-1.5" /> My Habits
                  </Link>
                )}
                {currentUser && ( // Typically admin link would be role-based
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 px-3 flex items-center"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" /> Admin
                  </Link>
                )}

                <div className="flex-grow"></div>

                <div className="flex items-center gap-3">
                  {authLoading ? (
                    <Button variant="ghost" className="text-sm" disabled>
                      Loading...
                    </Button>
                  ) : !isAuthPage ? (
                    <>
                      {!userProfile.isSubscribed ? (
                        <Button
                          onClick={() => setIsSubscriptionModalOpen(true)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                        >
                          <Gem className="w-5 h-5 mr-2" /> Upgrade
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            toast({
                              title: "Manage Subscription",
                              description:
                                "Subscription management coming soon.",
                            })
                          }
                          variant="outline"
                          className="text-sm"
                        >
                          <Gem className="w-5 h-5 mr-2 text-primary" /> Premium
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-sm w-9 h-9 rounded-full"
                          >
                            <User className="w-5 h-5" />
                            <span className="sr-only">User Settings</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <div className="flex flex-col">
                          <span className="capitalize">
                            {currentUser?.name}
                          </span>
                          <span>{currentUser?.email}</span>
                        </div>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {userProfile.userName ||
                              currentUser?.displayName ||
                              currentUser?.email}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => setIsEditProfileModalOpen(true)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            <span>Edit Profile Name</span>
                          </DropdownMenuItem>
                          {permission !== "granted" && (
                            <DropdownMenuItem onSelect={requestPermission}>
                              <BellRing className="mr-2 h-4 w-4" />
                              <span>Enable Notifications</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onSelect={() =>
                              toast({
                                title: "Feedback",
                                description: "This feature is coming soon!",
                              })
                            }
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Share Feedback</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={handleLogout}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log Out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <>
                      <Link href="/login" passHref>
                        <Button variant="outline" className="text-sm">
                          <LogIn className="mr-2 h-4 w-4" /> Log In
                        </Button>
                      </Link>
                      <Link href="/signup" passHref>
                        <Button className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                          <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </nav>
          )}
          <main className="flex-grow">{children}</main>
        </div>
        <Toaster />
        <SubscriptionModal
          open={isSubscriptionModalOpen}
          onOpenChange={setIsSubscriptionModalOpen}
        />
        <SetupModal
          open={isEditProfileModalOpen}
          onOpenChange={setIsEditProfileModalOpen}
          onSubmit={(name) => handleProfileNameUpdate(name)}
          currentUserName={userProfile.userName}
          isEditing={true}
        />
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}
