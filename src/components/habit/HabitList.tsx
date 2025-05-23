"use client";

import type { Habit, DailyProgress, HabitProgress } from '@/lib/types';
import { HabitCard } from './HabitCard';
import { calculateStreak } from '@/lib/habitUtils';

interface HabitListProps {
  habits: Habit[];
  allProgress: HabitProgress;
  onToggleComplete: (habitId: string, date: string, value?: number) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export function HabitList({ habits, allProgress, onToggleComplete, onEditHabit, onDeleteHabit }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No habits yet. Forge your first one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
      {habits.map(habit => (
        <HabitCard
          key={habit.id}
          habit={habit}
          progress={allProgress[habit.id] || []}
          streak={calculateStreak(habit.id, allProgress)}
          onToggleComplete={onToggleComplete}
          onEdit={onEditHabit}
          onDelete={onDeleteHabit}
        />
      ))}
    </div>
  );
}
