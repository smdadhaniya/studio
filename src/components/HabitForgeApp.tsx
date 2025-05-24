
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
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { empatheticMessage } from '@/ai/flows/empathetic-message';
import { generateMotivationalMessage } from '@/ai/flows/motivational-message';
import { PlusCircle, BellRing, Flame, Settings, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
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

  const { requestPermission, showNotification, permission } = useNotifications();

  useEffect(() => {
    const loadedHabitsInitial = loadState<Habit[]>(HABITS_KEY, []);
    const sanitizedHabits = loadedHabitsInitial.map((h, index) => {
      let iconName = typeof h.icon === 'string' ? h.icon : undefined;
      if (iconName && !HABIT_LUCIDE_ICONS_LIST.find(item => item.name === iconName)) {
        iconName = undefined;
      }
      return {
        ...h,
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
    setUserProfile(prev => ({ ...prev, userName: name, hasCompletedSetup: true }));

    const isInitialSetup = !isEditProfileModalOpen && !userProfile.hasCompletedSetup;

    if (isInitialSetup || (isEditProfileModalOpen && selectedPresetsData.length > 0)) { // Allow adding presets if editing and some were selected
        const habitsToAdd: Habit[] = [];
        selectedPresetsData.forEach((preset) => {
            const existingHabitByTitle = habits.find(h => h.title === preset.title);
            if (!existingHabitByTitle) {
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

        if (habitsToAdd.length > 0) {
          setHabits(prev => [...prev, ...habitsToAdd]);
          toast({ title: isInitialSetup ? `Welcome, ${name}!` : `Profile updated for ${name}!`, description: `${habitsToAdd.length} new habit(s) added.` });
        } else if (isInitialSetup) {
          toast({ title: `Welcome, ${name}!`, description: "No new habits added from presets, you can add them later." });
        } else { // Editing profile, no new habits added from presets this time
          toast({ title: `Profile name updated to ${name}!` });
        }
    } else if (isEditProfileModalOpen) { // Editing profile name only
        toast({ title: `Profile name updated to ${name}!` });
    }


    setIsSetupModalOpen(false);
    setIsEditProfileModalOpen(false);
  };

  const handleHabitFormSubmit = (data: HabitFormData | PresetHabitFormData[]) => {
    if (Array.isArray(data)) { // Handling an array of PresetHabitFormData
      const habitsToAdd: Habit[] = data
        .filter(preset => !habits.some(h => h.title === preset.title)) // Avoid duplicates by title
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
        toast({ title: "No New Habits Added", description: "Selected presets might already exist." });
      }
    } else { // Handling a single HabitFormData for custom habit
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        title: data.title,
        description: data.description || '',
        trackingFormat: data.trackingFormat,
        measurableUnit: data.trackingFormat === 'measurable' ? data.measurableUnit : undefined,
        targetCount: data.trackingFormat === 'measurable' ? data.targetCount : undefined,
        icon: undefined, // Icons are not handled by this form anymore for custom habits
        color: data.color || HABIT_COLORS[habits.length % HABIT_COLORS.length],
      };
      setHabits(prev => [...prev, newHabit]);
      toast({ title: "Habit Tracked!", description: `"${newHabit.title}" is now being tracked.` });
    }
    setIsCreateHabitModalOpen(false);
    setEditingHabit(null);
  };

  const handleHabitUpdate = (habitId: string, data: HabitFormData) => {
     setHabits(prev => prev.map(h => h.id === habitId ? {
        ...h, // Keep existing icon if it had one (e.g. from preset)
        title: data.title,
        description: data.description || '',
        trackingFormat: data.trackingFormat,
        measurableUnit: data.trackingFormat === 'measurable' ? data.measurableUnit : undefined,
        targetCount: data.trackingFormat === 'measurable' ? data.targetCount : undefined,
        color: data.color || h.color,
        // Icon is not updated here, as it's removed from the form
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

const handleToggleComplete = async (habitId: string, date: string, value?: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const oldStreak = calculateStreak(habitId, allProgress);

    const newAllProgressAfterToggle = (() => {
        const currentHabitSpecificProgress = allProgress[habitId] || [];
        const entryIndex = currentHabitSpecificProgress.findIndex(p => p.date === date);
        let newCompletedStatusForEntry: boolean;
        let newValueForEntry: number | undefined;

        if (entryIndex !== -1) { // Entry exists, toggle it
            newCompletedStatusForEntry = !currentHabitSpecificProgress[entryIndex].completed;
            if (newCompletedStatusForEntry) { // If checking as complete
                newValueForEntry = habit.trackingFormat === 'measurable'
                    ? (value !== undefined ? value : currentHabitSpecificProgress[entryIndex].value || habit.targetCount || 1) // Use provided value, then existing, then target, then 1
                    : undefined;
            } else { // If unchecking
                newValueForEntry = undefined; // Or keep currentHabitSpecificProgress[entryIndex].value if you want to retain value on uncheck
            }
        } else { // New entry, mark as complete
            newCompletedStatusForEntry = true;
            newValueForEntry = habit.trackingFormat === 'measurable'
                ? (value !== undefined ? value : habit.targetCount || 1) // Use provided value, then target, then 1
                : undefined;
        }

        let updatedHabitSpecificProgressList: DailyProgress[];
        if (entryIndex !== -1) {
            updatedHabitSpecificProgressList = currentHabitSpecificProgress.map((p, i) =>
                i === entryIndex ? { ...p, completed: newCompletedStatusForEntry, value: newValueForEntry } : p
            );
        } else {
            updatedHabitSpecificProgressList = [...currentHabitSpecificProgress, { date, completed: newCompletedStatusForEntry, value: newValueForEntry }];
        }
        updatedHabitSpecificProgressList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return { ...allProgress, [habitId]: updatedHabitSpecificProgressList };
    })();

    const newCompletionStatus = (newAllProgressAfterToggle[habitId] || []).find(p => p.date === date)?.completed ?? false;

    // Use newAllProgressAfterToggle for all subsequent calculations
    // setAllProgress(newAllProgressAfterToggle); // Defer this set state

    let userProfileAfterToggle = { ...userProfile };

    if (newCompletionStatus) {
      userProfileAfterToggle.xp += XP_PER_COMPLETION;
      const { updatedProfile: profileWithBadges, newBadges } = checkAndAwardBadges(
        userProfileAfterToggle, habits, newAllProgressAfterToggle // Pass newAllProgressAfterToggle
      );
      userProfileAfterToggle = profileWithBadges; // Update userProfileAfterToggle with badge XP

      const finalXp = userProfileAfterToggle.xp;
      const { level: finalLevel } = calculateLevel(finalXp);
      const oldLevel = userProfile.level; // Compare with original profile level
      userProfileAfterToggle.level = finalLevel;
      
      // setUserProfile(userProfileAfterToggle); // Defer this set state

      toast({ title: "Great Job!", description: `+${XP_PER_COMPLETION} XP for ${habit.title}!` });

      if (newBadges.length > 0) {
        newBadges.forEach(badge => {
          toast({ title: "Achievement Unlocked!", description: `You earned the "${badge.name}" badge!` });
          showNotification("Achievement Unlocked!", { body: `You earned the "${badge.name}" badge!` });
        });
      }
      
      const newStreak = calculateStreak(habitId, newAllProgressAfterToggle); // Use newAllProgressAfterToggle
      const milestoneReached = newBadges.length > 0 || (newStreak > 0 && newStreak % 5 === 0) || (finalLevel > oldLevel) || (oldStreak === 0 && newStreak === 1 && newCompletionStatus) ;

      if (milestoneReached) {
        try {
          const aiMessage = await generateMotivationalMessage({
            habitName: habit.title,
            userName: userProfileAfterToggle.userName || DEFAULT_USER_NAME, // Use updated name
            streakLength: newStreak,
            milestoneAchieved: newBadges.length > 0 ? `badge: ${newBadges[0].name}` : (finalLevel > oldLevel ? `level ${finalLevel}` : `streak of ${newStreak}`),
            brokenStreak: false,
          });
          toast({ title: "AI Coach Says:", description: aiMessage.message, duration: 7000 });
        } catch (error) {
          console.error("Error generating motivational message:", error);
        }
      }

    } else { // Habit marked as incomplete
      const newStreak = calculateStreak(habitId, newAllProgressAfterToggle); // Use newAllProgressAfterToggle
      if (oldStreak > 0 && newStreak < oldStreak) { // Streak was broken
        toast({ title: "Streak Broken", description: `Don't worry, you can start a new one!`, variant: "destructive" });
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
      // No XP change, no badge check needed if uncompleted.
      // setUserProfile(userProfileAfterToggle); // Defer this set state if any minor profile changes were made (though unlikely here)
    }
    
    // Now set all states
    setAllProgress(newAllProgressAfterToggle);
    setUserProfile(userProfileAfterToggle);
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
        <h1 className="text-lg font-bold text-primary flex items-center">
            <Flame className="w-10 h-10 mr-2 text-primary" /> Habit Track
        </h1>
        <div className="flex items-center gap-3">
            {permission !== 'granted' && (
              <Button onClick={requestPermission} variant="outline" size="sm" className="text-sm">
                  <BellRing className="w-4 h-4 mr-2"/> Enable Notifications
              </Button>
            )}
            <Button
              onClick={() => setIsEditProfileModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-sm"
              aria-label="Edit Profile"
            >
              <Settings className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
             <Button
                onClick={handleDeleteAllHabits}
                variant="destructive"
                size="sm"
                className="text-sm"
                aria-label="Delete All Habits"
            >
                <Trash2 className="w-4 h-4 mr-2" /> Delete All
            </Button>
            <Button onClick={() => { setEditingHabit(null); setIsCreateHabitModalOpen(true); }} className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm">
              <PlusCircle className="w-5 h-5 mr-2" /> Add New Habit
            </Button>
        </div>
      </header>

      <div className="mb-8 p-4 rounded-lg bg-card text-card-foreground">
        {userProfile.userName && userProfile.userName !== DEFAULT_USER_NAME && (
          <h2 className="text-[25px] font-bold mb-3 text-center md:text-left text-foreground">
            {userProfile.userName}'s Progress
          </h2>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-6 gap-y-4">
          <BadgeDisplay unlockedBadges={unlockedBadges} allPossibleBadges={BADGES} />
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

      <main>
        <HabitTable
          habits={habits}
          allProgress={allProgress}
          displayedMonth={displayedMonth}
          onToggleComplete={handleToggleComplete}
          onEditHabit={handleEditHabit}
          onDeleteHabit={handleDeleteHabit}
        />
      </main>

    </div>
  );
}
