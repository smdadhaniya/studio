
"use client";

import type { Habit, HabitProgress, UserProfile, PresetHabitFormData, DailyProgress } from '@/lib/types';
import type { HabitFormData } from '@/components/habit/HabitForm';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadState, saveState } from '@/lib/localStorageUtils';
import { calculateStreak, calculateLevel, checkAndAwardBadges, getInitialUserProfile } from '@/lib/habitUtils';
import { CreateHabitModal } from '@/components/habit/CreateHabitModal';
import { SetupModal } from '@/components/user/SetupModal';
import { HabitTable } from '@/components/habit/HabitTable';
import { BadgeDisplay } from '@/components/user/BadgeDisplay';
import { InputValueModal } from '@/components/habit/InputValueModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"; // Added Popover
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { empatheticMessage } from '@/ai/flows/empathetic-message';
import { generateMotivationalMessage } from '@/ai/flows/motivational-message';
import { PlusCircle, BellRing, Flame, Settings, ChevronLeft, ChevronRight, Trash2, User, MessageSquare, Bookmark } from 'lucide-react';
import { BADGES, XP_PER_COMPLETION, HABIT_COLORS, HABIT_LUCIDE_ICONS_LIST, DEFAULT_USER_NAME } from '@/lib/constants';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';

const HABITS_KEY = 'habitForge_habits';
const PROGRESS_KEY = 'habitForge_progress';
const USER_PROFILE_KEY = 'habitForge_userProfile';

export default function HabitForgeApp() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [allProgress, setAllProgress] = useState<HabitProgress>({});
  const [userProfile, setUserProfile] = useState<UserProfile>(getInitialUserProfile());
  const [isCreateHabitModalOpen, setIsCreateHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [displayedMonth, setDisplayedMonth] = useState(startOfMonth(new Date()));

  const [isInputValueModalOpen, setIsInputValueModalOpen] = useState(false);
  const [inputValueModalContext, setInputValueModalContext] = useState<{ habitId: string, date: string, habit: Habit, currentValue?: number } | null>(null);
  const [isBookmarkPopoverOpen, setIsBookmarkPopoverOpen] = useState(false); // State for bookmark popover

  const { requestPermission, showNotification, permission } = useNotifications();

  useEffect(() => {
    const loadedHabitsInitial = loadState<Habit[]>(HABITS_KEY, []);
    const sanitizedHabits = loadedHabitsInitial.map((h, index) => {
      let iconName = typeof h.icon === 'string' ? h.icon : undefined;
      if (iconName && !HABIT_LUCIDE_ICONS_LIST.find(item => item.name === iconName)) {
        iconName = undefined; // Clear invalid icon name
      }
      return {
        ...h,
        icon: iconName, // Store only the name
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

    const loadedProfile = loadState<UserProfile>(USER_PROFILE_KEY, getInitialUserProfile());
    setUserProfile(loadedProfile);

    if (!loadedProfile.hasCompletedSetup) {
      setIsSetupModalOpen(true);
    }
  }, []);

  useEffect(() => { saveState(HABITS_KEY, habits); }, [habits]);
  useEffect(() => { saveState(PROGRESS_KEY, allProgress); }, [allProgress]);
  useEffect(() => { saveState(USER_PROFILE_KEY, userProfile); }, [userProfile]);

  const handleSetupSubmit = (name: string, selectedPresetsData: PresetHabitFormData[]) => {
    const isInitialSetup = !userProfile.hasCompletedSetup;
    const effectiveName = name.trim() === '' ? (userProfile.userName || DEFAULT_USER_NAME) : name.trim();

    setUserProfile(prev => ({ ...prev, userName: effectiveName, hasCompletedSetup: true }));

    const habitsToAdd: Habit[] = [];
    if (selectedPresetsData.length > 0) {
        selectedPresetsData.forEach((preset) => {
            const existingHabitByTitle = habits.find(h => h.title === preset.title);
            if (!existingHabitByTitle) { // Only add if title doesn't exist
                habitsToAdd.push({
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    title: preset.title,
                    description: preset.description,
                    trackingFormat: preset.trackingFormat,
                    measurableUnit: preset.measurableUnit,
                    targetCount: preset.targetCount,
                    icon: preset.icon,
                    color: HABIT_COLORS[(habits.length + habitsToAdd.length) % HABIT_COLORS.length],
                });
            }
        });
    }

    if (habitsToAdd.length > 0) {
      setHabits(prev => [...prev, ...habitsToAdd]);
      toast({ title: isInitialSetup ? `Welcome, ${effectiveName}!` : `Profile updated for ${effectiveName}!`, description: `${habitsToAdd.length} new habit(s) added.` });
    } else if (isInitialSetup) {
      toast({ title: `Welcome, ${effectiveName}!`, description: "No new habits added from presets, you can add them later." });
    } else if (isEditProfileModalOpen) { // Only for profile editing (name change)
        toast({ title: `Profile name updated to ${effectiveName}!` });
    }

    setIsSetupModalOpen(false);
    setIsEditProfileModalOpen(false);
  };

  const handleHabitFormSubmit = (data: HabitFormData | PresetHabitFormData[]) => {
    if (Array.isArray(data)) { // Coming from CreateHabitModal's preset tab
      const habitsToAdd: Habit[] = data
        .filter(preset => !habits.some(h => h.title === preset.title)) // Prevent duplicates by title
        .map((preset, indexOffset) => ({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          title: preset.title,
          description: preset.description,
          trackingFormat: preset.trackingFormat,
          measurableUnit: preset.measurableUnit,
          targetCount: preset.targetCount,
          icon: preset.icon,
          color: HABIT_COLORS[(habits.length + indexOffset) % HABIT_COLORS.length],
      }));

      if (habitsToAdd.length > 0) {
        setHabits(prev => [...prev, ...habitsToAdd]);
        toast({ title: `${habitsToAdd.length} Preset Habit(s) Added!`, description: `Successfully added new habits from presets.` });
      } else {
        toast({ title: "No New Habits Added", description: "Selected presets might already exist or none were selected." });
      }
    } else { // Coming from CreateHabitModal's custom tab (HabitFormData)
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        title: data.title,
        description: data.description || '',
        trackingFormat: data.trackingFormat,
        measurableUnit: data.trackingFormat === 'measurable' ? data.measurableUnit : undefined,
        targetCount: data.trackingFormat === 'measurable' ? data.targetCount : undefined,
        icon: data.icon, // Icon name string or undefined from form
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
        ...h, // Preserve existing color and other fields not in form
        title: data.title,
        description: data.description || '',
        trackingFormat: data.trackingFormat,
        measurableUnit: data.trackingFormat === 'measurable' ? data.measurableUnit : undefined,
        targetCount: data.trackingFormat === 'measurable' ? data.targetCount : undefined,
        icon: data.icon, // Icon name string or undefined from form
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

  const openInputValueModal = (habit: Habit, date: string, currentValue?: number) => {
    setInputValueModalContext({ habitId: habit.id, date, habit, currentValue });
    setIsInputValueModalOpen(true);
  };

  const processHabitCompletionEffects = async (habit: Habit, updatedProgressForEffects: HabitProgress, previousUserProfile: UserProfile, date: string, wasJustCompleted: boolean) => {
    let userProfileAfterToggle = { ...previousUserProfile };
    const oldStreak = calculateStreak(habit.id, allProgress); // Calculate old streak based on *current* allProgress (before this specific toggle fully applied to state)

    if (wasJustCompleted) {
      userProfileAfterToggle.xp += XP_PER_COMPLETION;
      toast({ title: "Great Job!", description: `+${XP_PER_COMPLETION} XP for ${habit.title}!` });
    }

    // Pass the potentially updated progress for accurate badge checking
    const { updatedProfile: profileWithBadges, newBadges } = checkAndAwardBadges(
      userProfileAfterToggle, habits, updatedProgressForEffects
    );
    userProfileAfterToggle = profileWithBadges;

    const finalXp = userProfileAfterToggle.xp;
    const { level: finalLevel } = calculateLevel(finalXp);
    const oldLevel = previousUserProfile.level; // Use level from profile *before* this toggle's XP
    userProfileAfterToggle.level = finalLevel;


    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        toast({ title: "Achievement Unlocked!", description: `You earned the "${badge.name}" badge!` });
        showNotification("Achievement Unlocked!", { body: `You earned the "${badge.name}" badge!` });
      });
    }

    const newStreakAfterUpdate = calculateStreak(habit.id, updatedProgressForEffects);
    const milestoneReached = newBadges.length > 0 || (newStreakAfterUpdate > 0 && newStreakAfterUpdate % 5 === 0) || (finalLevel > oldLevel) || (oldStreak === 0 && newStreakAfterUpdate === 1 && wasJustCompleted);

    if (wasJustCompleted && milestoneReached) {
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
    } else if (!wasJustCompleted) { // Habit was marked as incomplete
      // Check if a streak was broken due to this action
      if (oldStreak > 0 && newStreakAfterUpdate < oldStreak) { // Streak has indeed decreased
        toast({ title: "Streak Broken", description: `For ${habit.title}. Don't worry, you can start a new one!`, variant: "destructive" });
        try {
          const aiMessage = await empatheticMessage({
            habitName: habit.title,
            streakLength: oldStreak, // Report the length of the streak that was broken
          });
          toast({ title: "A Little Setback...", description: aiMessage.message, duration: 7000 });
          showNotification("Streak Broken", { body: `For ${habit.title}. ${aiMessage.message}` });
        } catch (error) {
          console.error("Error generating empathetic message:", error);
        }
      }
    }
    setUserProfile(userProfileAfterToggle); // Save all accumulated changes to user profile
  };

  const handleInputValueSubmit = async (submittedValue?: number) => {
    if (!inputValueModalContext) return;
    const { habitId, date, habit } = inputValueModalContext;

    const currentProgressForHabit = allProgress[habitId] || [];
    const entryIndex = currentProgressForHabit.findIndex(p => p.date === date);
    const wasPreviouslyCompleted = entryIndex !== -1 ? currentProgressForHabit[entryIndex].completed : false;
    const previousValue = entryIndex !== -1 ? currentProgressForHabit[entryIndex].value : undefined;

    const isNowCompleted = submittedValue !== undefined && submittedValue > 0 && submittedValue >= (habit.targetCount || 1);
    const newValueForEntry = submittedValue; // Store the actual value entered, or undefined if cleared

    // Construct the new progress state *before* calling side effects
    let newAllProgress = { ...allProgress };
    let updatedHabitSpecificProgressList: DailyProgress[];

    if (entryIndex !== -1) {
        updatedHabitSpecificProgressList = currentProgressForHabit.map((p, i) =>
            i === entryIndex ? { ...p, completed: isNowCompleted, value: newValueForEntry } : p
        );
    } else {
        updatedHabitSpecificProgressList = [...currentProgressForHabit, { date, completed: isNowCompleted, value: newValueForEntry }];
    }
    updatedHabitSpecificProgressList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    newAllProgress[habitId] = updatedHabitSpecificProgressList;
    
    setAllProgress(newAllProgress); // Apply the state update for the grid

    // Determine if this action specifically marked the habit as *newly* completed
    // (was not complete before, or value changed to meet target)
    const justMarkedComplete = !wasPreviouslyCompleted && isNowCompleted;
    // const justMarkedIncomplete = wasPreviouslyCompleted && !isNowCompleted; // Not directly used, but available

    await processHabitCompletionEffects(habit, newAllProgress, userProfile, date, justMarkedComplete || (isNowCompleted && submittedValue !== previousValue));


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
    const currentProgressForHabit = allProgress[habitId] || [];
    const entryIndex = currentProgressForHabit.findIndex(p => p.date === date);
    const wasPreviouslyCompleted = entryIndex !== -1 ? currentProgressForHabit[entryIndex].completed : false;
    const isNowCompleted = !wasPreviouslyCompleted;

    // Construct the new progress state *before* calling side effects
    let newAllProgress = { ...allProgress };
    let updatedHabitSpecificProgressList: DailyProgress[];

    if (entryIndex !== -1) {
        updatedHabitSpecificProgressList = currentProgressForHabit.map((p, i) =>
            i === entryIndex ? { ...p, completed: isNowCompleted } : p
        );
    } else {
        updatedHabitSpecificProgressList = [...currentProgressForHabit, { date, completed: isNowCompleted }];
    }
    updatedHabitSpecificProgressList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    newAllProgress[habitId] = updatedHabitSpecificProgressList;
    
    setAllProgress(newAllProgress); // Apply the state update for the grid

    // For yes/no, isNowCompleted directly tells if it was *just* marked complete (if it wasn't before)
    await processHabitCompletionEffects(habit, newAllProgress, userProfile, date, isNowCompleted);
  };


  const unlockedBadges = useMemo(() => {
    return BADGES.filter(b => userProfile.unlockedBadgeIds.includes(b.id));
  }, [userProfile.unlockedBadgeIds]);

  const goToPreviousMonth = () => setDisplayedMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setDisplayedMonth(prev => addMonths(prev, 1));

  if (!userProfile.hasCompletedSetup && !isEditProfileModalOpen) {
    return (
      <SetupModal
        open={isSetupModalOpen}
        onOpenChange={setIsSetupModalOpen}
        onSubmit={handleSetupSubmit}
        isEditing={false}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
            <Flame className="w-10 h-10 mr-1 text-primary" />
            <h1 className="text-lg font-bold text-primary">
                Habit Track
            </h1>
            <Popover open={isBookmarkPopoverOpen} onOpenChange={setIsBookmarkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary/80 w-8 h-8 ml-1"
                  aria-label="Bookmark"
                >
                  <Bookmark className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <Button
                  size="sm"
                  onClick={() => {
                    toast({ title: "Bookmark Saved!", description: "Your current view has been bookmarked (simulated)." });
                    setIsBookmarkPopoverOpen(false);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Save Bookmark
                </Button>
              </PopoverContent>
            </Popover>
        </div>
        <div className="flex items-center gap-3">
            <Button onClick={() => { setEditingHabit(null); setIsCreateHabitModalOpen(true); }} className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm">
              <PlusCircle className="w-5 h-5 mr-2" /> Add New Habit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="text-sm w-9 h-9">
                  <Settings className="w-5 h-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsEditProfileModalOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
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
                  onSelect={handleDeleteAllHabits}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete All Habits</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      <div className="mb-8 p-4 rounded-lg bg-card text-card-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-6 gap-y-4">
           <div className="flex-1 min-w-0">
            {userProfile.userName && userProfile.userName !== DEFAULT_USER_NAME && (
              <h2 className="text-[25px] font-bold mb-1 text-left text-foreground">
                {userProfile.userName}'s Progress
              </h2>
            )}
            <BadgeDisplay unlockedBadges={unlockedBadges} allPossibleBadges={BADGES} />
          </div>
          <div className="flex items-center justify-center md:justify-end gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Previous month" className="w-8 h-8">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-lg font-semibold text-foreground tabular-nums min-w-[120px] text-center">
              {format(displayedMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Next month" className="w-8 h-8">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <CreateHabitModal
        open={isCreateHabitModalOpen}
        onOpenChange={setIsCreateHabitModalOpen}
        onHabitCreate={handleHabitFormSubmit}
        editingHabit={editingHabit}
        onHabitUpdate={handleHabitUpdate}
      />

      <SetupModal
        open={isSetupModalOpen || isEditProfileModalOpen}
        onOpenChange={isEditProfileModalOpen ? setIsEditProfileModalOpen : setIsSetupModalOpen}
        onSubmit={handleSetupSubmit}
        currentUserName={userProfile.userName}
        isEditing={isEditProfileModalOpen || (userProfile.hasCompletedSetup && !isSetupModalOpen)}
      />

      <InputValueModal
        open={isInputValueModalOpen}
        onOpenChange={setIsInputValueModalOpen}
        onSubmit={handleInputValueSubmit}
        habitTitle={inputValueModalContext?.habit.title || ''}
        currentValue={inputValueModalContext?.currentValue}
        unit={inputValueModalContext?.habit.measurableUnit}
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
        />
      </main>

    </div>
  );
}
