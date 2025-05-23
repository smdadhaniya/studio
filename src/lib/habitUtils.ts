import type { Habit, DailyProgress, UserProfile, Badge, HabitProgress } from './types';
import { LEVEL_THRESHOLDS, BADGES, XP_PER_COMPLETION, DEFAULT_USER_NAME } from './constants';
import { parseDate, getTodayDateString } from './dateUtils';
import { differenceInCalendarDays, isBefore, isEqual, subDays, format } from 'date-fns';

export function calculateStreak(habitId: string, allProgress: HabitProgress): number {
  const progress = allProgress[habitId] || [];
  if (!progress.length) return 0;

  // Sort progress by date descending to start from the most recent
  const sortedProgress = [...progress]
    .map(p => ({ ...p, dateObj: parseDate(p.date) }))
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  let streak = 0;
  let currentDate = parseDate(getTodayDateString());

  // Check if today is completed
  const todayEntry = sortedProgress.find(p => isEqual(p.dateObj, currentDate));
  if (todayEntry?.completed) {
    streak = 1;
    currentDate = subDays(currentDate, 1);
  } else {
    // If today is not completed, or no entry for today, check yesterday
    currentDate = subDays(currentDate, 1);
    const yesterdayEntry = sortedProgress.find(p => isEqual(p.dateObj, currentDate));
    if(!yesterdayEntry?.completed) return 0; // If yesterday also not completed, streak is 0
    // If yesterday was completed, continue checking from yesterday
  }


  for (const entry of sortedProgress) {
    if (entry.completed && isEqual(entry.dateObj, currentDate)) {
      if(streak === 0) streak = 1; // Start streak if it's the first matched day (e.g. yesterday)
      else if (isEqual(entry.dateObj, subDays(parseDate(sortedProgress[streak-1]?.date),1))) streak++; // Check if it's consecutive
      currentDate = subDays(currentDate, 1);
    } else if (isBefore(entry.dateObj, currentDate)) {
      // If we find an older entry but it's not for the `currentDate` we are checking, the streak is broken
      break;
    }
  }
  
  // Refined streak calculation logic
  // Start from the most recent completed day or yesterday if today is not completed
  let currentStreak = 0;
  let expectedDate = parseDate(getTodayDateString());
  const todayProgress = sortedProgress.find(p => isEqual(p.dateObj, expectedDate));

  if (!todayProgress || !todayProgress.completed) {
    expectedDate = subDays(expectedDate, 1); // Start checking from yesterday if today is not done
  }
  
  for (let i = 0; i < sortedProgress.length; i++) {
    const pDay = sortedProgress[i];
    if (pDay.completed && isEqual(pDay.dateObj, expectedDate)) {
      currentStreak++;
      expectedDate = subDays(expectedDate, 1);
    } else if (pDay.completed && isBefore(pDay.dateObj, expectedDate)) {
      // A completed day is found, but it's not the one we expect for a continuous streak
      break; 
    } else if (!pDay.completed && isEqual(pDay.dateObj, expectedDate)){
      // An uncompleted day found where we expected a completed one.
      break;
    }
    // If pDay.dateObj is after expectedDate, it means we skipped some days, keep looking
  }

  return currentStreak;
}


export function calculateLevel(xp: number): { level: number, progressToNextLevel: number, currentLevelXp: number, nextLevelXp: number } {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  level = Math.min(level, LEVEL_THRESHOLDS.length); // Cap level at max defined

  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level] || Infinity; // XP for next level (e.g., level 2 needs THRESHOLDS[1])
  
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpForNextLevel = nextLevelXp - currentLevelXp;

  const progressToNextLevel = xpForNextLevel === Infinity ? 100 : Math.max(0, Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100));

  return { level, progressToNextLevel, currentLevelXp: xpInCurrentLevel, nextLevelXp: xpForNextLevel };
}

export function checkAndAwardBadges(
  userProfile: UserProfile,
  habits: Habit[],
  allProgress: HabitProgress
): { updatedProfile: UserProfile; newBadges: Badge[] } {
  const newBadges: Badge[] = [];
  let newXpFromBadges = 0;

  for (const badge of BADGES) {
    if (userProfile.unlockedBadgeIds.includes(badge.id)) {
      continue; // Already unlocked
    }

    let eligible = false;
    if (badge.milestoneType === 'level') {
      if (userProfile.level >= badge.milestoneValue) {
        eligible = true;
      }
    } else if (badge.milestoneType === 'streak') {
      for (const habit of habits) {
        const streak = calculateStreak(habit.id, allProgress);
        if (streak >= badge.milestoneValue) {
          eligible = true;
          break;
        }
      }
    } else if (badge.milestoneType === 'totalCompletions') {
      // For 'first_completion', check across all habits
      if (badge.id === 'first_completion') {
         const anyCompletion = Object.values(allProgress).some(habitProg => habitProg.some(p => p.completed));
         if(anyCompletion && badge.milestoneValue === 1) eligible = true;
      } else {
        // For other totalCompletions badges, check per habit
        for (const habit of habits) {
          const habitCompletions = (allProgress[habit.id] || []).filter(p => p.completed).length;
          if (habitCompletions >= badge.milestoneValue) {
            eligible = true;
            break;
          }
        }
      }
    }

    if (eligible) {
      newBadges.push(badge);
      if (badge.xpReward) {
        newXpFromBadges += badge.xpReward;
      }
    }
  }

  const updatedProfile: UserProfile = {
    ...userProfile,
    xp: userProfile.xp + newXpFromBadges,
    unlockedBadgeIds: [...userProfile.unlockedBadgeIds, ...newBadges.map(b => b.id)],
  };

  // Recalculate level if XP changed
  if (newXpFromBadges > 0) {
    const { level } = calculateLevel(updatedProfile.xp);
    updatedProfile.level = level;
  }
  
  return { updatedProfile, newBadges };
}

export function getInitialUserProfile(): UserProfile {
  return {
    xp: 0,
    level: 1,
    unlockedBadgeIds: [],
    userName: DEFAULT_USER_NAME,
  };
}
