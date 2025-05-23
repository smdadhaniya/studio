import type { Badge } from './types';
import { Award, Zap, Trophy, Star, ShieldCheck, CalendarDays, Sunrise, TrendingUp, Activity, Gem } from 'lucide-react';

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
    id: 'dedicated_start',
    name: 'Dedicated Start',
    description: 'Complete any habit 5 times.',
    icon: Sunrise,
    milestoneType: 'totalCompletions',
    milestoneValue: 5,
    xpReward: 25,
  },
  {
    id: 'consistent_performer',
    name: 'Consistent Performer',
    description: 'Achieve a 3-day streak on any habit.',
    icon: TrendingUp,
    milestoneType: 'streak',
    milestoneValue: 3,
    xpReward: 30,
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
    id: 'habit_committed', // This was originally 'Committed' for 15 completions of a single habit
    name: 'Committed',
    description: 'Log 15 completions for any single habit.',
    icon: ShieldCheck,
    milestoneType: 'totalCompletions', 
    milestoneValue: 15, 
    xpReward: 75,
  },
  {
    id: 'perfect_week', // This was 'Perfect Week' for 7 completions in a row for a specific habit
    name: 'Perfect Week',
    description: 'Complete a habit every day for a full week (7 completions).',
    icon: CalendarDays,
    milestoneType: 'totalCompletions', 
    milestoneValue: 7,
    xpReward: 60,
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
    id: 'power_user',
    name: 'Power User',
    description: 'Log 50 total completions across all habits.',
    icon: Activity,
    milestoneType: 'totalCompletions',
    milestoneValue: 50,
    xpReward: 100,
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
    id: 'level_10_hero',
    name: 'Level 10 Hero',
    description: 'Reach Level 10 in your habit journey.',
    icon: Gem,
    milestoneType: 'level',
    milestoneValue: 10,
    xpReward: 150,
  }
];

export const MAX_PROGRESS_DAYS = 30;

