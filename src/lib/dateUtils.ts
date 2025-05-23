import { format, subDays, eachDayOfInterval, startOfDay, isEqual } from 'date-fns';

export function getTodayDateString(): string {
  return format(startOfDay(new Date()), 'yyyy-MM-dd');
}

export function getPastDateString(daysAgo: number): string {
  return format(startOfDay(subDays(new Date(), daysAgo)), 'yyyy-MM-dd');
}

export function getLastNDays(n: number): string[] {
  const today = startOfDay(new Date());
  const startDate = startOfDay(subDays(today, n - 1));
  return eachDayOfInterval({ start: startDate, end: today }).map(date => format(date, 'yyyy-MM-dd')).reverse();
}

export function isSameDay(date1Str: string, date2Str: string): boolean {
  return isEqual(startOfDay(new Date(date1Str)), startOfDay(new Date(date2Str)));
}

export function parseDate(dateStr: string): Date {
  return startOfDay(new Date(dateStr));
}
