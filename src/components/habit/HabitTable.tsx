
"use client";

import type { Habit, HabitProgress, DailyProgress } from '@/lib/types';
import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDate, isToday, isPast, isFuture } from 'date-fns';
import { Edit3, Trash2, Check, GripVertical, BarChart2 } from 'lucide-react'; // Added BarChart2
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HABIT_LUCIDE_ICONS_LIST } from '@/lib/constants';

interface HabitRowProps {
  habit: Habit;
  habitDailyProgress: DailyProgress[];
  daysInMonth: Date[];
  onToggleComplete: (habitId: string, date: string) => void;
  onOpenInputValueModal: (habit: Habit, date: string, currentValue?: number) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onShowReport: (habitId: string) => void; // New prop
}

function HabitRow({
  habit,
  habitDailyProgress,
  daysInMonth,
  onToggleComplete,
  onOpenInputValueModal,
  onEditHabit,
  onDeleteHabit,
  onShowReport, // New prop
}: HabitRowProps) {
  const habitProgressMap = useMemo(() => {
    const map = new Map<string, DailyProgress>();
    (habitDailyProgress || []).forEach(p => map.set(p.date, p));
    return map;
  }, [habitDailyProgress]);

  const IconComponent = habit.icon && typeof habit.icon === 'string' ? HABIT_LUCIDE_ICONS_LIST.find(item => item.name === habit.icon)?.icon : null;

  return (
    <tr className="group hover:bg-muted/10 transition-colors border-b border-border">
      <td className="p-2 text-foreground sticky left-0 bg-background group-hover:bg-muted/20 z-[5] min-w-[120px] max-w-[160px] truncate border-r border-border" title={habit.title}>
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="w-4 h-4 text-muted-foreground" />}
          <span>{habit.title}</span>
        </div>
      </td>
      {daysInMonth.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayProgress = habitProgressMap.get(dateStr);
        const isCompleted = dayProgress?.completed === true;

        let cellBackground = 'bg-background hover:bg-muted/50'; 
        let contentColor = 'text-foreground';
        let buttonInnerContent: React.ReactNode = null;

        const isDisabledFuture = isFuture(day) && !isToday(day);

        if (habit.trackingFormat === 'measurable') {
          if (isCompleted && dayProgress?.value !== undefined) {
            buttonInnerContent = <span className="text-xs font-semibold">{String(dayProgress.value)}</span>;
            contentColor = isToday(day) ? 'text-white' : 'text-white'; 
            cellBackground = isToday(day) ? 'bg-green-500' : 'bg-slate-600';
          } else {
            buttonInnerContent = <GripVertical className="w-3 h-3 text-muted-foreground/70" />; 
            cellBackground = isToday(day) ? 'bg-green-100 hover:bg-green-200' : (isPast(day) ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200');
            contentColor = isToday(day) ? 'text-green-700' : (isPast(day) ? 'text-red-700' : 'text-gray-500');
          }
           if (isDisabledFuture) {
             cellBackground = 'bg-gray-100 cursor-not-allowed';
             contentColor = 'text-gray-400';
             buttonInnerContent = <span className="text-xs">-</span>;
           }

        } else {
          const squareBaseClasses = "w-4 h-4 border-2 rounded-sm flex items-center justify-center";
          let checkboxSquareBg = '';
          let checkboxSquareBorder = 'border-border'; // Default to theme border
          
          if (isToday(day)) {
              checkboxSquareBg = isCompleted ? 'bg-green-500' : 'bg-green-100';
              checkboxSquareBorder = isCompleted ? 'border-green-600' : 'border-green-500';
              contentColor = isCompleted ? 'text-white' : 'text-green-700';
          } else if (isPast(day)) {
              checkboxSquareBg = isCompleted ? 'bg-slate-600' : 'bg-red-200'; // Updated for better contrast potentially
              checkboxSquareBorder = isCompleted ? 'border-slate-700' : 'border-red-500';
              contentColor = isCompleted ? 'text-white' : 'text-red-700';
          } else { 
              checkboxSquareBg = 'bg-gray-100';
              checkboxSquareBorder = 'border-gray-400';
              contentColor = 'text-gray-500';
          }

          buttonInnerContent = (
              <div className={cn(squareBaseClasses, checkboxSquareBg, checkboxSquareBorder)}>
                  {isCompleted && <Check className={cn("w-3 h-3", contentColor)} strokeWidth={3} />}
              </div>
          );
          cellBackground = 'bg-background hover:bg-muted/50';
           if (isDisabledFuture) {
             buttonInnerContent = (
                <div className={cn(squareBaseClasses, 'bg-gray-100 border-gray-300 opacity-70')}>
                </div>
             );
           }
        }

        return (
          <td key={dateStr} className="p-0 text-center w-8 h-8">
            <button
              onClick={() => {
                  if (isDisabledFuture) return;
                  if (habit.trackingFormat === 'measurable') {
                      onOpenInputValueModal(habit, dateStr, dayProgress?.value);
                  } else {
                      onToggleComplete(habit.id, dateStr);
                  }
              }}
              disabled={isDisabledFuture}
              className={cn(
                "w-full h-full flex items-center justify-center text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring/70 focus:z-10 relative transition-colors",
                cellBackground,
                isDisabledFuture ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              )}
              aria-label={`Log habit ${habit.title} on ${format(day, "MMM d")}`}
            >
              <div className={cn(contentColor)}>{buttonInnerContent}</div>
            </button>
          </td>
        );
      })}
      <td className="p-2 text-foreground align-middle sticky right-0 bg-background group-hover:bg-muted/20 z-[5] min-w-[110px] border-l border-border"> {/* Increased min-width slightly */}
        <div className="flex gap-1 justify-center">
          <Button onClick={() => onEditHabit(habit)} variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary hover:bg-primary/10" aria-label={`Edit ${habit.title}`}>
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button onClick={() => onShowReport(habit.id)} variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-accent hover:bg-accent/10" aria-label={`Show report for ${habit.title}`}>
            <BarChart2 className="w-4 h-4" />
          </Button>
          <Button onClick={() => onDeleteHabit(habit.id)} variant="ghost" size="icon" className="w-7 h-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10" aria-label={`Delete ${habit.title}`}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}


interface HabitTableProps {
  habits: Habit[];
  allProgress: HabitProgress;
  displayedMonth: Date;
  onToggleComplete: (habitId: string, date: string) => void;
  onOpenInputValueModal: (habit: Habit, date: string, currentValue?: number) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onShowReport: (habitId: string) => void; // New prop
}

export function HabitTable({
  habits,
  allProgress,
  displayedMonth,
  onToggleComplete,
  onOpenInputValueModal,
  onEditHabit,
  onDeleteHabit,
  onShowReport, // New prop
}: HabitTableProps) {
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(displayedMonth);
    const end = endOfMonth(displayedMonth);
    return eachDayOfInterval({ start, end });
  }, [displayedMonth]);


  if (habits.length === 0) {
    return (
      <div className="text-center py-10 mt-4 border border-dashed border-border rounded-md bg-muted/20">
        <p className="text-lg text-muted-foreground">No habits tracked yet.</p>
        <p className="text-sm text-muted-foreground/80">Click "Add New Habit" to get started!</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-card shadow-sm mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full w-max border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-2 border-b border-r border-border text-left font-medium text-muted-foreground sticky left-0 bg-muted/50 z-20 min-w-[120px] max-w-[160px]">Habit</th>
              {daysInMonth.map(day => (
                <th key={day.toISOString()} className="p-2 border-b border-border text-center font-medium text-muted-foreground w-8 tabular-nums">
                  {getDate(day)}
                </th>
              ))}
              <th className="p-2 border-b border-l border-border text-center font-medium text-muted-foreground min-w-[110px] sticky right-0 bg-muted/50 z-20">Actions</th>
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
                onOpenInputValueModal={onOpenInputValueModal}
                onEditHabit={onEditHabit}
                onDeleteHabit={onDeleteHabit}
                onShowReport={onShowReport} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
