
"use client";

import type { Habit, DailyProgress, HabitProgress } from '@/lib/types';
import { useMemo, useEffect, useState } from 'react';
import {
  calculateStreak,
  calculateLongestStreak,
  calculateOverallSuccessRate,
  getCompletionsByDayOfWeek,
  getMonthlyCompletionTrend,
  getRecentMeasurableValues,
  getStreakHistory,
  getLongestCompletionGap,
} from '@/lib/habitUtils';
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
import { Target, TrendingUp, CalendarDays, BarChartHorizontalBig, PieChartIcon, History, ListChecks, CheckCircle2, Award, Star, Lightbulb } from 'lucide-react';
import { format, parseISO, startOfDay, endOfMonth, eachDayOfInterval, isSameDay, getDay, startOfMonth as dfnsStartOfMonth, isToday } from 'date-fns';
import { HABIT_LUCIDE_ICONS_LIST } from '@/lib/constants';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

interface HabitReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  habitDailyProgress: DailyProgress[];
  allHabits: Habit[]; 
  allProgressData: HabitProgress;
}

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
const PIE_CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--muted))"]; // For success rate pie chart

export function HabitReportModal({
  isOpen,
  onOpenChange,
  habit,
  habitDailyProgress,
  allHabits, 
  allProgressData,
}: HabitReportModalProps) {
  const [clientRendered, setClientRendered] = useState(false);
  useEffect(() => {
    setClientRendered(true);
  }, []);


  const IconComponent = useMemo(() => {
    if (habit?.icon && typeof habit.icon === 'string') {
      return HABIT_LUCIDE_ICONS_LIST.find(item => item.name === habit.icon)?.icon;
    }
    return Lightbulb; // Default icon
  }, [habit]);

  const currentStreak = useMemo(() => {
    if (habit) return calculateStreak(habit.id, allProgressData);
    return 0;
  }, [habit, allProgressData]);

  const longestStreak = useMemo(() => {
    if (habit) return calculateLongestStreak(habit.id, allProgressData);
    return 0;
  }, [habit, allProgressData]);

  const totalCompletions = useMemo(() => {
    return habitDailyProgress.filter(p => p.completed).length;
  }, [habitDailyProgress]);

  const overallSuccessData = useMemo(() => {
    if (habit) return calculateOverallSuccessRate(habit, habitDailyProgress);
    return { successRate: 0, totalTrackedDays: 0, completedDays: 0, missedDays: 0 };
  }, [habit, habitDailyProgress]);

  const averageValuePerCompletion = useMemo(() => {
    if (habit?.trackingFormat === 'measurable') {
        const completedWithValue = habitDailyProgress.filter(p => p.completed && typeof p.value === 'number');
        if (completedWithValue.length > 0) {
            const sum = completedWithValue.reduce((acc, p) => acc + p.value!, 0);
            return (sum / completedWithValue.length).toFixed(1);
        }
    }
    return null;
  }, [habit, habitDailyProgress]);
  
  const successPieData = useMemo(() => {
    if (overallSuccessData.totalTrackedDays === 0) return []; // Avoid pie chart with no data
    return [
      { name: 'Completed', value: overallSuccessData.completedDays, fill: PIE_CHART_COLORS[0] },
      { name: 'Missed', value: Math.max(0, overallSuccessData.missedDays), fill: PIE_CHART_COLORS[1]}, // Ensure missed is not negative
    ];
  }, [overallSuccessData]);

  const dayOfWeekData = useMemo(() => {
    return getCompletionsByDayOfWeek(habitDailyProgress);
  }, [habitDailyProgress]);
  const dayOfWeekChartConfig = { completions: { label: "Completions", color: CHART_COLORS[0] } };

  const monthlyTrendData = useMemo(() => {
    return getMonthlyCompletionTrend(habitDailyProgress, 6);
  }, [habitDailyProgress]);
  const monthlyTrendChartConfig = { completions: { label: "Completions", color: CHART_COLORS[1] } };

  const recentValuesData = useMemo(() => {
    if (habit?.trackingFormat === 'measurable') {
      const data = getRecentMeasurableValues(habitDailyProgress, 30);
      return data.map(d => ({...d, target: habit.targetCount}))
    }
    return [];
  }, [habit, habitDailyProgress]);
   const recentValuesChartConfig = {
    value: { label: habit?.measurableUnit || "Value", color: CHART_COLORS[2] },
    ...(habit?.targetCount !== undefined ? { target: { label: "Target", color: CHART_COLORS[4] } } : {})
  };

  const displayedCalendarMonth = useMemo(() => new Date(), []); // Show current month in calendar
  const currentMonthDays = useMemo(() => {
    if (!habit) return [];
    const start = dfnsStartOfMonth(displayedCalendarMonth);
    const end = endOfMonth(displayedCalendarMonth);
    return eachDayOfInterval({ start, end }).map(day => {
      const progressOnDay = habitDailyProgress.find(p => isSameDay(parseISO(p.date), day));
      return {
        date: day,
        isCompleted: progressOnDay?.completed || false,
        value: progressOnDay?.value
      };
    });
  }, [habit, habitDailyProgress, displayedCalendarMonth]);

  const streakHistory = useMemo(() => {
    if (habit) return getStreakHistory(habit.id, allProgressData, 3);
    return [];
  }, [habit, allProgressData]);

  const longestGap = useMemo(() => {
    return getLongestCompletionGap(habitDailyProgress);
  }, [habitDailyProgress]);

  const completedEntriesLog = useMemo(() => {
    return habitDailyProgress
      .filter(p => p.completed)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 100);
  }, [habitDailyProgress]);

  if (!habit || !clientRendered) { // Ensure client has rendered before trying to display charts
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-3xl lg:max-w-4xl bg-card text-card-foreground max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <IconComponent className="w-6 h-6 mr-2 text-primary" />
            Report for: {habit.title}
          </DialogTitle>
          <DialogDescription>
            Detailed progress overview and analysis for your habit.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-160px)] pr-4">
          <div className="py-4 grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><Target className="w-5 h-5 mr-2 text-primary" />Details & Key Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div><strong className="text-muted-foreground">Description:</strong> {habit.description || 'N/A'}</div>
                <div><strong className="text-muted-foreground">Tracking:</strong> {habit.trackingFormat === 'yes/no' ? 'Yes/No' : `Measurable`}</div>
                {habit.trackingFormat === 'measurable' && <div><strong className="text-muted-foreground">Target:</strong> {habit.targetCount || 'N/A'} {habit.measurableUnit || ''}</div>}
                <div><strong className="text-muted-foreground">Created:</strong> {format(parseISO(habit.createdAt), 'PPP')}</div>
                <div className="text-primary"><strong className="text-muted-foreground">Current Streak:</strong> <span className="font-semibold">{currentStreak} day{currentStreak === 1 ? '' : 's'}</span></div>
                <div><strong className="text-muted-foreground">Longest Streak:</strong> {longestStreak} day{longestStreak === 1 ? '' : 's'}</div>
                <div><strong className="text-muted-foreground">Total Completions:</strong> {totalCompletions}</div>
                <div><strong className="text-muted-foreground">Success Rate:</strong> {overallSuccessData.successRate}%</div>
                {/* <div><strong className="text-muted-foreground">({overallSuccessData.completedDays} / {overallSuccessData.totalTrackedDays} days)</strong></div> */}
                {averageValuePerCompletion && <div><strong className="text-muted-foreground">Avg. Value:</strong> {averageValuePerCompletion} {habit.measurableUnit}</div>}
                 <div><strong className="text-muted-foreground">Longest Gap:</strong> {longestGap} day{longestGap === 1 ? '' : 's'}</div>
              </CardContent>
            </Card>

             <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><PieChartIcon className="w-5 h-5 mr-2 text-primary" />Success Rate</CardTitle>
                    <CardDescription>{overallSuccessData.completedDays} completed days out of {overallSuccessData.totalTrackedDays} tracked.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[200px] md:h-[250px]">
                    {successPieData.length > 0 && overallSuccessData.totalTrackedDays > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <RechartsTooltip content={<ChartTooltipContent formatter={(value, name) => <div className="flex flex-col"><span className="font-semibold">{name}</span><span>{value} days</span></div>} />} />
                                <Pie data={successPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                {successPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill === PIE_CHART_COLORS[1] ? "hsl(var(--border))" : undefined} />
                                ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                     ) : <p className="text-sm text-muted-foreground text-center pt-10">Not enough data for success rate.</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><BarChartHorizontalBig className="w-5 h-5 mr-2 text-primary" />Completions by Day of Week</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px] md:h-[250px]">
                    {dayOfWeekData.some(d => d.completions > 0) ? (
                    <ChartContainer config={dayOfWeekChartConfig} className="w-full h-full">
                      <BarChart data={dayOfWeekData} layout="vertical" margin={{left:0, right:20, top:5, bottom:5}}>
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="completions" allowDecimals={false} />
                        <YAxis dataKey="day" type="category" tickLine={false} axisLine={false} width={40}/>
                        <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                        <Bar dataKey="completions" radius={4} fill="hsl(var(--chart-1))"/>
                      </BarChart>
                    </ChartContainer>
                    ) : <p className="text-sm text-muted-foreground text-center pt-10">No completions logged yet.</p>}
                  </CardContent>
                </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-primary" />Monthly Completion Trend</CardTitle>
                 <CardDescription>Completions over the last 6 months.</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                 {monthlyTrendData.some(m => m.completions > 0) ? (
                <ChartContainer config={monthlyTrendChartConfig} className="w-full h-full">
                  <BarChart data={monthlyTrendData} margin={{left:0, right:10, top:5, bottom:5}}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} width={30}/>
                    <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="completions" radius={4} fill="hsl(var(--chart-2))"/>
                  </BarChart>
                </ChartContainer>
                 ) : <p className="text-sm text-muted-foreground text-center pt-10">Not enough monthly data.</p>}
              </CardContent>
            </Card>

            {habit.trackingFormat === 'measurable' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><Award className="w-5 h-5 mr-2 text-primary" />Recent Values Trend</CardTitle>
                  <CardDescription>Logged values for the last 30 completed entries vs target (if set).</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                  {recentValuesData.length > 1 ? (
                  <ChartContainer config={recentValuesChartConfig} className="w-full h-full">
                    <LineChart data={recentValuesData} margin={{left:0, right:10, top:5, bottom:5}}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis width={30}/>
                      <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<ChartTooltipContent indicator="dot" />} />
                      <RechartsLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="value" name={habit.measurableUnit || "Value"} stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{r:3}} activeDot={{r:5}} />
                       {habit.targetCount !== undefined && <Line type="monotone" dataKey="target" name="Target" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} strokeDasharray="5 5" />}
                    </LineChart>
                  </ChartContainer>
                  ) : <p className="text-sm text-muted-foreground text-center pt-10">Not enough measurable data for a trend.</p>}
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-primary" />Completion Calendar</CardTitle>
                    <CardDescription>{format(displayedCalendarMonth, 'MMMM yyyy')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-xs text-center">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} className="font-medium text-muted-foreground">{day}</div>
                      ))}
                      {Array.from({ length: getDay(dfnsStartOfMonth(displayedCalendarMonth)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-1 aspect-square"></div>
                      ))}
                      {currentMonthDays.map((dayEntry, index) => (
                        <div
                          key={index}
                          title={format(dayEntry.date, 'PPP') + (dayEntry.isCompleted && habit.trackingFormat === 'measurable' && dayEntry.value ? ` - ${dayEntry.value} ${habit.measurableUnit}` : '')}
                          className={cn(
                            "h-full w-full aspect-square flex items-center justify-center rounded-sm border text-[10px]",
                            dayEntry.isCompleted ? "bg-primary text-primary-foreground" : "bg-muted/20",
                            isToday(dayEntry.date) && "ring-2 ring-primary ring-offset-1"
                          )}
                        >
                          {format(dayEntry.date, 'd')}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><History className="w-5 h-5 mr-2 text-primary" />Streak Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong className="text-muted-foreground">Current Streak:</strong> <span className="font-semibold text-primary">{currentStreak} day{currentStreak === 1 ? '' : 's'}</span></p>
                    <p><strong className="text-muted-foreground">Longest Recorded Streak:</strong> {longestStreak} day{longestStreak === 1 ? '' : 's'}</p>
                    <p><strong className="text-muted-foreground">Longest Gap Between Completions:</strong> {longestGap} day{longestGap === 1 ? '' : 's'}</p>
                    <div>
                      <h4 className="font-medium mt-2 mb-1">Top 3 Longest Streaks:</h4>
                      {streakHistory.length > 0 ? (
                        <ul className="list-none space-y-0.5">
                          {streakHistory.map((s, i) => (
                            <li key={i} className="flex items-center">
                                <Star className="w-3.5 h-3.5 mr-1.5 text-yellow-500 flex-shrink-0" />
                                {s.length} day{s.length === 1 ? '' : 's'} (ended {format(parseISO(s.endDate), 'MMM d, yy')})
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-xs text-muted-foreground">No significant streak history yet.</p>}
                    </div>
                  </CardContent>
                </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><ListChecks className="w-5 h-5 mr-2 text-primary" />Completion Log</CardTitle>
                <CardDescription className="text-xs">Showing up to 100 most recent completed entries.</CardDescription>
              </CardHeader>
              <CardContent>
                {completedEntriesLog.length > 0 ? (
                  <ScrollArea className="h-[200px] pr-2">
                    <ul className="space-y-1.5">
                      {completedEntriesLog.map(entry => (
                        <li key={entry.date} className="flex items-center justify-between text-xs p-1.5 rounded-md bg-muted/50 hover:bg-muted/70">
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
        </ScrollArea>

        <DialogFooter className="mt-2 pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
