
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
  currentUserName?: string;
  isEditing?: boolean; 
}

export function SetupModal({ open, onOpenChange, onSubmit, currentUserName, isEditing }: SetupModalProps) {
  const [userName, setUserName] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<PresetHabitFormData[]>([]);

  useEffect(() => {
    if (open) { // Reset state when modal opens
      setUserName(currentUserName || '');
      setSelectedHabits([]); // Always clear selected habits when opening
    }
  }, [open, currentUserName]);

  const handleToggleHabit = (habit: PresetHabitFormData, shouldBeSelected: boolean) => {
    setSelectedHabits(currentSelected => {
      const isCurrentlySelected = currentSelected.some(h => h.title === habit.title);
      if (shouldBeSelected) {
        if (!isCurrentlySelected) {
          return [...currentSelected, habit]; 
        }
      } else {
        if (isCurrentlySelected) {
          return currentSelected.filter(h => h.title !== habit.title); 
        }
      }
      return currentSelected; 
    });
  };

  const handleSubmit = () => {
    if (userName.trim() === '') {
      alert('Please enter your name.');
      return;
    }
    // If editing, selectedHabits will be empty as it's not shown.
    // If initial setup, selectedHabits will contain user's choices.
    onSubmit(userName, isEditing ? [] : selectedHabits);
    onOpenChange(false); 
  };

  const modalTitle = isEditing ? "Edit Name" : "Welcome to Habit Track!";
  const modalDescription = isEditing 
    ? "Update your name. To add more habits, use the 'Add New Habit' button on the main page." 
    : "Let's get you set up. First, what should we call you? You can also pick some habits to start with.";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isEditing && !isOpen && userName.trim() === '' && !currentUserName) { // Stricter condition for preventing close on initial setup
            return; 
        }
        onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl">{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
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

          {!isEditing && ( // Only show preset habits selection during initial setup
            <div className="space-y-2">
              <Label>Choose some habits to start with (optional):</Label>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="space-y-3">
                  {PRESET_HABITS.map((habit) => {
                    const isSelected = selectedHabits.some(sh => sh.title === habit.title);
                    const IconComponent = HABIT_LUCIDE_ICONS_LIST.find(i => i.name === habit.icon)?.icon;
                    const checkboxId = `preset-setup-${habit.title.replace(/\s+/g, '-')}`;
                    
                    return (
                      <div
                        key={habit.title}
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
                            htmlFor={checkboxId} 
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
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isEditing ? "Save Name" : "Get Started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
