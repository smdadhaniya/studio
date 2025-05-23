import type { Badge } from './types';
import { Award, Zap, Trophy, Star, ShieldCheck, CalendarDays } from 'lucide-react';

export const XP_PER_COMPLETION = 10;
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000]; // XP needed to reach level (index + 1)

export const DEFAULT_USER_NAME = "Habit Tracker";

export const HABIT_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

export const BADGES: Badge[] = [
  {
    id: 'first_completion',
    name: 'First Step',
    description: 'Complete a habit for the first time.',
    icon: Star,
    milestoneType: 'totalCompletions',
    milestoneValue: 1,
    xpReward: 5,
  },
  {
    id: '7_day_streak',
    name: 'Week Warrior',
    description: 'Maintain a habit streak for 7 days.',
    icon: Zap,
    milestoneType: 'streak',
    milestoneValue: 7,
    xpReward: 50,
  },
  {
    id: '30_day_streak',
    name: 'Month Master',
    description: 'Maintain a habit streak for 30 days.',
    icon: Trophy,
    milestoneType: 'streak',
    milestoneValue: 30,
    xpReward: 200,
  },
  {
    id: 'level_5',
    name: 'Level 5 Reached',
    description: 'Reach Level 5 in your habit journey.',
    icon: Award,
    milestoneType: 'level',
    milestoneValue: 5,
    xpReward: 100,
  },
  {
    id: 'habit_committed',
    name: 'Committed',
    description: 'Log 15 completions for any single habit.',
    icon: ShieldCheck,
    milestoneType: 'totalCompletions', // This would be per habit, logic needs to handle this
    milestoneValue: 15, // This refers to total completions for a specific habit
    xpReward: 75,
  },
   {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete a habit every day for a full week (7 completions).',
    icon: CalendarDays,
    milestoneType: 'totalCompletions', // Could also be streak of 7, but named for any 7 completions in a row
    milestoneValue: 7, // This refers to total completions for a specific habit in a row
    xpReward: 60,
  }
];

export const MAX_PROGRESS_DAYS = 30;
