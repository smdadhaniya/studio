
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputValueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value?: number) => void;
  habitTitle: string;
  currentValue?: number;
  unit?: string;
}

export function InputValueModal({
  open,
  onOpenChange,
  onSubmit,
  habitTitle,
  currentValue,
  unit,
}: InputValueModalProps) {
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (open) {
      setInputValue(currentValue !== undefined ? String(currentValue) : '');
    }
  }, [open, currentValue]);

  const handleSubmit = () => {
    const numValue = parseFloat(inputValue);
    if (inputValue.trim() === '' || numValue === 0) {
      onSubmit(undefined); // Treat empty or zero as marking incomplete
    } else if (!isNaN(numValue) && numValue > 0) {
      onSubmit(numValue);
    } else {
      // Optionally, show an error message if input is invalid and not empty/zero
      alert('Please enter a valid positive number, or leave blank/enter 0 to mark as incomplete.');
      return;
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Log Progress for: {habitTitle}</DialogTitle>
          <DialogDescription>
            Enter the value {unit ? `in ${unit}` : ''}. Leave blank or enter 0 to mark as incomplete.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right col-span-1">
              Value {unit ? `(${unit})` : ''}
            </Label>
            <Input
              id="value"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="col-span-3 text-sm"
              placeholder={unit ? `e.g., 5 ${unit}` : "e.g., 5"}
              min="0" // Allow 0 for marking incomplete
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
