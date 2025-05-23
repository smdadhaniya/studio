import type { LucideIcon } from 'lucide-react';

export type HabitTrackingFormat = 'yes/no' | 'measurable';

export interface Habit {
  id: string;
  title: string;
  description: string;
  trackingFormat: HabitTrackingFormat;
  createdAt: string; // ISO date string
  color?: string; // Optional color for the habit card
  icon?: LucideIcon | string; // Optional icon for the habit
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number; // For measurable habits
}

export interface HabitProgress {
  [habitId: string]: DailyProgress[];
}

export interface UserProfile {
  xp: number;
  level: number;
  unlockedBadgeIds: string[];
  userName: string; // Added userName as it's used by AI
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon | string; // Allow string for custom SVG paths if needed, or LucideIcon
  milestoneType: 'streak' | 'totalCompletions' | 'level';
  milestoneValue: number;
  xpReward?: number; // Optional XP reward for unlocking badge
}
