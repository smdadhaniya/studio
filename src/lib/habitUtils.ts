import type {
  Habit,
  DailyProgress,
  UserProfile,
  Badge,
  HabitProgress,
} from "./types";
import {
  LEVEL_THRESHOLDS,
  BADGES,
  XP_PER_COMPLETION,
  DEFAULT_USER_NAME,
} from "./constants";
import { parseDate, getTodayDateString } from "./dateUtils";
import {
  differenceInCalendarDays,
  isBefore,
  isEqual,
  subDays,
  format,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  getMonth,
  getYear,
  addDays,
  startOfDay,
} from "date-fns";

export function calculateStreak(
  habitId: string,
  allProgress: HabitProgress
): number {
  const progress = allProgress[habitId] || [];
  if (!progress.length) return 0;

  const sortedProgress = [...progress]
    .map((p) => ({ ...p, dateObj: parseDate(p.date) }))
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  let streak = 0;
  let currentDate = parseDate(getTodayDateString());

  const todayEntry = sortedProgress.find((p) =>
    isEqual(p.dateObj, currentDate)
  );
  if (todayEntry?.completed) {
    streak = 1;
    currentDate = subDays(currentDate, 1);
  } else {
    currentDate = subDays(currentDate, 1);
    const yesterdayEntry = sortedProgress.find((p) =>
      isEqual(p.dateObj, currentDate)
    );
    if (
      !yesterdayEntry?.completed &&
      !todayEntry?.completed &&
      progress.some(
        (p: any) =>
          p.completed &&
          isEqual(p?.dateObj, subDays(parseDate(getTodayDateString()), 1))
      )
    ) {
      // if today not complete AND yesterday not complete, but there was a completion yesterday (edge case for when today is toggled off after being on)
      // then streak is 0, unless it's the first day and there's an entry for it
    } else if (
      !yesterdayEntry?.completed &&
      !todayEntry?.completed &&
      sortedProgress.length > 0
    ) {
      // if neither today nor yesterday are complete, and there is progress history, streak is 0
      // unless it's the very first day and today has an entry (handled above)
      if (
        !(
          isEqual(sortedProgress[0].dateObj, parseDate(getTodayDateString())) &&
          sortedProgress.length === 1
        )
      )
        return 0;
    }
  }

  let currentStreak = 0;
  let expectedDate = parseDate(getTodayDateString());
  const todayProgress = sortedProgress.find((p) =>
    isEqual(p.dateObj, expectedDate)
  );

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
    } else if (!pDay.completed && isEqual(pDay.dateObj, expectedDate)) {
      break;
    }
  }

  return currentStreak;
}

export function calculateLongestStreak(
  habitId: string,
  allProgress: HabitProgress
): number {
  const progress = allProgress[habitId] || [];
  if (!progress.length) return 0;

  const sortedProgress = [...progress]
    .map((p) => ({ ...p, dateObj: parseDate(p.date), completed: p.completed }))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Sort chronologically

  let longestStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < sortedProgress.length; i++) {
    if (sortedProgress[i].completed) {
      currentStreak++;
      if (i + 1 < sortedProgress.length) {
        // Check if next day is consecutive
        const diff = differenceInCalendarDays(
          sortedProgress[i + 1].dateObj,
          sortedProgress[i].dateObj
        );
        if (diff > 1) {
          // If not consecutive, reset current streak
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 0;
        }
      }
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak); // Final check for streak ending at last entry
  return longestStreak;
}

export function calculateOverallSuccessRate(
  habit: Habit,
  habitDailyProgress: DailyProgress[]
): {
  successRate: number;
  totalTrackedDays: number;
  completedDays: number;
  missedDays: number;
} {
  if (!habitDailyProgress.length && !habit.createdAt)
    return {
      successRate: 0,
      totalTrackedDays: 0,
      completedDays: 0,
      missedDays: 0,
    };

  const today = parseDate(getTodayDateString());
  let trackingStartDate = parseDate(habit.createdAt);

  if (habitDailyProgress.length > 0) {
    const sortedProgressDates = habitDailyProgress
      .map((p) => parseDate(p.date))
      .sort((a, b) => a.getTime() - b.getTime());

    const firstEntryDate = sortedProgressDates[0];
    if (isBefore(firstEntryDate, trackingStartDate)) {
      trackingStartDate = firstEntryDate;
    }
  }

  // Ensure trackingStartDate is not in the future relative to today
  if (isAfter(trackingStartDate, today)) {
    return {
      successRate: 0,
      totalTrackedDays: 0,
      completedDays: 0,
      missedDays: 0,
    };
  }

  const totalTrackedDays =
    differenceInCalendarDays(today, trackingStartDate) + 1;
  const completedDays = habitDailyProgress.filter((p) => p.completed).length;

  const successRate =
    totalTrackedDays > 0 ? (completedDays / totalTrackedDays) * 100 : 0;
  const missedDays = totalTrackedDays - completedDays;

  return {
    successRate: parseFloat(successRate.toFixed(1)),
    totalTrackedDays,
    completedDays,
    missedDays: Math.max(0, missedDays),
  };
}

export function getCompletionsByDayOfWeek(
  habitDailyProgress: DailyProgress[]
): Array<{ day: string; completions: number }> {
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  habitDailyProgress.forEach((p) => {
    if (p.completed) {
      const dayOfWeek = getDay(parseDate(p.date)); // 0 for Sunday, 1 for Monday, ...
      dayCounts[dayOfWeek]++;
    }
  });

  return dayLabels.map((label, index) => ({
    day: label,
    completions: dayCounts[index],
  }));
}

export function getMonthlyCompletionTrend(
  habitDailyProgress: DailyProgress[],
  M: number = 6
): Array<{ month: string; completions: number }> {
  const trend: Array<{ month: string; completions: number }> = [];
  if (!habitDailyProgress.length && M === 0) return trend;

  const today = new Date();
  for (let i = M - 1; i >= 0; i--) {
    const targetMonthStartDate = startOfMonth(subDays(today, i * 30)); // Approximate month start
    const monthName = format(targetMonthStartDate, "MMM yy");
    let completionsInMonth = 0;

    habitDailyProgress.forEach((p) => {
      if (p.completed) {
        const entryDate = parseDate(p.date);
        if (
          getMonth(entryDate) === getMonth(targetMonthStartDate) &&
          getYear(entryDate) === getYear(targetMonthStartDate)
        ) {
          completionsInMonth++;
        }
      }
    });
    trend.push({ month: monthName, completions: completionsInMonth });
  }
  return trend;
}

export function getRecentMeasurableValues(
  habitDailyProgress: DailyProgress[],
  N: number = 30
): Array<{ date: string; value: number; target?: number }> {
  return habitDailyProgress
    .filter(
      (p) => p.completed && p.value !== undefined && typeof p.value === "number"
    )
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()) // Ensure chronological order
    .map((p) => ({ date: format(parseDate(p.date), "MMM d"), value: p.value! }))
    .slice(-N);
}

export function getStreakHistory(
  habitId: string,
  allProgress: HabitProgress,
  topN: number = 3
): Array<{ length: number; endDate: string }> {
  const progress = allProgress[habitId] || [];
  if (!progress.length) return [];

  const sortedProgress = [...progress]
    .map((p) => ({ ...p, dateObj: parseDate(p.date), completed: p.completed }))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const streaks: Array<{ length: number; endDate: string }> = [];
  let currentStreak = 0;
  let currentStreakEndDate: Date | null = null;

  for (let i = 0; i < sortedProgress.length; i++) {
    const entry = sortedProgress[i];
    if (entry.completed) {
      currentStreak++;
      currentStreakEndDate = entry.dateObj;

      if (i + 1 < sortedProgress.length) {
        const nextEntry = sortedProgress[i + 1];
        const diff = differenceInCalendarDays(nextEntry.dateObj, entry.dateObj);
        if (diff > 1) {
          if (currentStreak > 0 && currentStreakEndDate) {
            streaks.push({
              length: currentStreak,
              endDate: format(currentStreakEndDate, "yyyy-MM-dd"),
            });
          }
          currentStreak = 0;
          currentStreakEndDate = null;
        }
      }
    } else {
      if (currentStreak > 0 && currentStreakEndDate) {
        streaks.push({
          length: currentStreak,
          endDate: format(currentStreakEndDate, "yyyy-MM-dd"),
        });
      }
      currentStreak = 0;
      currentStreakEndDate = null;
    }
  }

  if (currentStreak > 0 && currentStreakEndDate) {
    streaks.push({
      length: currentStreak,
      endDate: format(currentStreakEndDate, "yyyy-MM-dd"),
    });
  }

  return streaks.sort((a, b) => b.length - a.length).slice(0, topN);
}

export function getLongestCompletionGap(
  habitDailyProgress: DailyProgress[]
): number {
  const completedDates = habitDailyProgress
    .filter((p) => p.completed)
    .map((p) => parseDate(p.date))
    .sort((a, b) => a.getTime() - b.getTime());

  if (completedDates.length < 2) return 0;

  let longestGap = 0;
  for (let i = 0; i < completedDates.length - 1; i++) {
    const gap =
      differenceInCalendarDays(completedDates[i + 1], completedDates[i]) - 1;
    if (gap > longestGap) {
      longestGap = gap;
    }
  }
  return longestGap;
}

export function calculateLevel(xp: number): {
  level: number;
  progressToNextLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
} {
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

  const progressToNextLevel =
    xpForNextLevel === Infinity
      ? 100
      : Math.max(0, Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100));

  return {
    level,
    progressToNextLevel,
    currentLevelXp: xpInCurrentLevel,
    nextLevelXp: xpForNextLevel,
  };
}

export function checkAndAwardBadges(
  userProfile: UserProfile,
  habits: Habit[],
  allProgress: HabitProgress
): { updatedProfile: UserProfile; newBadges: Badge[] } {
  const newBadges: Badge[] = [];
  let newXpFromBadges = 0;

  for (const badge of BADGES) {
    if (userProfile?.unlockedBadgeIds?.includes(badge.id)) {
      continue;
    }

    let eligible = false;
    if (badge.milestoneType === "level") {
      if (userProfile.level >= badge.milestoneValue) {
        eligible = true;
      }
    } else if (badge.milestoneType === "streak") {
      for (const habit of habits) {
        const currentStr = calculateStreak(habit.id, allProgress);
        if (currentStr >= badge.milestoneValue) {
          eligible = true;
          break;
        }
        const longestStr = calculateLongestStreak(habit.id, allProgress);
        if (longestStr >= badge.milestoneValue) {
          eligible = true;
          break;
        }
      }
    } else if (badge.milestoneType === "totalCompletions") {
      if (badge.id === "first_completion") {
        const anyCompletion = Object.values(allProgress).some((habitProg) =>
          habitProg.some((p) => p.completed)
        );
        if (anyCompletion && badge.milestoneValue === 1) eligible = true;
      } else if (badge.id === "power_user") {
        const totalCompletionsAllHabits = Object.values(allProgress).reduce(
          (acc, habitProg) => acc + habitProg.filter((p) => p.completed).length,
          0
        );
        if (totalCompletionsAllHabits >= badge.milestoneValue) {
          eligible = true;
        }
      } else {
        for (const habit of habits) {
          const habitCompletions = (allProgress[habit.id] || []).filter(
            (p) => p.completed
          ).length;
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

  const updatedProfile: any = {
    ...userProfile,
    xp: userProfile.xp + newXpFromBadges,
    unlockedBadgeIds: [
      ...userProfile?.unlockedBadgeIds,
      ...newBadges?.map((b) => b.id),
    ],
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
    hasCompletedSetup: false, // Changed to false to trigger setup on first load
    isSubscribed: false, // Initialize subscription status
  };
}

// Helper to check if a date is after another, ignoring time.
function isAfter(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() > startOfDay(date2).getTime();
}
