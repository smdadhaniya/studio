
"use client";

import type { DailyProgress } from '@/lib/types';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { parseDate } from '@/lib/dateUtils';

interface ProgressGridProps {
  progress: DailyProgress[];
  habitColor?: string; 
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
      <div className="flex justify-between items-center mb-2 px-1 border-b pb-2"> {/* Added border-b and pb-2 for tabular header look */}
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Previous month">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        {/* Changed text-sm to text-lg (18px) for month display */}
        <span className="text-lg font-medium text-muted-foreground"> 
          {format(displayedMonth, "MMMM yyyy")}
        </span>
        <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <TooltipProvider delayDuration={100}>
        <div className="flex overflow-x-auto space-x-1 p-1 bg-card-foreground/5 rounded-md min-h-[3.5rem] items-center">
          {daysInMonth.map(dateStr => {
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
                      "w-6 h-7 flex-shrink-0 rounded-sm border border-border/20 flex items-center justify-center", 
                      isCompleted ? habitColor : 'bg-muted/30',
                      "hover:ring-2 hover:ring-offset-1 hover:ring-ring ring-offset-background cursor-default"
                    )}
                    aria-label={tooltipContent}
                  />
                </TooltipTrigger>
                <TooltipContent className="text-sm"> {/* Ensure tooltip content is 14px */}
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
