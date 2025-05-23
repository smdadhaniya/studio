
"use client";

import type { Habit, HabitProgress, DailyProgress } from '@/lib/types';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDate, isToday, isPast, isFuture } from 'date-fns';
import { ChevronLeft, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { parseDate } from '@/lib/dateUtils';

interface HabitRowProps {
  habit: Habit;
  habitDailyProgress: DailyProgress[];
  daysInMonth: Date[];
  onToggleComplete: (habitId: string, date: string, value?: number) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

function HabitRow({
  habit,
  habitDailyProgress,
  daysInMonth,
  onToggleComplete,
  onEditHabit,
  onDeleteHabit,
}: HabitRowProps) {
  const habitProgressMap = useMemo(() => {
    const map = new Map<string, DailyProgress>();
    (habitDailyProgress || []).forEach(p => map.set(p.date, p));
    return map;
  }, [habitDailyProgress]);

  return (
    <tr className="group hover:bg-muted/10">
      <td className="p-2 border border-border text-sm text-foreground sticky left-0 bg-background group-hover:bg-muted/10 z-[5] min-w-[150px] max-w-[200px] truncate" title={habit.title}>
        {habit.title}
      </td>
      {daysInMonth.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayProgress = habitProgressMap.get(dateStr);
        const isCompleted = dayProgress?.completed === true;

        let cellBgColor = 'bg-gray-200'; // Future default
        let textColor = 'text-gray-400'; // Future default text

        if (isToday(day)) {
          cellBgColor = isCompleted ? 'bg-green-500' : 'bg-green-200';
          textColor = isCompleted ? 'text-white' : 'text-green-700';
        } else if (isPast(day)) {
          cellBgColor = isCompleted ? 'bg-slate-700' : 'bg-red-300';
          textColor = isCompleted ? 'text-white' : 'text-red-700';
        }

        const displayContent = (isToday(day) || isPast(day))
          ? (isCompleted
              ? (habit.trackingFormat === 'measurable' && dayProgress?.value !== undefined ? String(dayProgress.value) : '✔')
              : '')
          : '';

        return (
          <td key={dateStr} className="p-0 border border-border text-center w-10 h-10">
            <button
              onClick={() => {
                  if (habit.trackingFormat === 'measurable' && !isCompleted) {
                      const valStr = prompt(`Enter value for ${habit.title} on ${format(day, "MMM d")}:`, String(dayProgress?.value || 1));
                      if (valStr !== null) {
                          const val = parseFloat(valStr);
                          if (!isNaN(val)) {
                              onToggleComplete(habit.id, dateStr, val);
                          } else {
                              alert("Invalid number entered.");
                          }
                      }
                  } else {
                      onToggleComplete(habit.id, dateStr, undefined);
                  }
              }}
              disabled={isFuture(day) && !isToday(day)}
              className={cn(
                "w-full h-full flex items-center justify-center text-xs focus:outline-none focus:ring-1 focus:ring-ring/50",
                cellBgColor,
                textColor,
                (isFuture(day) && !isToday(day)) ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80 transition-opacity'
              )}
              aria-label={`Mark habit ${habit.title} on ${format(day, "MMM d")} as ${isCompleted ? 'incomplete' : 'complete'}`}
            >
              {displayContent}
            </button>
          </td>
        );
      })}
      <td className="p-2 border border-border text-sm text-foreground align-middle sticky right-0 bg-background group-hover:bg-muted/10 z-[5]">
        <div className="flex gap-1 justify-center">
          <Button onClick={() => onEditHabit(habit)} variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary">
            <Edit3 className="w-4 h-4" />
            <span className="sr-only">Edit {habit.title}</span>
          </Button>
          <Button onClick={() => onDeleteHabit(habit.id)} variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground hover:bg-destructive w-7 h-7">
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Delete {habit.title}</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}


interface HabitTableProps {
  habits: Habit[];
  allProgress: HabitProgress;
  onToggleComplete: (habitId: string, date: string, value?: number) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export function HabitTable({ habits, allProgress, onToggleComplete, onEditHabit, onDeleteHabit }: HabitTableProps) {
  const [displayedMonth, setDisplayedMonth] = useState(startOfMonth(new Date()));

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(displayedMonth);
    const end = endOfMonth(displayedMonth);
    return eachDayOfInterval({ start, end });
  }, [displayedMonth]);

  const goToPreviousMonth = () => setDisplayedMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setDisplayedMonth(prev => addMonths(prev, 1));

  if (habits.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">No habits yet. Track your first one!</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4 px-1 pb-2">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Previous month" className="w-8 h-8">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-lg font-semibold text-foreground">
          {format(displayedMonth, "MMMM yyyy")}
        </span>
        <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month" className="w-8 h-8">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <table className="min-w-full w-max border-collapse border border-border">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-2 border border-border text-left text-sm font-medium text-muted-foreground sticky left-0 bg-muted/50 z-10 min-w-[150px] max-w-[200px]">Habit</th>
            {daysInMonth.map(day => (
              <th key={day.toISOString()} className="p-2 border border-border text-center text-sm font-medium text-muted-foreground w-10">
                {getDate(day)}
              </th>
            ))}
            <th className="p-2 border border-border text-center text-sm font-medium text-muted-foreground min-w-[100px] sticky right-0 bg-muted/50 z-10">Actions</th>
          </tr>
        </thead>
        <tbody>
          {habits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              habitDailyProgress={allProgress[habit.id] || []}
              daysInMonth={daysInMonth}
              onToggleComplete={onToggleComplete}
              onEditHabit={onEditHabit}
              onDeleteHabit={onDeleteHabit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
