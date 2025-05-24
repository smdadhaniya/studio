
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PRESET_HABITS, HABIT_LUCIDE_ICONS_LIST } from '@/lib/constants';
import type { PresetHabitFormData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, selectedHabits: PresetHabitFormData[]) => void;
  currentUserName?: string; // For pre-filling name when editing
  isEditing?: boolean; // To adjust titles/text if needed
}

export function SetupModal({ open, onOpenChange, onSubmit, currentUserName, isEditing }: SetupModalProps) {
  const [userName, setUserName] = useState(currentUserName || '');
  const [selectedHabits, setSelectedHabits] = useState<PresetHabitFormData[]>([]);

  useEffect(() => {
    if (currentUserName) {
      setUserName(currentUserName);
    }
    // Reset selections when modal is opened/reopened
    setSelectedHabits([]);
  }, [open, currentUserName]);

  const handleToggleHabit = (habit: PresetHabitFormData, shouldBeSelected: boolean) => {
    setSelectedHabits(currentSelected => {
      const isCurrentlySelected = currentSelected.some(h => h.title === habit.title);
      if (shouldBeSelected) {
        if (!isCurrentlySelected) {
          return [...currentSelected, habit]; // Add if not present
        }
      } else {
        if (isCurrentlySelected) {
          return currentSelected.filter(h => h.title !== habit.title); // Remove if present
        }
      }
      return currentSelected; // No change needed if state already matches desired state
    });
  };

  const handleSubmit = () => {
    if (userName.trim() === '') {
      // Using toast for consistency, but alert is fine for quick validation.
      // Consider replacing with a more integrated form validation later if desired.
      alert('Please enter your name.');
      return;
    }
    onSubmit(userName, selectedHabits);
    onOpenChange(false); // Close modal on submit
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        // Prevent closing initial setup modal if name is not entered
        if (!isEditing && !isOpen && userName.trim() === '') {
            return; 
        }
        onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEditing ? "Edit Profile / Add Habits" : "Welcome to Habit Track!"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your name or add more preset habits to track." : "Let's get you set up. First, what should we call you?"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="text-base" // Ensure consistent font size
            />
          </div>

          <div className="space-y-2">
            <Label>{isEditing ? "Add more habits from presets:" : "Choose some habits to start with (optional):"}</Label>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="space-y-3">
                {PRESET_HABITS.map((habit) => {
                  const isSelected = selectedHabits.some(sh => sh.title === habit.title);
                  const IconComponent = HABIT_LUCIDE_ICONS_LIST.find(i => i.name === habit.icon)?.icon;
                  const checkboxId = `habit-${habit.title.replace(/\s+/g, '-')}`;
                  
                  return (
                    <div
                      key={habit.title}
                      // Removed onClick from here to prevent double handling with checkbox/label
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-md border transition-all",
                        isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleToggleHabit(habit, !!checked)}
                        aria-label={`Select ${habit.title}`}
                      />
                      {IconComponent && <IconComponent className="w-5 h-5 text-foreground" />}
                      <div className="flex-1">
                        <label
                          htmlFor={checkboxId} // Label now correctly toggles the checkbox
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {habit.title}
                        </label>
                        <p className="text-xs text-muted-foreground">{habit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isEditing ? "Save Changes" : "Get Started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
