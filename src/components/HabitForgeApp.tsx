
"use client";

import type { Habit, HabitProgress, UserProfile, PresetHabitFormData } from '@/lib/types';
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
import { PlusCircle, BellRing, Flame, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
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
        iconName = HABIT_LUCIDE_ICONS_LIST[0]?.name || undefined; // Fallback to first in list or undefined
      }
      return {
        ...h,
        icon: iconName,
        color: (typeof h.color === 'string' && HABIT_COLORS.includes(h.color))
               ? h.color
               : HABIT_COLORS[index % HABIT_COLORS.length]
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

    if (Notification.permission === 'default') {
        // requestPermission();
    }
  }, [requestPermission]);

  useEffect(() => { saveState(HABITS_KEY, habits); }, [habits]);
  useEffect(() => { saveState(PROGRESS_KEY, allProgress); }, [allProgress]);
  useEffect(() => { saveState(USER_PROFILE_KEY, userProfile); }, [userProfile]);

  const handleSetupSubmit = (name: string, selectedPresetHabits: PresetHabitFormData[]) => {
    setUserProfile(prev => ({ ...prev, userName: name, hasCompletedSetup: true }));

    const newHabitsFromPresets: Habit[] = selectedPresetHabits.map((preset, index) => {
      return {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        title: preset.title,
        description: preset.description,
        trackingFormat: preset.trackingFormat,
        icon: preset.icon,
        color: HABIT_COLORS[(habits.length + index) % HABIT_COLORS.length],
      };
    });

    setHabits(prev => [...prev, ...newHabitsFromPresets]);
    toast({ title: "Welcome, " + name + "!", description: "Your Habit Track is ready." });
    setIsSetupModalOpen(false);
    setIsEditProfileModalOpen(false);
  };

  const handleHabitFormSubmit = (data: HabitFormData) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
      color: data.color || HABIT_COLORS[habits.length % HABIT_COLORS.length],
    };
    setHabits(prev => [...prev, newHabit]);
    setIsCreateHabitModalOpen(false);
    setEditingHabit(null);
    toast({ title: "Habit Tracked!", description: `"${newHabit.title}" is now being tracked.` });
  };

  const handleHabitUpdate = (habitId: string, data: HabitFormData) => {
     setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...data, icon: data.icon, color: data.color || h.color } : h));
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

  const handleToggleComplete = async (habitId: string, date: string, value?: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const oldStreak = calculateStreak(habitId, allProgress);
    const wasCompleted = (allProgress[habitId] || []).find(p => p.date === date)?.completed;

    setAllProgress(prev => {
      const habitProgress = prev[habitId] || [];
      const existingEntryIndex = habitProgress.findIndex(p => p.date === date);
      let updatedHabitProgress: typeof habitProgress;

      if (existingEntryIndex !== -1) {
        updatedHabitProgress = habitProgress.map((p, index) =>
          index === existingEntryIndex ? { ...p, completed: !p.completed, value: !p.completed ? value : undefined } : p
        );
      } else {
        updatedHabitProgress = [...habitProgress, { date, completed: true, value }];
      }
      updatedHabitProgress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { ...prev, [habitId]: updatedHabitProgress };
    });

    const newCompletionStatus = !wasCompleted;
    const updatedProgressForStreak = { ...allProgress };
    const tempHabitProgress = updatedProgressForStreak[habitId] ? [...updatedProgressForStreak[habitId]] : [];
    const entryIndex = tempHabitProgress.findIndex(p => p.date === date);
    if (entryIndex !== -1) {
        tempHabitProgress[entryIndex] = { ...tempHabitProgress[entryIndex], completed: newCompletionStatus, value: newCompletionStatus ? value : undefined };
    } else {
        tempHabitProgress.push({ date, completed: newCompletionStatus, value });
    }
    tempHabitProgress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    updatedProgressForStreak[habitId] = tempHabitProgress;


    if (newCompletionStatus) {
      let newXp = userProfile.xp + XP_PER_COMPLETION;
      const { updatedProfile: profileWithBadges, newBadges } = checkAndAwardBadges(
        {...userProfile, xp: newXp}, habits, updatedProgressForStreak
      );

      const finalXp = profileWithBadges.xp;
      const { level: finalLevel } = calculateLevel(finalXp);
      setUserProfile({...profileWithBadges, level: finalLevel});

      toast({ title: "Great Job!", description: `+${XP_PER_COMPLETION} XP for ${habit.title}!` });

      if (newBadges.length > 0) {
        newBadges.forEach(badge => {
          toast({ title: "Achievement Unlocked!", description: `You earned the "${badge.name}" badge!` });
          showNotification("Achievement Unlocked!", { body: `You earned the "${badge.name}" badge!` });
        });
      }

      const newStreak = calculateStreak(habitId, updatedProgressForStreak);
      const milestoneReached = newBadges.length > 0 || (newStreak > 0 && newStreak % 5 === 0) || (finalLevel > userProfile.level);

      if (milestoneReached) {
        try {
          const aiMessage = await generateMotivationalMessage({
            habitName: habit.title,
            userName: userProfile.userName || DEFAULT_USER_NAME,
            streakLength: newStreak,
            milestoneAchieved: newBadges.length > 0 ? newBadges[0].name : `Streak of ${newStreak}`,
            brokenStreak: false,
          });
          toast({ title: "AI Coach Says:", description: aiMessage.message, duration: 7000 });
        } catch (error) {
          console.error("Error generating motivational message:", error);
          toast({ title: "AI Coach Offline", description: "Keep up the great work!", variant: "destructive" });
        }
      }

    } else {
      const newStreak = calculateStreak(habitId, updatedProgressForStreak);
      if (oldStreak > 0 && newStreak < oldStreak) {
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
    }
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
            <Button onClick={() => { setEditingHabit(null); setIsCreateHabitModalOpen(true); }} className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm">
              <PlusCircle className="w-5 h-5 mr-2" /> Track New Habit
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
        isEditing={isEditProfileModalOpen || userProfile.hasCompletedSetup}
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

    