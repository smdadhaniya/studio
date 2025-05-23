
"use client";

import type { Habit, DailyProgress } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProgressGrid } from './ProgressGrid';
import { Flame, CheckCircle, XCircle, Edit3, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getTodayDateString, isSameDay } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { HABIT_COLORS } from '@/lib/constants';

interface HabitCardProps {
  habit: Habit;
  progress: DailyProgress[];
  streak: number;
  onToggleComplete: (habitId: string, date: string, value?: number) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId:string) => void;
}

export function HabitCard({ habit, progress, streak, onToggleComplete, onEdit, onDelete }: HabitCardProps) {
  const [measurableValue, setMeasurableValue] = useState<string>('');

  const todayStr = getTodayDateString();
  const todayProgress = useMemo(() => progress.find(p => isSameDay(p.date, todayStr)), [progress, todayStr]);
  const isCompletedToday = todayProgress?.completed === true;

  const IconComponent: LucideIcon = typeof habit.icon === 'function' ? habit.icon : Flame;
  
  const habitBaseColor = habit.color || HABIT_COLORS[parseInt(habit.id.slice(-2), 16) % HABIT_COLORS.length];
  const iconColorClass = habitBaseColor.startsWith('bg-') ? habitBaseColor.replace('bg-', 'text-') : 'text-primary';


  const handleComplete = () => {
    const value = habit.trackingFormat === 'measurable' ? parseFloat(measurableValue) : undefined;
    if (habit.trackingFormat === 'measurable' && (isNaN(value as number) || measurableValue === '')) {
         onToggleComplete(habit.id, todayStr, 0);
    } else {
        onToggleComplete(habit.id, todayStr, value);
    }
    setMeasurableValue('');
  };

  const handleMissed = () => {
    onToggleComplete(habit.id, todayStr); 
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-stretch sm:items-center p-3 sm:p-4 border rounded-lg shadow-sm gap-3 sm:gap-4",
      "bg-card text-card-foreground"
    )}>

      {/* Left Section: Icon, Title, Description */}
      <div className="flex-shrink-0 sm:w-auto sm:max-w-[20%] md:max-w-[25%] space-y-1">
        <div className="flex items-center gap-2">
          <IconComponent className={cn("w-5 h-5 sm:w-6 sm:h-6", iconColorClass)} />
          <h3 className="font-semibold text-lg truncate" title={habit.title}>{habit.title}</h3> {/* text-base sm:text-lg to text-lg (18px) */}
        </div>
        {habit.description && (
          <p className="text-sm text-muted-foreground hidden md:block truncate" title={habit.description}> {/* text-xs to text-sm (14px) */}
            {habit.description}
          </p>
        )}
        <div className="flex sm:hidden gap-1 pt-1"> {/* Mobile Edit/Delete */}
            <Button onClick={() => onEdit(habit)} variant="ghost" size="sm" className="text-sm p-1 h-auto"> {/* text-xs to text-sm (14px) */}
                <Edit3 className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button onClick={() => onDelete(habit.id)} variant="ghost" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive text-sm p-1 h-auto"> {/* text-xs to text-sm (14px) */}
                <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
        </div>
      </div>

      {/* Middle Section: Progress Grid */}
      <div className="flex-grow min-w-0"> 
        <ProgressGrid progress={progress} habitColor={habitBaseColor} />
      </div>

      {/* Right Section: Streak, Value Input, Actions */}
      <div className="flex-shrink-0 sm:w-auto sm:max-w-[30%] md:max-w-[25%] flex flex-col items-start sm:items-end gap-2 mt-2 sm:mt-0">
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground"> {/* text-xs sm:text-sm to text-sm (14px) */}
          <Flame className="w-4 h-4 text-orange-400" />
          <span>{streak} Day Streak</span>
        </div>

        {habit.trackingFormat === 'measurable' && !isCompletedToday && (
          <Input
            type="number"
            placeholder="Value"
            value={measurableValue}
            onChange={(e) => setMeasurableValue(e.target.value)}
            className="h-8 text-sm w-full sm:max-w-[100px]" /* Ensure text-sm (14px) */
          />
        )}

        <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {!isCompletedToday ? (
            <Button onClick={handleComplete} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground h-8 text-sm flex-grow sm:flex-grow-0"> {/* text-xs to text-sm (14px) */}
              <CheckCircle className="w-3 h-3 mr-1" /> Mark Done
            </Button>
          ) : (
            <Button onClick={handleComplete} variant="outline" size="sm" className="h-8 text-sm border-green-500 text-green-600 hover:bg-green-50 flex-grow sm:flex-grow-0"> {/* text-xs to text-sm (14px) */}
              <CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Done!
            </Button>
          )}
          {isCompletedToday && (
             <Button onClick={handleMissed} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 text-sm flex-grow sm:flex-grow-0"> {/* text-xs to text-sm (14px) */}
                <XCircle className="w-3 h-3 mr-1" /> Undone
            </Button>
          )}
        </div>
         <div className="hidden sm:flex gap-1 mt-1"> {/* Desktop Edit/Delete */}
            <Button onClick={() => onEdit(habit)} variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground">
                <Edit3 className="w-4 h-4" />
                <span className="sr-only">Edit</span>
            </Button>
            <Button onClick={() => onDelete(habit.id)} variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground hover:bg-destructive w-7 h-7">
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </div>
      </div>
    </div>
  );
}
