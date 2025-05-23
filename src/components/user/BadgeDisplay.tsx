
"use client";

import type { Badge } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy } from 'lucide-react'; // For the section title
// Default emoji if badge.icon is not provided, though it should be.
const DEFAULT_BADGE_EMOJI = '❓'; 

interface BadgeDisplayProps {
  unlockedBadges: Badge[];
  allPossibleBadges: Badge[]; 
}

export function BadgeDisplay({ unlockedBadges, allPossibleBadges }: BadgeDisplayProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-5 h-5 text-primary" />
        <span className="text-lg font-semibold">Achievements</span>
      </div>
      {allPossibleBadges.length === 0 && <p className="text-sm text-muted-foreground">No achievements defined yet.</p>}
      {allPossibleBadges.length > 0 && (
        <TooltipProvider delayDuration={100}>
          <div className="flex flex-wrap gap-2 items-center">
            {allPossibleBadges.map(badge => {
              const isUnlocked = unlockedBadges.some(ub => ub.id === badge.id);
              const badgeEmoji = badge.icon || DEFAULT_BADGE_EMOJI;
              
              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div 
                      className={`p-1 rounded-full border text-base ${ // Reduced padding slightly
                        isUnlocked 
                          ? 'border-primary bg-primary/20 text-primary' 
                          : 'border-muted bg-muted/20 text-muted-foreground opacity-60'
                      }`}
                    >
                      <span role="img" aria-label={badge.name}>{badgeEmoji}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover text-popover-foreground text-sm">
                    <p className="font-semibold">{badge.name} {isUnlocked ? '(Unlocked)' : '(Locked)'}</p>
                    <p className="text-sm">{badge.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      )}
      {unlockedBadges.length === 0 && allPossibleBadges.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1.5">No achievements unlocked yet. Keep going!</p>
      )}
    </div>
  );
}
