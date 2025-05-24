
import type { LucideIcon } from 'lucide-react';

export type HabitTrackingFormat = 'yes/no' | 'measurable';

export interface Habit {
  id: string;
  title: string;
  description: string;
  trackingFormat: HabitTrackingFormat;
  measurableUnit?: string; // Added for measurable habits
  createdAt: string; // ISO date string
  color?: string;
  icon?: string; // Lucide Icon name (string) or undefined
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
  hasCompletedSetup: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide Icon name (string)
  milestoneType: 'streak' | 'totalCompletions' | 'level';
  milestoneValue: number;
  xpReward?: number;
}

// For preset habits in the setup modal and create habit modal
export interface PresetHabitFormData {
  title: string;
  description: string;
  trackingFormat: HabitTrackingFormat;
  measurableUnit?: string; // Added for measurable habits
  icon: string; // Lucide Icon name (string)
}

// For the icon list in forms
export interface IconListItem {
  name: string;
  icon: LucideIcon;
}
