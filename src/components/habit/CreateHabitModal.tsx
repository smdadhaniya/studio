
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// Button import not needed here if triggerButton is always passed or modal is controlled externally
// import { Button } from '@/components/ui/button'; 
import { HabitForm, type HabitFormData } from './HabitForm';
// PlusCircle import not needed here
// import { PlusCircle } from 'lucide-react'; 
import type { Habit } from '@/lib/types';
import { useState } from 'react';

interface CreateHabitModalProps {
  onHabitCreate: (data: HabitFormData) => void;
  triggerButton?: React.ReactNode; // Optional: if you want an external button to trigger it
  editingHabit?: Habit | null; 
  onHabitUpdate?: (habitId: string, data: HabitFormData) => void;
  open?: boolean; // For controlled state
  onOpenChange?: (open: boolean) => void; // For controlled state
}

export function CreateHabitModal({ 
    onHabitCreate, 
    triggerButton, 
    editingHabit, 
    onHabitUpdate,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: CreateHabitModalProps) {
  // Internal state if not controlled
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if the dialog is open based on controlled or internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;


  const handleSubmit = (data: HabitFormData) => {
    if (editingHabit && onHabitUpdate && editingHabit.id) {
      onHabitUpdate(editingHabit.id, data);
    } else {
      onHabitCreate(data);
    }
    setIsOpen(false); // Close the modal after submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Only render DialogTrigger if a triggerButton prop is provided */}
      {triggerButton && <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>}
      <DialogContent className="sm:max-w-[525px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{editingHabit ? 'Edit Habit' : 'Track a New Habit'}</DialogTitle>
          <DialogDescription>
            {editingHabit ? 'Update the details of your habit.' : 'Define your new habit. Stay consistent and track your progress!'}
          </DialogDescription>
        </DialogHeader>
        <HabitForm 
            onSubmit={handleSubmit} 
            initialData={editingHabit || {}} // Pass existing emoji string or defaults
            onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
