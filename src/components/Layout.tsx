"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Flame,
  Gem,
  User,
  BellRing,
  MessageSquare,
  LogOut,
  LogIn,
  UserPlus,
  ListChecks,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubscriptionModal } from "@/components/user/SubscriptionModal";
import { SetupModal } from "@/components/user/SetupModal";
import { Toaster } from "@/components/ui/toaster";

import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";
import { getInitialUserProfile } from "@/lib/habitUtils";
import { loadState, saveState } from "@/lib/localStorageUtils";
import { DEFAULT_USER_NAME } from "@/lib/constants";
import type { IAdminInfo, UserProfile } from "@/lib/types";

const USER_PROFILE_KEY = "habitForge_userProfile";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, isAuthPage, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [userProfile, setUserProfile] = useState<UserProfile>(
    getInitialUserProfile()
  );
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
    useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] =
    useState<boolean>(false);

  const isAdminPanel = pathname.startsWith("/admin");

  const admin = loadState<any>("admin_info", "");
  const { requestPermission, permission } = useNotifications();

  const handleProfileNameUpdate = useCallback(
    (name: string) => {
      const effectiveName =
        name.trim() === ""
          ? userProfile.userName || DEFAULT_USER_NAME
          : name.trim();
      const newProfile = {
        ...userProfile,
        userName: effectiveName,
        hasCompletedSetup: true,
      };
      setUserProfile(newProfile);
      saveState(USER_PROFILE_KEY, newProfile);

      toast({
        title: "Profile Updated!",
        description: `Name changed to ${effectiveName}.`,
      });
      setIsEditProfileModalOpen(false);
    },
    [userProfile]
  );

  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  const noNavPaths = ["/login", "/signup"];
  const showNav = !noNavPaths.includes(pathname);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {showNav && (
          <nav className="w-full bg-card border-b border-border shadow-sm sticky top-0 z-50">
            <div className="container mx-auto flex h-14 items-center px-4">
              <Link
                href="/"
                className="flex items-center gap-2 mr-6 text-foreground hover:text-primary transition-colors"
              >
                <Image
                  src="/images/site-logo.jpg"
                  alt="Habit Track App Screenshot"
                  width={100}
                  height={100}
                  className="w-24 h-7 md:w-24 md:h-7 text-primary "
                />
              </Link>

              {profile && (
                <Link
                  href="/habits"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 px-3 flex items-center"
                >
                  <ListChecks className="w-4 h-4 mr-1.5" /> My Habits
                </Link>
              )}

              <div className="flex-grow" />

              <div className="flex items-center gap-3">
                {!isAuthPage ? (
                  <>
                    {isAdminPanel ? null : currentUser?.subscription_plan
                        ?.is_active ? (
                      <Button
                        onClick={() =>
                          toast({
                            title: "Manage Subscription",
                            description: "Subscription management coming soon.",
                          })
                        }
                        variant="outline"
                        className="text-sm"
                      >
                        <Gem className="w-5 h-5 mr-2 text-primary" /> Premium
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                      >
                        <Gem className="w-5 h-5 mr-2" /> Upgrade
                      </Button>
                    )}
                    {profile?.id && (
                      <DropdownMenu>
                        <div className="flex   items-center">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-sm w-9 h-5 rounded-full"
                            >
                              <User className="w-5 h-5" />
                              <span className="sr-only">User Settings</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <div className="flex flex-col items-start">
                            <span className="text-end">
                              {isAdminPanel ? admin?.name : currentUser?.name}
                            </span>
                            <span>
                              {isAdminPanel ? admin?.email : currentUser?.email}
                            </span>
                          </div>
                        </div>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {currentUser?.displayName}
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
                    )}
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
        setIsSubscriptionModalOpen={setIsSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      />

      <SetupModal
        open={isEditProfileModalOpen}
        onOpenChange={setIsEditProfileModalOpen}
        onSubmit={handleProfileNameUpdate}
        currentUserName={userProfile.userName}
        isEditing={true}
      />
    </>
  );
}
