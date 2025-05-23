
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PRESET_HABITS } from '@/lib/constants';
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
    // Reset selected habits when modal is opened for editing, so user can add more
    // Or, if it's initial setup, it's already empty.
    setSelectedHabits([]); 
  }, [open, currentUserName]);

  const handleToggleHabit = (habit: PresetHabitFormData, checked: boolean) => {
    setSelectedHabits(prev =>
      checked ? [...prev, habit] : prev.filter(h => h.title !== habit.title)
    );
  };

  const handleSubmit = () => {
    if (userName.trim() === '') {
      alert('Please enter your name.');
      return;
    }
    onSubmit(userName, selectedHabits);
    onOpenChange(false); // Close modal on submit
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
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
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>{isEditing ? "Add more habits from presets:" : "Choose some habits to start with (optional):"}</Label>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="space-y-3">
                {PRESET_HABITS.map((habit) => {
                  const isSelected = selectedHabits.some(sh => sh.title === habit.title);
                  return (
                    <div
                      key={habit.title}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-md border transition-all cursor-pointer",
                        isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                      )}
                      onClick={() => handleToggleHabit(habit, !isSelected)}
                    >
                      <Checkbox
                        id={`habit-${habit.title.replace(/\s+/g, '-')}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleToggleHabit(habit, !!checked)}
                        aria-label={`Select ${habit.title}`}
                      />
                      {habit.icon && <span className="text-lg">{habit.icon}</span>}
                      <div className="flex-1">
                        <label
                          htmlFor={`habit-${habit.title.replace(/\s+/g, '-')}`}
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
