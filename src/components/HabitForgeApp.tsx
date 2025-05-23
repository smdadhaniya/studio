
"use client";

import type { Habit, HabitProgress, UserProfile, Badge as BadgeType } from '@/lib/types';
import type { HabitFormData } from '@/components/habit/HabitForm';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadState, saveState } from '@/lib/localStorageUtils';
import { calculateStreak, calculateLevel, checkAndAwardBadges, getInitialUserProfile } from '@/lib/habitUtils';
import { getTodayDateString, parseDate } from '@/lib/dateUtils';
import { CreateHabitModal } from '@/components/habit/CreateHabitModal';
import { HabitList } from '@/components/habit/HabitList';
import { XPDisplay } from '@/components/user/XPDisplay';
import { BadgeDisplay } from '@/components/user/BadgeDisplay';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { empatheticMessage } from '@/ai/flows/empathetic-message';
import { generateMotivationalMessage } from '@/ai/flows/motivational-message';
import { PlusCircle, Settings, BellRing, Flame, CheckCircle, ListChecks, Target } from 'lucide-react';
import { BADGES, XP_PER_COMPLETION, HABIT_COLORS, DEFAULT_USER_NAME } from '@/lib/constants';
import type { LucideIcon } from 'lucide-react';

const habitIconsList: { name: string, Icon: LucideIcon }[] = [
    { name: "Check", Icon: CheckCircle },
    { name: "Tasks", Icon: ListChecks },
    { name: "Target", Icon: Target },
];


const HABITS_KEY = 'habitForge_habits';
const PROGRESS_KEY = 'habitForge_progress';
const USER_PROFILE_KEY = 'habitForge_userProfile';

export default function HabitForgeApp() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [allProgress, setAllProgress] = useState<HabitProgress>({});
  const [userProfile, setUserProfile] = useState<UserProfile>(getInitialUserProfile());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const { requestPermission, showNotification, permission } = useNotifications();

  useEffect(() => {
    setHabits(loadState<Habit[]>(HABITS_KEY, []));
    setAllProgress(loadState<HabitProgress>(PROGRESS_KEY, {}));
    setUserProfile(loadState<UserProfile>(USER_PROFILE_KEY, getInitialUserProfile()));
    
    if (Notification.permission === 'default') {
        // Maybe prompt after a small delay or a user interaction
        // requestPermission(); 
    }
  }, [requestPermission]);

  useEffect(() => { saveState(HABITS_KEY, habits); }, [habits]);
  useEffect(() => { saveState(PROGRESS_KEY, allProgress); }, [allProgress]);
  useEffect(() => { saveState(USER_PROFILE_KEY, userProfile); }, [userProfile]);

  const handleHabitFormSubmit = (data: HabitFormData) => {
    const habitIconEntry = habitIconsList.find(icon => icon.name === data.icon);
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
      icon: habitIconEntry ? habitIconEntry.Icon : Flame, // Default to Flame if not found
      color: data.color || HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)],
    };
    setHabits(prev => [...prev, newHabit]);
    setIsModalOpen(false);
    setEditingHabit(null);
    toast({ title: "Habit Tracked!", description: `"${newHabit.title}" is now being tracked.` });
  };

  const handleHabitUpdate = (habitId: string, data: HabitFormData) => {
     const habitIconEntry = habitIconsList.find(icon => icon.name === data.icon);
     setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...data, icon: habitIconEntry ? habitIconEntry.Icon : h.icon, color: data.color || h.color } : h));
     setIsModalOpen(false);
     setEditingHabit(null);
     toast({ title: "Habit Updated!", description: `"${data.title}" has been updated.` });
  };
  
  const handleEditHabit = (habit: Habit) => {
    const iconName = typeof habit.icon === 'function' ? (habit.icon as LucideIcon)?.displayName || habitIconsList[0].name : habitIconsList[0].name;
    setEditingHabit({...habit, icon: iconName});
    setIsModalOpen(true);
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

    // Update progress
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
      return { ...prev, [habitId]: updatedHabitProgress };
    });
    
    const newCompletionStatus = !wasCompleted; 

    if (newCompletionStatus) { 
      let newXp = userProfile.xp + XP_PER_COMPLETION;
      const { updatedProfile: profileWithBadges, newBadges } = checkAndAwardBadges(
        {...userProfile, xp: newXp}, habits, {...allProgress, [habitId]: [...(allProgress[habitId] || []), { date, completed: true, value }]} 
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
      
      const newStreak = calculateStreak(habitId, {...allProgress, [habitId]: [...(allProgress[habitId] || []), { date, completed: true, value }]});
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
      const newStreak = calculateStreak(habitId, {...allProgress, [habitId]: (allProgress[habitId] || []).map(p => p.date === date ? {...p, completed: false} : p) }); 
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

  const { level, progressToNextLevel, currentLevelXp, nextLevelXp } = useMemo(() => {
    const {level: l, progressToNextLevel: p, currentLevelXp: clXp, nextLevelXp: nlXp} = calculateLevel(userProfile.xp);
    return {level:l, progressToNextLevel:p, currentLevelXp:clXp, nextLevelXp:nlXp};
  }, [userProfile.xp]);

  const unlockedBadges = useMemo(() => {
    return BADGES.filter(b => userProfile.unlockedBadgeIds.includes(b.id));
  }, [userProfile.unlockedBadgeIds]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-lg font-bold text-primary flex items-center"> {/* Changed text-4xl to text-lg (18px) */}
            <Flame className="w-10 h-10 mr-2 text-primary" /> Habit Track
        </h1>
        <div className="flex items-center gap-3">
             {permission !== 'granted' && (
                <Button onClick={requestPermission} variant="outline" size="sm" className="text-sm"> {/* Ensure button text is 14px */}
                    <BellRing className="w-4 h-4 mr-2"/> Enable Notifications
                </Button>
            )}
          <Button onClick={() => { setEditingHabit(null); setIsModalOpen(true); }} className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm"> {/* Ensure button text is 14px */}
            <PlusCircle className="w-5 h-5 mr-2" /> Track New Habit
          </Button>
        </div>
      </header>

      <CreateHabitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onHabitCreate={handleHabitFormSubmit}
        editingHabit={editingHabit}
        onHabitUpdate={handleHabitUpdate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <XPDisplay 
            xp={userProfile.xp} 
            level={level} 
            progressToNextLevel={progressToNextLevel}
            currentLevelXpDisplay={currentLevelXp}
            nextLevelXpThresholdDisplay={nextLevelXp}
             />
          <BadgeDisplay unlockedBadges={unlockedBadges} allPossibleBadges={BADGES} />
        </div>
        <main className="lg:col-span-3">
          <HabitList 
            habits={habits} 
            allProgress={allProgress} 
            onToggleComplete={handleToggleComplete}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        </main>
      </div>
      
    </div>
  );
}
