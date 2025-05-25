
"use client";

import type { Habit, DailyProgress, HabitProgress } from '@/lib/types';
import { useMemo } from 'react';
import { calculateStreak } from '@/lib/habitUtils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, CheckCircle2, XCircle, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { HABIT_LUCIDE_ICONS_LIST } from '@/lib/constants';

interface HabitReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  habitDailyProgress: DailyProgress[];
  allHabits: Habit[]; // For streak calculation context
  allProgressData: HabitProgress; // For streak calculation context
}

export function HabitReportModal({
  isOpen,
  onOpenChange,
  habit,
  habitDailyProgress,
  allHabits,
  allProgressData,
}: HabitReportModalProps) {
  const IconComponent = useMemo(() => {
    if (habit?.icon && typeof habit.icon === 'string') {
      return HABIT_LUCIDE_ICONS_LIST.find(item => item.name === habit.icon)?.icon;
    }
    return null;
  }, [habit]);

  const streak = useMemo(() => {
    if (habit) {
      return calculateStreak(habit.id, allProgressData);
    }
    return 0;
  }, [habit, allProgressData]);

  const totalCompletions = useMemo(() => {
    return habitDailyProgress.filter(p => p.completed).length;
  }, [habitDailyProgress]);

  const completedEntries = useMemo(() => {
    return habitDailyProgress
      .filter(p => p.completed)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [habitDailyProgress]);

  if (!habit) {
    return null; // Or a minimal dialog saying "No habit selected"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            {IconComponent && <IconComponent className="w-6 h-6 mr-2 text-primary" />}
            Report for: {habit.title}
          </DialogTitle>
          <DialogDescription>
            Detailed progress overview for your habit.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 grid gap-4 md:grid-cols-2 max-h-[70vh] overflow-y-auto pr-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Habit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <p><strong className="text-muted-foreground">Description:</strong> {habit.description || 'N/A'}</p>
              <p><strong className="text-muted-foreground">Tracking Format:</strong> {habit.trackingFormat === 'yes/no' ? 'Yes/No' : 'Measurable'}</p>
              {habit.trackingFormat === 'measurable' && (
                <>
                  <p><strong className="text-muted-foreground">Unit:</strong> {habit.measurableUnit || 'N/A'}</p>
                  <p><strong className="text-muted-foreground">Target:</strong> {habit.targetCount !== undefined ? habit.targetCount : 'N/A'} {habit.measurableUnit}</p>
                </>
              )}
              <p><strong className="text-muted-foreground">Created:</strong> {format(parseISO(habit.createdAt), 'PPP')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Streak:</span>
                <span className="font-semibold text-md text-primary">{streak} day{streak === 1 ? '' : 's'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Completions:</span>
                <span className="font-semibold text-md text-accent">{totalCompletions}</span>
              </div>
              {habit.trackingFormat === 'measurable' && habitDailyProgress.filter(p => p.completed).length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average Value:</span>
                  <span className="font-semibold text-md">
                    {(habitDailyProgress.filter(p => p.completed).reduce((sum, p) => sum + (p.value || 0), 0) / habitDailyProgress.filter(p => p.completed).length).toFixed(1)} {habit.measurableUnit}
                  </span>
                </div>
              )}
               {habit.trackingFormat === 'measurable' && habitDailyProgress.filter(p => p.completed).length === 0 && (
                 <p className="text-xs text-muted-foreground">No measurable completions logged yet.</p>
               )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Completion Log</CardTitle>
              <CardDescription className="text-xs">Showing {completedEntries.length} completed entries (most recent first).</CardDescription>
            </CardHeader>
            <CardContent>
              {completedEntries.length > 0 ? (
                <ScrollArea className="h-[180px] pr-2">
                  <ul className="space-y-1.5">
                    {completedEntries.map(entry => (
                      <li key={entry.date} className="flex items-center justify-between text-xs p-1.5 rounded-md bg-muted/50">
                        <span className="flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-600" />
                          {format(parseISO(entry.date), 'EEE, MMM d, yyyy')}
                        </span>
                        {habit.trackingFormat === 'measurable' && entry.value !== undefined && (
                          <span className="font-medium text-foreground">{entry.value} {habit.measurableUnit}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <p className="text-xs text-muted-foreground">No completions logged yet for this habit.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
