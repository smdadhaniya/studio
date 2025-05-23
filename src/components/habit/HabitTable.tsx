
"use client";

import type { Habit, HabitProgress, DailyProgress } from '@/lib/types';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDate, isToday, isPast, isFuture } from 'date-fns';
import { ChevronLeft, ChevronRight, Edit3, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HABIT_LUCIDE_ICONS_LIST } from '@/lib/constants';

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

  const IconComponent = habit.icon ? HABIT_LUCIDE_ICONS_LIST.find(item => item.name === habit.icon)?.icon : null;

  return (
    <tr className="group hover:bg-muted/10 transition-colors border-b">
      <td className="p-2 border-r text-foreground sticky left-0 bg-background group-hover:bg-muted/20 z-[5] min-w-[120px] max-w-[160px] truncate" title={habit.title}>
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="w-4 h-4 text-muted-foreground" />}
          <span>{habit.title}</span>
        </div>
      </td>
      {daysInMonth.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayProgress = habitProgressMap.get(dateStr);
        const isCompleted = dayProgress?.completed === true;

        let checkboxSquareBg = '';
        let checkboxSquareBorder = '';
        let contentColor = ''; // For checkmark or measurable value text

        if (isToday(day)) {
            if (isCompleted) {
                checkboxSquareBg = 'bg-green-500';
                checkboxSquareBorder = 'border-green-600';
                contentColor = 'text-white';
            } else { // Incomplete Today
                checkboxSquareBg = 'bg-green-100';
                checkboxSquareBorder = 'border-green-500';
                contentColor = 'text-green-700';
            }
        } else if (isPast(day)) {
            if (isCompleted) {
                checkboxSquareBg = 'bg-slate-600';
                checkboxSquareBorder = 'border-slate-700';
                contentColor = 'text-white';
            } else { // Missed Past
                checkboxSquareBg = 'bg-red-200';
                checkboxSquareBorder = 'border-red-500';
                contentColor = 'text-red-700';
            }
        } else { // Future days
            checkboxSquareBg = 'bg-gray-100';
            checkboxSquareBorder = 'border-gray-400';
            contentColor = 'text-gray-500';
        }

        let buttonInnerContent: React.ReactNode = null;
        const squareBaseClasses = "w-4 h-4 border-2 rounded-sm flex items-center justify-center";

        if (habit.trackingFormat === 'measurable' && isCompleted && dayProgress?.value !== undefined) {
            buttonInnerContent = (
                <div className={cn(squareBaseClasses, checkboxSquareBg, checkboxSquareBorder)}>
                    <span className={cn("text-xs font-semibold", contentColor)}>{String(dayProgress.value)}</span>
                </div>
            );
        } else {
            buttonInnerContent = (
                <div className={cn(squareBaseClasses, checkboxSquareBg, checkboxSquareBorder)}>
                    {isCompleted && <Check className={cn("w-3 h-3", contentColor)} strokeWidth={3} />}
                </div>
            );
        }


        return (
          <td key={dateStr} className="p-0 text-center w-8 h-8">
            <button
              onClick={() => {
                  if (isFuture(day) && !isToday(day)) return;
                  if (habit.trackingFormat === 'measurable' && !isCompleted) {
                      const valStr = prompt(`Enter value for ${habit.title} on ${format(day, "MMM d")}:`, String(dayProgress?.value || 1));
                      if (valStr !== null) {
                          const val = parseFloat(valStr);
                          if (!isNaN(val) && val > 0) {
                              onToggleComplete(habit.id, dateStr, val);
                          } else if (valStr.trim() === "") {
                                onToggleComplete(habit.id, dateStr, undefined);
                          } else {
                              alert("Invalid number entered. Please enter a positive number.");
                          }
                      }
                  } else {
                      onToggleComplete(habit.id, dateStr, undefined);
                  }
              }}
              disabled={isFuture(day) && !isToday(day)}
              className={cn(
                "w-full h-full flex items-center justify-center text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring/70 focus:z-10 relative transition-colors",
                "bg-background hover:bg-muted/50",
                (isFuture(day) && !isToday(day)) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              )}
              aria-label={`Mark habit ${habit.title} on ${format(day, "MMM d")} as ${isCompleted ? 'incomplete' : 'complete'}`}
            >
              {buttonInnerContent}
            </button>
          </td>
        );
      })}
      <td className="p-2 border-l text-foreground align-middle sticky right-0 bg-background group-hover:bg-muted/20 z-[5] min-w-[80px]">
        <div className="flex gap-1 justify-center">
          <Button onClick={() => onEditHabit(habit)} variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary hover:bg-primary/10">
            <Edit3 className="w-4 h-4" />
            <span className="sr-only">Edit {habit.title}</span>
          </Button>
          <Button onClick={() => onDeleteHabit(habit.id)} variant="ghost" size="icon" className="w-7 h-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
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
      <div className="text-center py-10 mt-4 border border-dashed rounded-md bg-muted/20">
        <p className="text-lg text-muted-foreground">No habits tracked yet.</p>
        <p className="text-sm text-muted-foreground/80">Click "Track New Habit" to get started!</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border rounded-lg bg-card shadow-sm mt-4">
      <div className="flex justify-between items-center p-3 border-b">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Previous month" className="w-8 h-8">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-lg font-semibold text-foreground tabular-nums">
          {format(displayedMonth, "MMMM yyyy")}
        </span>
        <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Next month" className="w-8 h-8">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full w-max border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-2 border-b border-r text-left font-medium text-muted-foreground sticky left-0 bg-muted/50 z-20 min-w-[120px] max-w-[160px]">Habit</th>
              {daysInMonth.map(day => (
                <th key={day.toISOString()} className="p-2 border-b text-center font-medium text-muted-foreground w-8 tabular-nums">
                  {getDate(day)}
                </th>
              ))}
              <th className="p-2 border-b border-l text-center font-medium text-muted-foreground min-w-[80px] sticky right-0 bg-muted/50 z-20">Actions</th>
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
    </div>
  );
}
