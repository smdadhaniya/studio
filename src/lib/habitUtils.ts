
import type { Habit, DailyProgress, UserProfile, Badge, HabitProgress } from './types';
import { LEVEL_THRESHOLDS, BADGES, XP_PER_COMPLETION, DEFAULT_USER_NAME } from './constants';
import { parseDate, getTodayDateString } from './dateUtils';
import { differenceInCalendarDays, isBefore, isEqual, subDays, format } from 'date-fns';

export function calculateStreak(habitId: string, allProgress: HabitProgress): number {
  const progress = allProgress[habitId] || [];
  if (!progress.length) return 0;

  const sortedProgress = [...progress]
    .map(p => ({ ...p, dateObj: parseDate(p.date) }))
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  let streak = 0;
  let currentDate = parseDate(getTodayDateString());

  const todayEntry = sortedProgress.find(p => isEqual(p.dateObj, currentDate));
  if (todayEntry?.completed) {
    streak = 1;
    currentDate = subDays(currentDate, 1);
  } else {
    currentDate = subDays(currentDate, 1);
    const yesterdayEntry = sortedProgress.find(p => isEqual(p.dateObj, currentDate));
    if(!yesterdayEntry?.completed && !todayEntry?.completed && progress.some(p => p.completed && isEqual(p.dateObj, subDays(parseDate(getTodayDateString()),1)))) {
      // if today not complete AND yesterday not complete, but there was a completion yesterday (edge case for when today is toggled off after being on)
       // then streak is 0, unless it's the first day and there's an entry for it
    } else if (!yesterdayEntry?.completed && !todayEntry?.completed && sortedProgress.length > 0) {
      // if neither today nor yesterday are complete, and there is progress history, streak is 0
      // unless it's the very first day and today has an entry (handled above)
       if (! (isEqual(sortedProgress[0].dateObj, parseDate(getTodayDateString())) && sortedProgress.length === 1) ) return 0;
    }

  }

  let currentStreak = 0;
  let expectedDate = parseDate(getTodayDateString());
  const todayProgress = sortedProgress.find(p => isEqual(p.dateObj, expectedDate));

  if (!todayProgress || !todayProgress.completed) {
    expectedDate = subDays(expectedDate, 1); 
  }
  
  for (let i = 0; i < sortedProgress.length; i++) {
    const pDay = sortedProgress[i];
    if (pDay.completed && isEqual(pDay.dateObj, expectedDate)) {
      currentStreak++;
      expectedDate = subDays(expectedDate, 1);
    } else if (pDay.completed && isBefore(pDay.dateObj, expectedDate)) {
      break; 
    } else if (!pDay.completed && isEqual(pDay.dateObj, expectedDate)){
      break;
    }
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
  level = Math.min(level, LEVEL_THRESHOLDS.length); 

  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level] || Infinity; 
  
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
      continue; 
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
      if (badge.id === 'first_completion') {
         const anyCompletion = Object.values(allProgress).some(habitProg => habitProg.some(p => p.completed));
         if(anyCompletion && badge.milestoneValue === 1) eligible = true;
      } else if (badge.id === 'power_user'){ // This badge counts total completions across ALL habits
        const totalCompletionsAllHabits = Object.values(allProgress).reduce((acc, habitProg) => acc + habitProg.filter(p => p.completed).length, 0);
        if (totalCompletionsAllHabits >= badge.milestoneValue) {
          eligible = true;
        }
      }
      else { // For other totalCompletions badges (like 'Dedicated Start', 'Committed', 'Perfect Week'), check per single habit
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
    hasCompletedSetup: false, // Initialize as false
  };
}
