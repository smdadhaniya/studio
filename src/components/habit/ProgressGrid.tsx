
"use client";

import type { DailyProgress } from '@/lib/types';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { parseDate } from '@/lib/dateUtils'; // Keep parseDate for tooltip formatting

interface ProgressGridProps {
  progress: DailyProgress[];
  habitColor?: string; // Main color for completed cells
}

export function ProgressGrid({ progress, habitColor = 'bg-primary' }: ProgressGridProps) {
  const [displayedMonth, setDisplayedMonth] = useState(startOfMonth(new Date()));

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(displayedMonth);
    const end = endOfMonth(displayedMonth);
    return eachDayOfInterval({ start, end }).map(date => format(date, 'yyyy-MM-dd'));
  }, [displayedMonth]);

  const progressMap = useMemo(() => new Map(progress.map(p => [p.date, p])), [progress]);

  const goToPreviousMonth = () => {
    setDisplayedMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setDisplayedMonth(prev => addMonths(prev, 1));
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 px-1">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Previous month">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {format(displayedMonth, "MMMM yyyy")}
        </span>
        <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <TooltipProvider delayDuration={100}>
        <div className="flex overflow-x-auto space-x-1 p-1 bg-card-foreground/5 rounded-md min-h-[3.5rem] items-center"> {/* min-h to maintain some height */}
          {daysInMonth.map(dateStr => {
            const dayProgress = progressMap.get(dateStr);
            const isCompleted = dayProgress?.completed === true;
            const cellDate = parseDate(dateStr); // parseDate expects 'yyyy-MM-dd'
            
            let tooltipContent = format(cellDate, "MMM d");
            if (dayProgress) {
              tooltipContent += `: ${isCompleted ? 'Completed' : 'Missed'}`;
              if (isCompleted && dayProgress.value !== undefined) {
                tooltipContent += ` (${dayProgress.value})`;
              }
            } else {
              // For days not in progressMap, it means no data.
              // Check if the date is in the past or future relative to today for more precise "No data" vs "Not yet tracked"
              tooltipContent += ": No data";
            }

            return (
              <Tooltip key={dateStr}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-6 h-7 flex-shrink-0 rounded-sm border border-border/20 flex items-center justify-center", // Adjusted size and added flex-shrink-0
                      isCompleted ? habitColor : 'bg-muted/30',
                      "hover:ring-2 hover:ring-offset-1 hover:ring-ring ring-offset-background cursor-default" // Added cursor-default
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
    </div>
  );
}
