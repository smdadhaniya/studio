
import type { LucideIcon } from 'lucide-react'; // Keep for now if any non-habit/badge UI elements use it, otherwise can be removed.

export type HabitTrackingFormat = 'yes/no' | 'measurable';

export interface Habit {
  id: string;
  title: string;
  description: string;
  trackingFormat: HabitTrackingFormat;
  createdAt: string; // ISO date string
  color?: string; // Optional color for the habit card
  icon?: string; // Emoji character
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
  userName: string;
  hasCompletedSetup?: boolean; // Added to track initial setup
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji character
  milestoneType: 'streak' | 'totalCompletions' | 'level';
  milestoneValue: number;
  xpReward?: number;
}

// For preset habits in the setup modal
export interface PresetHabitFormData {
  title: string;
  description: string;
  trackingFormat: HabitTrackingFormat;
  icon: string; // Emoji character
}
