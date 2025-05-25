
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadState } from '@/lib/localStorageUtils';
import { calculateStreak } from '@/lib/habitUtils';
import type { Habit, HabitProgress, DailyProgress } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, CheckCircle2, XCircle, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link'; // For the back button

const HABITS_KEY = 'habitForge_habits';
const PROGRESS_KEY = 'habitForge_progress';

export default function HabitReportPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.habitId as string;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [habitDailyProgress, setHabitDailyProgress] = useState<DailyProgress[]>([]);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [allProgressData, setAllProgressData] = useState<HabitProgress>({});

  useEffect(() => {
    const loadedHabits = loadState<Habit[]>(HABITS_KEY, []);
    const loadedProgress = loadState<HabitProgress>(PROGRESS_KEY, {});
    
    setAllHabits(loadedHabits);
    setAllProgressData(loadedProgress);

    if (habitId) {
      const currentHabit = loadedHabits.find(h => h.id === habitId);
      setHabit(currentHabit || null);
      setHabitDailyProgress(loadedProgress[habitId] || []);
    }
  }, [habitId]);

  const streak = useMemo(() => {
    if (habit && habitId) {
      return calculateStreak(habitId, allProgressData);
    }
    return 0;
  }, [habit, habitId, allProgressData]);

  const totalCompletions = useMemo(() => {
    return habitDailyProgress.filter(p => p.completed).length;
  }, [habitDailyProgress]);

  const completedEntries = useMemo(() => {
    return habitDailyProgress
      .filter(p => p.completed)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()); // Show most recent first
  }, [habitDailyProgress]);

  if (!habit) {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Report Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The habit report you're looking for could not be found or loaded.</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                     <Button onClick={() => router.push('/')} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tracker
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          {habit.icon && typeof habit.icon === 'string' && (
            <span className="mr-3 text-3xl">{habit.icon}</span>
          )}
          Report for: {habit.title}
        </h1>
        <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tracker
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Habit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Streak:</span>
              <span className="font-semibold text-lg text-primary">{streak} day{streak === 1 ? '' : 's'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Completions:</span>
              <span className="font-semibold text-lg text-accent">{totalCompletions}</span>
            </div>
            {habit.trackingFormat === 'measurable' && habitDailyProgress.length > 0 && (
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average Value:</span>
                    <span className="font-semibold text-lg">
                        {(habitDailyProgress.reduce((sum, p) => sum + (p.value || 0), 0) / habitDailyProgress.length).toFixed(1)} {habit.measurableUnit}
                    </span>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Completion Log</CardTitle>
            <CardDescription>Showing {completedEntries.length} completed entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {completedEntries.length > 0 ? (
              <ScrollArea className="h-[200px] pr-3">
                <ul className="space-y-2">
                  {completedEntries.map(entry => (
                    <li key={entry.date} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                      <span className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
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
              <p className="text-sm text-muted-foreground">No completions logged yet for this habit.</p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Placeholder for future charts */}
      {/* 
      <Card className="mt-6">
        <CardHeader><CardTitle>Progress Chart (Coming Soon)</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">A visual chart of your progress will be displayed here.</p></CardContent>
      </Card> 
      */}
    </div>
  );
}
