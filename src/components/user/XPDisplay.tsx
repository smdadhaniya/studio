
"use client";

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="shadow-md bg-card text-card-foreground">
      <CardHeader className="pb-2">
        {/* CardTitle uses text-2xl which will map to 18px, text-lg for this specific one makes sense */}
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <span>Level {level}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Text will be text-sm (14px) by default */}
        <div className="mb-1 text-sm text-muted-foreground">
          Total XP: {xp}
        </div>
        <Progress value={progressToNextLevel} className="w-full h-3 [&>div]:bg-primary" />
        {/* Text will be text-xs which maps to 14px */}
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {currentLevelXpDisplay.toLocaleString()} / {nextLevelXpThresholdDisplay === Infinity ? 'MAX' : nextLevelXpThresholdDisplay.toLocaleString()} XP to next level
        </div>
      </CardContent>
    </Card>
  );
}
