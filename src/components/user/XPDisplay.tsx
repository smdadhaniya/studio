
"use client";

import { Progress } from '@/components/ui/progress';
// Star icon is no longer needed here
// import { Star } from 'lucide-react'; 

interface XPDisplayProps {
  xp: number;
  level: number; // Still needed for logic if any, but not displayed directly here anymore
  progressToNextLevel: number; // Percentage
  currentLevelXpDisplay: number; // XP earned within current level
  nextLevelXpThresholdDisplay: number; // XP needed for next level from start of current level
}

export function XPDisplay({ xp, level, progressToNextLevel, currentLevelXpDisplay, nextLevelXpThresholdDisplay }: XPDisplayProps) {
  return (
    <div className="flex-1 min-w-0">
      {/* The div containing the Star icon and Level text has been removed */}
      {/* 
      <div className="flex items-center gap-2 mb-1">
        <Star className="w-5 h-5 text-primary" />
        <span className="text-lg font-semibold">Level {level}</span>
      </div> 
      */}
      <Progress value={progressToNextLevel} className="w-full h-2.5 mb-1 [&>div]:bg-primary" />
      <div className="text-xs text-muted-foreground flex justify-end items-center">
        <span>{currentLevelXpDisplay.toLocaleString()} / {nextLevelXpThresholdDisplay === Infinity ? 'MAX' : nextLevelXpThresholdDisplay.toLocaleString()} XP</span>
      </div>
    </div>
  );
}
