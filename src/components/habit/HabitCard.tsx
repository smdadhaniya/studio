"use client";

import type { Habit, DailyProgress } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProgressGrid } from './ProgressGrid';
import { Flame, CheckCircle, XCircle, Edit3, Trash2 } from 'lucide-react';
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

  const IconComponent = habit.icon && typeof habit.icon !== 'string' ? habit.icon : Flame;
  const cardColor = habit.color || HABIT_COLORS[parseInt(habit.id.slice(-2), 16) % HABIT_COLORS.length];


  const handleComplete = () => {
    const value = habit.trackingFormat === 'measurable' ? parseFloat(measurableValue) : undefined;
    if (habit.trackingFormat === 'measurable' && (isNaN(value as number) || measurableValue === '')) {
        // Optionally show an error or prevent completion if value is required and invalid
        // For now, allow completion even if value is not set, or treat as 0
         onToggleComplete(habit.id, todayStr, 0);
    } else {
        onToggleComplete(habit.id, todayStr, value);
    }
    setMeasurableValue(''); // Reset after submission
  };

  const handleMissed = () => {
    onToggleComplete(habit.id, todayStr); // Will mark as incomplete
  };

  return (
    <Card className={cn("flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300", cardColor, "text-primary-foreground")}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                {typeof IconComponent !== 'string' && <IconComponent className="w-7 h-7" />}
                <CardTitle className="text-xl font-semibold">{habit.title}</CardTitle>
            </div>
            <div className="flex items-center gap-1 text-lg font-medium">
                <Flame className="w-5 h-5 text-orange-300" />
                <span>{streak}</span>
            </div>
        </div>
        {habit.description && <CardDescription className="text-sm text-primary-foreground/80 pt-1">{habit.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <ProgressGrid progress={progress} habitColor="bg-background/30" />
        {habit.trackingFormat === 'measurable' && !isCompletedToday && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter value (e.g., 5)"
              value={measurableValue}
              onChange={(e) => setMeasurableValue(e.target.value)}
              className="bg-background/80 text-foreground placeholder:text-muted-foreground focus:bg-background"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t border-primary-foreground/20">
        <div className="flex gap-2">
             <Button onClick={() => onEdit(habit)} variant="outline" size="sm" className="bg-transparent hover:bg-background/20 border-primary-foreground/50 text-primary-foreground">
                <Edit3 className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button onClick={() => onDelete(habit.id)} variant="destructive" size="sm" className="bg-red-700 hover:bg-red-800 text-white">
                <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
        </div>
        <div className="flex gap-2">
        {!isCompletedToday ? (
          <Button onClick={handleComplete} variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <CheckCircle className="w-4 h-4 mr-2" /> Mark Done
          </Button>
        ) : (
          <Button onClick={handleComplete} variant="outline" size="sm" className="bg-transparent hover:bg-background/20 border-primary-foreground/50 text-primary-foreground">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Completed!
          </Button>
        )}
        {isCompletedToday && (
             <Button onClick={handleMissed} variant="outline" size="sm" className="bg-transparent hover:bg-background/20 border-primary-foreground/50 text-primary-foreground">
                <XCircle className="w-4 h-4 mr-1" /> Mark Undone
            </Button>
        )}
        </div>
      </CardFooter>
    </Card>
  );
}
