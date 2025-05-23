
"use client";

import type { Badge as BadgeType } from '@/lib/types'; // Renamed to avoid conflict with component
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy } from 'lucide-react';
import { HABIT_LUCIDE_ICONS_LIST } from '@/lib/constants'; // For looking up icon components

interface BadgeDisplayProps {
  unlockedBadges: BadgeType[];
  allPossibleBadges: BadgeType[];
}

const DefaultBadgeIcon = HABIT_LUCIDE_ICONS_LIST.find(i => i.name === "Award")?.icon || Trophy; // Fallback icon

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
              const IconComponent = HABIT_LUCIDE_ICONS_LIST.find(i => i.name === badge.icon)?.icon || DefaultBadgeIcon;

              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`p-1.5 rounded-full border flex items-center justify-center ${ // Adjusted padding for Lucide
                        isUnlocked
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-muted bg-muted/20 text-muted-foreground opacity-60'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" /> {/* Lucide icons are sized this way */}
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
