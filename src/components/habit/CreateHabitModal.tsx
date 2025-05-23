
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HabitForm, type HabitFormData } from './HabitForm';
import { PlusCircle } from 'lucide-react';
import type { Habit } from '@/lib/types';
import { useState } from 'react';

interface CreateHabitModalProps {
  onHabitCreate: (data: HabitFormData) => void;
  triggerButton?: React.ReactNode;
  editingHabit?: Habit | null; // If passed, form is in edit mode
  onHabitUpdate?: (habitId: string, data: HabitFormData) => void; // For updates
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateHabitModal({ 
    onHabitCreate, 
    triggerButton, 
    editingHabit, 
    onHabitUpdate,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: CreateHabitModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;


  const handleSubmit = (data: HabitFormData) => {
    if (editingHabit && onHabitUpdate) {
      onHabitUpdate(editingHabit.id, data);
    } else {
      onHabitCreate(data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px] bg-card text-card-foreground">
        <DialogHeader>
          {/* DialogTitle uses text-lg (18px) by default via ShadCN config */}
          <DialogTitle>{editingHabit ? 'Edit Habit' : 'Track a New Habit'}</DialogTitle>
          {/* DialogDescription uses text-sm (14px) by default via ShadCN config */}
          <DialogDescription>
            {editingHabit ? 'Update the details of your habit.' : 'Define your new habit. Stay consistent and track your progress!'}
          </DialogDescription>
        </DialogHeader>
        <HabitForm 
            onSubmit={handleSubmit} 
            initialData={editingHabit || {}} 
            onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
