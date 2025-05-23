"use client";

import type { DailyProgress } from '@/lib/types';
import { getLastNDays, parseDate } from '@/lib/dateUtils';
import { MAX_PROGRESS_DAYS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface ProgressGridProps {
  progress: DailyProgress[];
  habitColor?: string; // Main color for completed cells
}

export function ProgressGrid({ progress, habitColor = 'bg-primary' }: ProgressGridProps) {
  const last30Days = getLastNDays(MAX_PROGRESS_DAYS); // Returns dates as YYYY-MM-DD strings, newest first

  const progressMap = new Map(progress.map(p => [p.date, p]));

  return (
    <TooltipProvider delayDuration={100}>
      <div className="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-10 gap-1 p-1 bg-card-foreground/5 rounded-md">
        {last30Days.map(dateStr => {
          const dayProgress = progressMap.get(dateStr);
          const isCompleted = dayProgress?.completed === true;
          const cellDate = parseDate(dateStr);
          
          let tooltipContent = format(cellDate, "MMM d");
          if (dayProgress) {
            tooltipContent += `: ${isCompleted ? 'Completed' : 'Missed'}`;
            if (isCompleted && dayProgress.value !== undefined) {
              tooltipContent += ` (${dayProgress.value})`;
            }
          } else {
            tooltipContent += ": No data";
          }

          return (
            <Tooltip key={dateStr}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "w-full aspect-square rounded-sm border border-border/20 flex items-center justify-center",
                    isCompleted ? habitColor : 'bg-muted/30',
                    "hover:ring-2 hover:ring-offset-2 hover:ring-ring ring-offset-background"
                  )}
                  aria-label={tooltipContent}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
