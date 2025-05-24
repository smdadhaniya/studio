
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { HabitForm, type HabitFormData } from './HabitForm';
import type { Habit, PresetHabitFormData } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { PRESET_HABITS, HABIT_LUCIDE_ICONS_LIST } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Added Button import

interface CreateHabitModalProps {
  onHabitCreate: (data: HabitFormData | PresetHabitFormData[]) => void;
  triggerButton?: React.ReactNode;
  editingHabit?: Habit | null;
  onHabitUpdate?: (habitId: string, data: HabitFormData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateHabitModal({
    onHabitCreate,
    // triggerButton, // triggerButton is not used if open is controlled
    editingHabit,
    onHabitUpdate,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: CreateHabitModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const [activeTab, setActiveTab] = useState("custom");
  const [selectedPresets, setSelectedPresets] = useState<PresetHabitFormData[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedPresets([]);
      if (editingHabit) {
        setActiveTab("custom"); // Default to custom tab if editing
      } else {
        setActiveTab("custom"); // Default to custom for new habits as well, user can switch
      }
    }
  }, [isOpen, editingHabit]);

  const handleCustomFormSubmit = (data: HabitFormData) => {
    if (editingHabit && onHabitUpdate && editingHabit.id) {
      onHabitUpdate(editingHabit.id, data);
    } else {
      onHabitCreate(data); // Pass HabitFormData
    }
    setIsOpen(false);
  };

  const handlePresetFormSubmit = () => {
    if (selectedPresets.length > 0) {
      onHabitCreate(selectedPresets); // Pass PresetHabitFormData[]
    } else {
      // Optionally, show a toast or message if no presets are selected
      alert("Please select at least one preset habit.");
      return;
    }
    setIsOpen(false);
  };

  const handleTogglePreset = (habit: PresetHabitFormData, shouldBeSelected: boolean) => {
    setSelectedPresets(currentSelected => {
      const isCurrentlySelected = currentSelected.some(h => h.title === habit.title);
      if (shouldBeSelected) {
        if (!isCurrentlySelected) return [...currentSelected, habit];
      } else {
        if (isCurrentlySelected) return currentSelected.filter(h => h.title !== habit.title);
      }
      return currentSelected;
    });
  };
  
  const dialogTitle = editingHabit ? 'Edit Habit' : 'Add New Habit';
  const dialogDescription = editingHabit 
    ? 'Update the details of your habit.' 
    : 'Define a new custom habit or choose from our presets.';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* {triggerButton && <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>} */}
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom" disabled={!!editingHabit && activeTab !== "custom"}>Create Custom</TabsTrigger>
            <TabsTrigger value="presets" disabled={!!editingHabit}>Add from Presets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="custom" className="mt-4">
            <HabitForm
                onSubmit={handleCustomFormSubmit}
                initialData={editingHabit || {}}
                onCancel={() => setIsOpen(false)}
            />
          </TabsContent>

          <TabsContent value="presets" className="mt-4">
            {editingHabit ? (
              <p className="text-sm text-muted-foreground text-center py-4">Preset selection is disabled when editing an existing habit.</p>
            ) : (
              <div className="space-y-4">
                <Label>Select habits from our popular presets:</Label>
                <ScrollArea className="h-[350px] w-full rounded-md border p-4">
                  <div className="space-y-3">
                    {PRESET_HABITS.map((habit) => {
                      const isSelected = selectedPresets.some(sh => sh.title === habit.title);
                      const IconComponent = HABIT_LUCIDE_ICONS_LIST.find(i => i.name === habit.icon)?.icon;
                      const checkboxId = `preset-create-${habit.title.replace(/\s+/g, '-')}`;
                      
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
                            onCheckedChange={(checked) => handleTogglePreset(habit, !!checked)}
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
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="button" onClick={handlePresetFormSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Add Selected Presets
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Footer for Custom form is inside HabitForm component. No general footer here if tabs are used. */}
      </DialogContent>
    </Dialog>
  );
}
