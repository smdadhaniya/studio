
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { HabitForm, type HabitFormData } from './HabitForm';
import type { Habit } from '@/lib/types';
import { useState } from 'react';

interface CreateHabitModalProps {
  onHabitCreate: (data: HabitFormData) => void;
  triggerButton?: React.ReactNode;
  editingHabit?: Habit | null;
  onHabitUpdate?: (habitId: string, data: HabitFormData) => void;
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
    if (editingHabit && onHabitUpdate && editingHabit.id) {
      onHabitUpdate(editingHabit.id, data);
    } else {
      onHabitCreate(data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            initialData={editingHabit || {}} // Pass existing icon name string or defaults
            onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
