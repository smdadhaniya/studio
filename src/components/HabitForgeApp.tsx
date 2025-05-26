
"use client";

import type { Habit, HabitProgress, UserProfile, PresetHabitFormData, DailyProgress } from '@/lib/types';
import type { HabitFormData } from '@/components/habit/HabitForm';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadState, saveState } from '@/lib/localStorageUtils';
import { calculateStreak, calculateLevel, checkAndAwardBadges, getInitialUserProfile } from '@/lib/habitUtils';
import { DEFAULT_USER_NAME } from '@/lib/constants';
import { CreateHabitModal } from '@/components/habit/CreateHabitModal';
import { SetupModal } from '@/components/user/SetupModal';
import { HabitTable } from '@/components/habit/HabitTable';
import { BadgeDisplay } from '@/components/user/BadgeDisplay';
import { InputValueModal } from '@/components/habit/InputValueModal';
import { HabitReportModal } from '@/components/habit/HabitReportModal';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { empatheticMessage } from '@/ai/flows/empathetic-message';
import { generateMotivationalMessage } from '@/ai/flows/motivational-message';
import { PlusCircle, ChevronLeft, ChevronRight, Settings, Trash2, RefreshCcw, Bookmark, Edit3 } from 'lucide-react';
import { BADGES, XP_PER_COMPLETION, HABIT_COLORS, HABIT_LUCIDE_ICONS_LIST } from '@/lib/constants';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // For redirecting
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const HABITS_KEY = 'habitForge_habits';
const PROGRESS_KEY = 'habitForge_progress';
const USER_PROFILE_KEY = 'habitForge_userProfile';
const BOOKMARKED_VIEW_DATE_KEY = 'habitForge_bookmarkedViewDate';

export default function HabitForgeApp() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [allProgress, setAllProgress] = useState<HabitProgress>({});
  const [userProfile, setUserProfile] = useState<UserProfile>(getInitialUserProfile());
  const [isCreateHabitModalOpen, setIsCreateHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isEditProfileModalOpenFromApp, setIsEditProfileModalOpenFromApp] = useState(false);

  const [displayedMonth, setDisplayedMonth] = useState(startOfMonth(new Date()));

  const [isInputValueModalOpen, setIsInputValueModalOpen] = useState(false);
  const [inputValueModalContext, setInputValueModalContext] = useState<{ habitId: string, date: string, habit: Habit, currentValue?: number } | null>(null);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedHabitForReport, setSelectedHabitForReport] = useState<Habit | null>(null);
  const [reportModalProgress, setReportModalProgress] = useState<DailyProgress[]>([]);

  const { showNotification } = useNotifications();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!authLoading && !currentUser) {
      router.push('/login');
      return; // Prevent further execution in this effect if redirecting
    }

    // Proceed with loading local data if authenticated or if auth is still loading
    // (to avoid flicker if already logged in and just waiting for currentUser state update)
    const loadedHabitsInitial = loadState<Habit[]>(HABITS_KEY, []);
    const sanitizedHabits = loadedHabitsInitial.map((h, index) => {
      let iconName = typeof h.icon === 'string' ? h.icon : undefined;
      if (iconName && !HABIT_LUCIDE_ICONS_LIST.find(item => item.name === iconName)) {
        iconName = undefined;
      }
      return {
        ...h,
        id: h.id || crypto.randomUUID(),
        createdAt: h.createdAt || new Date().toISOString(),
        description: h.description || '',
        icon: iconName,
        color: (typeof h.color === 'string' && HABIT_COLORS.includes(h.color))
               ? h.color
               : HABIT_COLORS[index % HABIT_COLORS.length],
        measurableUnit: h.measurableUnit || (h.trackingFormat === 'measurable' ? 'units' : undefined),
        targetCount: h.targetCount || (h.trackingFormat === 'measurable' ? 1 : undefined),
      };
    });
    setHabits(sanitizedHabits);

    const loadedProgress = loadState<HabitProgress>(PROGRESS_KEY, {});
    setAllProgress(loadedProgress);

    let loadedProfile = loadState<UserProfile>(USER_PROFILE_KEY, getInitialUserProfile());
    if (loadedProfile.isSubscribed === undefined) {
      loadedProfile = { ...loadedProfile, isSubscribed: false };
    }
     // Sync with Firebase user's display name if available and local name is default
    if (currentUser?.displayName && loadedProfile.userName === DEFAULT_USER_NAME) {
      loadedProfile.userName = currentUser.displayName;
      loadedProfile.hasCompletedSetup = true; // Assume setup if Firebase user has a display name
      saveState(USER_PROFILE_KEY, loadedProfile); // Save updated profile
    }
    setUserProfile(prev => ({...prev, ...loadedProfile}));


    const bookmarkedDateString = loadState<string | null>(BOOKMARKED_VIEW_DATE_KEY, null);
    if (bookmarkedDateString) {
      setDisplayedMonth(startOfMonth(new Date(bookmarkedDateString)));
    }

    // Only trigger setup modal if user is authenticated but setup not complete
    if (currentUser && !loadedProfile.hasCompletedSetup) {
      setIsSetupModalOpen(true);
    }
  }, [authLoading, currentUser, router]); // Effect dependencies

  useEffect(() => { saveState(HABITS_KEY, habits); }, [habits]);
  useEffect(() => { saveState(PROGRESS_KEY, allProgress); }, [allProgress]);
  useEffect(() => { saveState(USER_PROFILE_KEY, userProfile); }, [userProfile]);


  const handleInitialSetupSubmit = (name: string, selectedPresetsData: PresetHabitFormData[]) => {
    const effectiveName = name.trim() === '' ? (userProfile.userName || DEFAULT_USER_NAME) : name.trim();
    
    const newProfile: UserProfile = { 
      ...userProfile, 
      userName: effectiveName, 
      hasCompletedSetup: true 
    };
    setUserProfile(newProfile);
    saveState(USER_PROFILE_KEY, newProfile);

    // Update Firebase profile display name as well
    if (currentUser) {
      updateProfile(currentUser, { displayName: effectiveName })
        .catch(err => console.error("Error updating Firebase display name:", err));
    }


    const habitsToAdd: Habit[] = [];
    if (selectedPresetsData.length > 0) {
        selectedPresetsData.forEach((preset) => {
            const existingHabitByTitle = habits.find(h => h.title === preset.title);
            if (!existingHabitByTitle) {
                habitsToAdd.push({
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    title: preset.title,
                    description: preset.description || '',
                    trackingFormat: preset.trackingFormat,
                    measurableUnit: preset.trackingFormat === 'measurable' ? preset.measurableUnit : undefined,
                    targetCount: preset.trackingFormat === 'measurable' ? preset.targetCount : undefined,
                    icon: preset.icon,
                    color: HABIT_COLORS[(habits.length + habitsToAdd.length) % HABIT_COLORS.length],
                });
            }
        });
    }

    if (habitsToAdd.length > 0) {
      setHabits(prev => [...prev, ...habitsToAdd]);
      toast({ title: `Welcome, ${effectiveName}!`, description: `${habitsToAdd.length} new habit(s) added.` });
    } else {
      toast({ title: `Welcome, ${effectiveName}!`, description: "You can add habits using the 'Add New Habit' button." });
    }
    setIsSetupModalOpen(false); 
  };

  const handleAppProfileEditSubmit = (name: string) => {
    const effectiveName = name.trim() === '' ? (userProfile.userName || DEFAULT_USER_NAME) : name.trim();
    const newProfile: UserProfile = { ...userProfile, userName: effectiveName, hasCompletedSetup: true }; 
    setUserProfile(newProfile);
    saveState(USER_PROFILE_KEY, newProfile);
     // Also update Firebase display name if user is logged in
    if (currentUser) {
      updateProfile(currentUser, { displayName: effectiveName }).catch(err => console.error("Failed to update Firebase profile name", err));
    }
    toast({ title: `Profile name updated to ${effectiveName}!` });
    setIsEditProfileModalOpenFromApp(false);
  };


  const handleHabitFormSubmit = (data: HabitFormData | PresetHabitFormData[]) => {
    if (Array.isArray(data)) { // Handling PresetHabitFormData[]
      const habitsToAdd: Habit[] = data
        .filter(preset => !habits.some(h => h.title === preset.title)) // Prevent duplicates by title
        .map((preset, indexOffset) => ({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          title: preset.title,
          description: preset.description || '',
          trackingFormat: preset.trackingFormat,
          measurableUnit: preset.trackingFormat === 'measurable' ? preset.measurableUnit : undefined,
          targetCount: preset.trackingFormat === 'measurable' ? preset.targetCount : undefined,
          icon: preset.icon, // Icon name from preset
          color: HABIT_COLORS[(habits.length + indexOffset) % HABIT_COLORS.length],
      }));

      if (habitsToAdd.length > 0) {
        setHabits(prev => [...prev, ...habitsToAdd]);
        toast({ title: `${habitsToAdd.length} Preset Habit(s) Added!`, description: `Successfully added new habits from presets.` });
      } else {
        toast({ title: "No New Habits Added", description: "Selected presets might already exist or none were selected." });
      }
    } else { // Handling single HabitFormData
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        title: data.title,
        description: data.description || '',
        trackingFormat: data.trackingFormat,
        measurableUnit: data.trackingFormat === 'measurable' ? data.measurableUnit : undefined,
        targetCount: data.trackingFormat === 'measurable' ? data.targetCount : undefined,
        icon: data.icon, 
        color: HABIT_COLORS[habits.length % HABIT_COLORS.length],
      };
      setHabits(prev => [...prev, newHabit]);
      toast({ title: "Habit Tracked!", description: `"${newHabit.title}" is now being tracked.` });
    }
    setIsCreateHabitModalOpen(false);
    setEditingHabit(null);
  };

  const handleHabitUpdate = (habitId: string, data: HabitFormData) => {
     setHabits(prev => prev.map(h => h.id === habitId ? {
        ...h, // Preserve existing color and other fields not in HabitFormData
        title: data.title,
        description: data.description || '',
        trackingFormat: data.trackingFormat,
        measurableUnit: data.trackingFormat === 'measurable' ? data.measurableUnit : undefined,
        targetCount: data.trackingFormat === 'measurable' ? data.targetCount : undefined,
        icon: data.icon, 
      } : h));
     setIsCreateHabitModalOpen(false);
     setEditingHabit(null);
     toast({ title: "Habit Updated!", description: `"${data.title}" has been updated.` });
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsCreateHabitModalOpen(true);
  };

  const handleDeleteHabit = (habitId: string) => {
    const habitToDelete = habits.find(h => h.id === habitId);
    if (window.confirm(`Are you sure you want to delete the habit "${habitToDelete?.title}"? This action cannot be undone.`)) {
        setHabits(prev => prev.filter(h => h.id !== habitId));
        setAllProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[habitId];
            return newProgress;
        });
        toast({ title: "Habit Deleted", description: `"${habitToDelete?.title}" has been removed.`, variant: "destructive" });
    }
  };

  const handleDeleteAllHabits = () => {
    if (window.confirm("Are you sure you want to delete ALL habits? This action cannot be undone.")) {
      if (window.confirm("SECOND CONFIRMATION: This will permanently remove all your habits and progress. Are you absolutely sure?")) {
        setHabits([]);
        setAllProgress({});
        toast({ title: "All Habits Deleted", description: "Your habit list and progress have been cleared.", variant: "destructive" });
      }
    }
  };

  const handleResetEverything = () => {
    if (window.confirm("Are you sure you want to RESET EVERYTHING? This will delete all habits, progress, and your profile information (name, achievements, subscription). This action cannot be undone.")) {
      if (window.confirm("FINAL CONFIRMATION: This will permanently erase all app data. There's no going back. Are you sure?")) {
        setHabits([]);
        setAllProgress({});
        const initialProfile = getInitialUserProfile(); 
        setUserProfile(initialProfile);
        saveState(USER_PROFILE_KEY, initialProfile); 
        saveState(BOOKMARKED_VIEW_DATE_KEY, null); // Clear bookmark
        setDisplayedMonth(startOfMonth(new Date())); // Reset month view
        toast({ title: "Application Reset", description: "All your data has been cleared. Welcome back!", variant: "destructive", duration: 7000 });
        setIsSetupModalOpen(true); // Trigger setup modal again
      }
    }
  };

  const openInputValueModal = (habit: Habit, date: string, currentValue?: number) => {
    setInputValueModalContext({ habitId: habit.id, date, habit, currentValue });
    setIsInputValueModalOpen(true);
  };

  const processHabitCompletionEffects = async (
    habit: Habit,
    updatedProgressForEffects: HabitProgress,
    previousUserProfile: UserProfile,
    date: string,
    triggerPositiveReinforcement: boolean,
    oldStreak: number
  ) => {
    let userProfileAfterToggle = { ...previousUserProfile };

    if (triggerPositiveReinforcement) {
      userProfileAfterToggle.xp += XP_PER_COMPLETION;
      toast({ title: "Great Job!", description: `+${XP_PER_COMPLETION} XP for ${habit.title}!` });
    }

    const { updatedProfile: profileWithBadges, newBadges } = checkAndAwardBadges(
      userProfileAfterToggle, habits, updatedProgressForEffects
    );
    userProfileAfterToggle = profileWithBadges;

    const finalXp = userProfileAfterToggle.xp;
    const { level: finalLevel } = calculateLevel(finalXp);
    const oldLevel = previousUserProfile.level;
    userProfileAfterToggle.level = finalLevel;


    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        toast({ title: "Achievement Unlocked!", description: `You earned the "${badge.name}" badge!` });
        showNotification("Achievement Unlocked!", { body: `You earned the "${badge.name}" badge!` });
      });
    }

    const newStreakAfterUpdate = calculateStreak(habit.id, updatedProgressForEffects);
    const milestoneReached = newBadges.length > 0 || (newStreakAfterUpdate > 0 && newStreakAfterUpdate % 5 === 0) || (finalLevel > oldLevel) || (oldStreak === 0 && newStreakAfterUpdate === 1 && triggerPositiveReinforcement) ;


    if (triggerPositiveReinforcement && milestoneReached) {
      try {
        const aiMessage = await generateMotivationalMessage({
          habitName: habit.title,
          userName: userProfileAfterToggle.userName || DEFAULT_USER_NAME,
          streakLength: newStreakAfterUpdate,
          milestoneAchieved: newBadges.length > 0 ? `badge: ${newBadges[0].name}` : (finalLevel > oldLevel ? `level ${finalLevel}` : `streak of ${newStreakAfterUpdate}`),
          brokenStreak: false,
        });
        toast({ title: "AI Coach Says:", description: aiMessage.message, duration: 7000 });
      } catch (error) {
        console.error("Error generating motivational message:", error);
      }
    } else if (!triggerPositiveReinforcement) { // Streak broken or value reduced
      if (oldStreak > 0 && newStreakAfterUpdate < oldStreak) { // Check if streak actually broke
        toast({ title: "Streak Broken", description: `For ${habit.title}. Don't worry, you can start a new one!`, variant: "destructive" });
        try {
          const aiMessage = await empatheticMessage({
            habitName: habit.title,
            streakLength: oldStreak,
          });
          toast({ title: "A Little Setback...", description: aiMessage.message, duration: 7000 });
          showNotification("Streak Broken", { body: `For ${habit.title}. ${aiMessage.message}` });
        } catch (error) {
          console.error("Error generating empathetic message:", error);
        }
      }
    }
    setUserProfile(userProfileAfterToggle);
    saveState(USER_PROFILE_KEY, userProfileAfterToggle); 
  };

  const handleInputValueSubmit = async (submittedValue?: number) => {
    if (!inputValueModalContext) return;
    const { habitId, date, habit } = inputValueModalContext;

    const oldStreak = calculateStreak(habitId, allProgress);
    const previousUserProfileBeforeEffects = { ...userProfile };

    const currentProgressForHabit = allProgress[habitId] || [];
    const entryIndex = currentProgressForHabit.findIndex(p => p.date === date);

    const wasPreviouslyCompleted = entryIndex !== -1 ? currentProgressForHabit[entryIndex].completed : false;
    const previousValue = entryIndex !== -1 ? currentProgressForHabit[entryIndex].value : undefined;

    const isNowCompleted = habit.trackingFormat === 'measurable'
      ? (submittedValue !== undefined && submittedValue > 0 && submittedValue >= (habit.targetCount || 1))
      : (submittedValue !== undefined && submittedValue > 0); // For yes/no, any positive value means completed

    const newValueForEntry = submittedValue; // This could be undefined if user clears input

    let newAllProgress = { ...allProgress };
    let updatedHabitSpecificProgressList: DailyProgress[];

    if (entryIndex !== -1) { // Existing entry
        if (newValueForEntry === undefined || newValueForEntry <= 0) { // Value cleared or set to 0 or less
            // Remove entry or mark as incomplete if you prefer to keep non-valued entries
            updatedHabitSpecificProgressList = currentProgressForHabit.filter((_, i) => i !== entryIndex);
        } else {
            updatedHabitSpecificProgressList = currentProgressForHabit.map((p, i) =>
                i === entryIndex ? { ...p, completed: isNowCompleted, value: newValueForEntry } : p
            );
        }
    } else { // New entry
        if (newValueForEntry !== undefined && newValueForEntry > 0) { // Only add if there's a positive value
            updatedHabitSpecificProgressList = [...currentProgressForHabit, { date, completed: isNowCompleted, value: newValueForEntry }];
        } else {
            updatedHabitSpecificProgressList = [...currentProgressForHabit]; // No change if no value and no existing entry
        }
    }
    updatedHabitSpecificProgressList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    newAllProgress[habitId] = updatedHabitSpecificProgressList;

    setAllProgress(newAllProgress);

    const wasJustNewlyCompleted = !wasPreviouslyCompleted && isNowCompleted;
    const valueIncreasedWhileCompleted = wasPreviouslyCompleted && isNowCompleted &&
                                          habit.trackingFormat === 'measurable' &&
                                          submittedValue !== undefined && previousValue !== undefined &&
                                          submittedValue > previousValue;
    const triggerPositiveReinforcement = wasJustNewlyCompleted || valueIncreasedWhileCompleted;

    await processHabitCompletionEffects(habit, newAllProgress, previousUserProfileBeforeEffects, date, triggerPositiveReinforcement, oldStreak);

    setIsInputValueModalOpen(false);
    setInputValueModalContext(null);
  };


  const handleToggleComplete = async (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    if (habit.trackingFormat === 'measurable') {
        const currentEntry = (allProgress[habitId] || []).find(p => p.date === date);
        openInputValueModal(habit, date, currentEntry?.value);
        return;
    }

    // For "yes/no" habits
    const oldStreak = calculateStreak(habitId, allProgress);
    const previousUserProfileBeforeEffects = { ...userProfile };

    let newAllProgress = { ...allProgress };
    const currentProgressForHabit = newAllProgress[habitId] || [];
    const entryIndex = currentProgressForHabit.findIndex(p => p.date === date);
    let updatedHabitSpecificProgressList: DailyProgress[];

    let isNowCompleted: boolean;
    if (entryIndex !== -1) { // Entry exists, toggle its completion
      isNowCompleted = !currentProgressForHabit[entryIndex].completed;
      if (isNowCompleted) {
        updatedHabitSpecificProgressList = currentProgressForHabit.map((p, i) =>
          i === entryIndex ? { ...p, completed: true, value: 1 } : p
        );
      } else {
        // If toggling off, remove the entry or mark value as undefined
        updatedHabitSpecificProgressList = currentProgressForHabit.filter((_,i) => i !== entryIndex);
      }
    } else { // No entry, mark as completed
      isNowCompleted = true;
      updatedHabitSpecificProgressList = [...currentProgressForHabit, { date, completed: true, value: 1 }];
    }
    
    updatedHabitSpecificProgressList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    newAllProgress[habitId] = updatedHabitSpecificProgressList;
    setAllProgress(newAllProgress);

    const triggerPositiveReinforcement = isNowCompleted;
    await processHabitCompletionEffects(habit, newAllProgress, previousUserProfileBeforeEffects, date, triggerPositiveReinforcement, oldStreak);
  };


  const unlockedBadges = useMemo(() => {
    return BADGES.filter(b => userProfile.unlockedBadgeIds.includes(b.id));
  }, [userProfile.unlockedBadgeIds]);

  const goToPreviousMonth = () => setDisplayedMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setDisplayedMonth(prev => addMonths(prev, 1));

  const handleShowReport = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    const progress = allProgress[habitId] || [];
    if (habit) {
      setSelectedHabitForReport(habit);
      setReportModalProgress(progress);
      setIsReportModalOpen(true);
    } else {
      toast({ title: "Error", description: "Could not find habit to generate report.", variant: "destructive"});
    }
  };
  
  const handleSaveBookmark = () => {
    saveState(BOOKMARKED_VIEW_DATE_KEY, format(displayedMonth, 'yyyy-MM-dd'));
    toast({ title: "View Bookmarked!", description: `Saved view for ${format(displayedMonth, "MMMM yyyy")}.` });
  };

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading your habits...</p></div>;
  }

  if (!currentUser) {
    // This should ideally not be reached if useEffect redirect works, but as a fallback.
    return <div className="flex justify-center items-center min-h-screen"><p>Redirecting to login...</p></div>;
  }
  
  // Show setup modal if user is authenticated but setup not complete
  if (!userProfile.hasCompletedSetup && !isSetupModalOpen && !isEditProfileModalOpenFromApp) {
    return (
      <SetupModal
        open={true} 
        onOpenChange={setIsSetupModalOpen} 
        onSubmit={handleInitialSetupSubmit}
        currentUserName={userProfile.userName || currentUser?.displayName || ''}
        isEditing={false} 
      />
    );
  }


  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-6 p-4 rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-4 gap-y-3">
           <div className="flex-1 min-w-0">
            {(userProfile.userName && userProfile.userName !== DEFAULT_USER_NAME) && (
              <h2 className="text-[25px] font-bold mb-1 text-left text-foreground truncate">
                {userProfile.userName}'s Progress
              </h2>
            )}
            <BadgeDisplay unlockedBadges={unlockedBadges} allPossibleBadges={BADGES} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mt-2 md:mt-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="order-first sm:order-none w-9 h-9">
                  <Bookmark className="w-5 h-5" />
                  <span className="sr-only">Bookmark View</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <Button onClick={handleSaveBookmark} size="sm" className="w-full">Save Current View</Button>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Previous month" className="w-9 h-9">
                <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-lg font-semibold text-foreground tabular-nums text-center min-w-[100px] sm:min-w-[110px]">
                {format(displayedMonth, "MMMM yyyy")}
                </span>
                <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Next month" className="w-9 h-9">
                <ChevronRight className="w-5 h-5" />
                </Button>
                <Button onClick={() => { setEditingHabit(null); setIsCreateHabitModalOpen(true); }} className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm ml-2">
                    <PlusCircle className="w-5 h-5 mr-2" /> Add New Habit
                </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-9 h-9">
                  <Settings className="w-5 h-5" />
                  <span className="sr-only">Page Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Habit Data Management</DropdownMenuLabel>
                 <DropdownMenuItem onSelect={() => setIsEditProfileModalOpenFromApp(true)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      <span>Edit Profile Name (Local)</span>
                 </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={handleDeleteAllHabits}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete All Habits</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={handleResetEverything}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    <span>Reset Everything</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CreateHabitModal
        open={isCreateHabitModalOpen}
        onOpenChange={setIsCreateHabitModalOpen}
        onHabitCreate={handleHabitFormSubmit}
        editingHabit={editingHabit}
        onHabitUpdate={handleHabitUpdate}
      />

      <SetupModal
        open={isSetupModalOpen}
        onOpenChange={setIsSetupModalOpen}
        onSubmit={handleInitialSetupSubmit}
        currentUserName={userProfile.userName || currentUser?.displayName || ''}
        isEditing={false} // This is for initial setup
      />
       <SetupModal // This instance is specifically for editing name from HabitForgeApp's settings
        open={isEditProfileModalOpenFromApp}
        onOpenChange={setIsEditProfileModalOpenFromApp}
        onSubmit={(name, _presets) => handleAppProfileEditSubmit(name)} // Presets are ignored here
        currentUserName={userProfile.userName}
        isEditing={true}
      />


      <InputValueModal
        open={isInputValueModalOpen}
        onOpenChange={setIsInputValueModalOpen}
        onSubmit={handleInputValueSubmit}
        habitTitle={inputValueModalContext?.habit.title || ''}
        currentValue={inputValueModalContext?.currentValue}
        unit={inputValueModalContext?.habit.measurableUnit}
      />

      <HabitReportModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        habit={selectedHabitForReport}
        habitDailyProgress={reportModalProgress}
        allHabits={habits}
        allProgressData={allProgress}
      />

      <main>
        <HabitTable
          habits={habits}
          allProgress={allProgress}
          displayedMonth={displayedMonth}
          onToggleComplete={handleToggleComplete}
          onOpenInputValueModal={openInputValueModal}
          onEditHabit={handleEditHabit}
          onDeleteHabit={handleDeleteHabit}
          onShowReport={handleShowReport}
        />
      </main>

    </div>
  );
}
