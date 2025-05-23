
"use client";

import type { Badge } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShieldQuestion, Trophy } from 'lucide-react'; // Default icon

interface BadgeDisplayProps {
  unlockedBadges: Badge[];
  allPossibleBadges: Badge[]; 
}

export function BadgeDisplay({ unlockedBadges, allPossibleBadges }: BadgeDisplayProps) {
  return (
    <Card className="shadow-md bg-card text-card-foreground">
      <CardHeader className="pb-2">
         {/* CardTitle uses text-2xl which will map to 18px, text-lg for this specific one makes sense */}
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span>Achievements</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* text-sm will be 14px */}
        {allPossibleBadges.length === 0 && <p className="text-sm text-muted-foreground">No achievements defined yet.</p>}
        {allPossibleBadges.length > 0 && (
          <TooltipProvider delayDuration={100}>
            <div className="flex flex-wrap gap-3">
              {allPossibleBadges.map(badge => {
                const isUnlocked = unlockedBadges.some(ub => ub.id === badge.id);
                const IconComponent = typeof badge.icon === 'string' ? ShieldQuestion : badge.icon || ShieldQuestion;
                
                return (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <div 
                        className={`p-2 rounded-full border-2 ${
                          isUnlocked 
                            ? 'border-primary bg-primary/20 text-primary' 
                            : 'border-muted bg-muted/20 text-muted-foreground opacity-50'
                        }`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </TooltipTrigger>
                    {/* TooltipContent font size is text-sm (14px) by default */}
                    <TooltipContent className="bg-popover text-popover-foreground">
                      <p className="font-semibold">{badge.name} {isUnlocked ? '(Unlocked)' : '(Locked)'}</p>
                      <p className="text-sm">{badge.description}</p> {/* Ensure description is 14px */}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        )}
         {unlockedBadges.length === 0 && allPossibleBadges.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">No achievements unlocked yet. Keep going!</p> // text-sm (14px)
        )}
      </CardContent>
    </Card>
  );
}
