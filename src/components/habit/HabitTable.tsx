
"use client";

import type { Habit, HabitProgress, DailyProgress } from '@/lib/types';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDate, isToday, isPast, isFuture } from 'date-fns';
import { ChevronLeft, ChevronRight, Edit3, Trash2, Check } from 'lucide-react'; // Added Check icon
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
    <tr className="group hover:bg-muted/10 transition-colors">
      <td className="p-2 border border-border text-sm text-foreground sticky left-0 bg-background group-hover:bg-muted/20 z-[5] min-w-[150px] max-w-[200px] truncate" title={habit.title}>
        {habit.title}
      </td>
      {daysInMonth.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayProgress = habitProgressMap.get(dateStr);
        const isCompleted = dayProgress?.completed === true;

        let cellBgColor = 'bg-background hover:bg-muted/50';
        let squareBorderColor = 'border-muted-foreground';
        let checkColor = 'text-white';
        let content: React.ReactNode = null;

        if (isToday(day)) {
          cellBgColor = isCompleted ? 'bg-green-500 hover:bg-green-500/90' : 'bg-green-100 hover:bg-green-200/80';
          squareBorderColor = isCompleted ? 'border-white' : 'border-green-700';
          checkColor = isCompleted ? 'text-white' : 'text-green-700';
        } else if (isPast(day)) {
          cellBgColor = isCompleted ? 'bg-slate-600 hover:bg-slate-600/90' : 'bg-red-100 hover:bg-red-200/80';
          squareBorderColor = isCompleted ? 'border-white' : 'border-red-700';
          checkColor = isCompleted ? 'text-white' : 'text-red-700';
        } else { // Future days
           cellBgColor = 'bg-muted/30';
           squareBorderColor = 'border-muted-foreground/50';
           checkColor = 'text-muted-foreground/50';
        }
        
        if (isToday(day) || isPast(day)) {
            if (habit.trackingFormat === 'measurable' && isCompleted && dayProgress?.value !== undefined) {
                content = <span className={cn("text-xs font-semibold", checkColor)}>{String(dayProgress.value)}</span>;
            } else { // 'yes/no' habit or measurable but not completed with value
                content = (
                    <div className={cn(
                        "w-5 h-5 border-2 rounded-sm flex items-center justify-center",
                        squareBorderColor
                    )}>
                        {isCompleted && <Check className={cn("w-4 h-4", checkColor)} strokeWidth={3} />}
                    </div>
                );
            }
        } else { // Future days
             content = (
                <div className={cn(
                    "w-5 h-5 border-2 rounded-sm flex items-center justify-center",
                    squareBorderColor
                )}>
                </div>
            );
        }


        return (
          <td key={dateStr} className="p-0 border border-border text-center w-10 h-10">
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
                cellBgColor,
                (isFuture(day) && !isToday(day)) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              )}
              aria-label={`Mark habit ${habit.title} on ${format(day, "MMM d")} as ${isCompleted ? 'incomplete' : 'complete'}`}
            >
              {content}
            </button>
          </td>
        );
      })}
      <td className="p-2 border border-border text-sm text-foreground align-middle sticky right-0 bg-background group-hover:bg-muted/20 z-[5]">
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
      <div className="text-center py-10 mt-4 border border-dashed border-border rounded-md bg-muted/20">
        <p className="text-lg text-muted-foreground">No habits tracked yet.</p>
        <p className="text-sm text-muted-foreground/80">Click "Track New Habit" to get started!</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-card shadow-sm mt-4">
      <div className="flex justify-between items-center p-3 border-b border-border">
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
              <th className="p-2 border-b border-r border-border text-left text-sm font-medium text-muted-foreground sticky left-0 bg-muted/50 z-20 min-w-[150px] max-w-[200px]">Habit</th>
              {daysInMonth.map(day => (
                <th key={day.toISOString()} className="p-2 border-b border-r border-border text-center text-xs font-medium text-muted-foreground w-10 tabular-nums">
                  {getDate(day)}
                </th>
              ))}
              <th className="p-2 border-b border-l border-border text-center text-sm font-medium text-muted-foreground min-w-[100px] sticky right-0 bg-muted/50 z-20">Actions</th>
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

