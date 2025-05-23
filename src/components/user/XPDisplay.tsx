
"use client";

import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

interface XPDisplayProps {
  xp: number;
  level: number;
  progressToNextLevel: number; // Percentage
  currentLevelXpDisplay: number; // XP earned within current level
  nextLevelXpThresholdDisplay: number; // XP needed for next level from start of current level
}

export function XPDisplay({ xp, level, progressToNextLevel, currentLevelXpDisplay, nextLevelXpThresholdDisplay }: XPDisplayProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <Star className="w-5 h-5 text-primary" />
        <span className="text-lg font-semibold">Level {level}</span>
      </div>
      <Progress value={progressToNextLevel} className="w-full h-2.5 mb-1 [&>div]:bg-primary" />
      <div className="text-xs text-muted-foreground flex justify-between items-center">
        <span>Total XP: {xp.toLocaleString()}</span>
        <span>{currentLevelXpDisplay.toLocaleString()} / {nextLevelXpThresholdDisplay === Infinity ? 'MAX' : nextLevelXpThresholdDisplay.toLocaleString()} XP</span>
      </div>
    </div>
  );
}
