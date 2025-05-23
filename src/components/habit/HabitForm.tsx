
"use client";

import type { Habit, HabitTrackingFormat } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HABIT_COLORS, HABIT_EMOJIS_LIST } from '@/lib/constants';
import { cn } from '@/lib/utils';

const habitFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  trackingFormat: z.enum(['yes/no', 'measurable'], { required_error: "Tracking format is required" }),
  icon: z.string().optional(), // Emoji character
  color: z.string().optional(),
});

export type HabitFormData = z.infer<typeof habitFormSchema>;

interface HabitFormProps {
  onSubmit: (data: HabitFormData) => void;
  initialData?: Partial<Habit>;
  onCancel?: () => void;
}

export function HabitForm({ onSubmit, initialData, onCancel }: HabitFormProps) {
  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      trackingFormat: initialData?.trackingFormat || 'yes/no',
      icon: initialData?.icon || (HABIT_EMOJIS_LIST.length > 0 ? HABIT_EMOJIS_LIST[0].emoji : undefined),
      color: initialData?.color || HABIT_COLORS[0],
    },
  });

  const selectedEmoji = form.watch('icon');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Morning Run" {...field} className="text-sm"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Run for 30 minutes around the park" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trackingFormat"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tracking Format</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes/no" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes / No (Completed or not)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="measurable" />
                    </FormControl>
                    <FormLabel className="font-normal">Measurable (e.g., 5 pages, 30 minutes)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emoji (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        {selectedEmoji && <span className="text-lg">{selectedEmoji}</span>}
                        <SelectValue placeholder="Select an emoji" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {HABIT_EMOJIS_LIST.map(({ name, emoji }) => (
                      <SelectItem key={emoji} value={emoji}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{emoji}</span>
                          <span>{name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                     <SelectTrigger style={{ backgroundColor: field.value?.startsWith('bg-') ? undefined : field.value }} className={cn(field.value?.startsWith('bg-') ? field.value : '')}>
                        <SelectValue placeholder="Select a color" />
                     </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {HABIT_COLORS.map((colorClass) => (
                      <SelectItem key={colorClass} value={colorClass}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-4 h-4 rounded-full border", colorClass)}></div>
                          <span>{colorClass.split('-')[1] || colorClass}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <div className="flex justify-end gap-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {initialData?.id ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
