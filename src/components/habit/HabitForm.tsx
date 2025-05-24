
"use client";

import type { Habit, HabitTrackingFormat } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HABIT_COLORS, PREDEFINED_MEASUREMENT_UNITS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const habitFormSchemaBase = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  trackingFormat: z.enum(['yes/no', 'measurable'], { required_error: "Tracking format is required" }),
  targetCount: z.coerce.number().positive("Target count must be positive").optional(),
  measurableUnit: z.string().max(50).optional(),
  color: z.string().optional(),
});

const habitFormSchema = habitFormSchemaBase.superRefine((data, ctx) => {
  if (data.trackingFormat === 'measurable') {
    if (!data.targetCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Target count is required for measurable habits.",
        path: ["targetCount"],
      });
    }
    if (!data.measurableUnit || data.measurableUnit.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unit is required for measurable habits.",
        path: ["measurableUnit"],
      });
    }
  }
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
      targetCount: initialData?.targetCount || undefined,
      measurableUnit: initialData?.measurableUnit || (PREDEFINED_MEASUREMENT_UNITS.length > 0 ? PREDEFINED_MEASUREMENT_UNITS[0] : ''),
      color: initialData?.color || HABIT_COLORS[0],
    },
  });

  const trackingFormat = form.watch('trackingFormat');

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
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === 'yes/no') {
                      form.setValue('measurableUnit', '');
                      form.setValue('targetCount', undefined);
                      form.clearErrors('measurableUnit');
                      form.clearErrors('targetCount');
                    } else {
                        form.setValue('measurableUnit', PREDEFINED_MEASUREMENT_UNITS.length > 0 ? PREDEFINED_MEASUREMENT_UNITS[0] : '');
                    }
                  }}
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

        {trackingFormat === 'measurable' && (
          <>
            <FormField
              control={form.control}
              name="targetCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Count</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 5, 30" {...field} 
                           onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} 
                           className="text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measurableUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit of Measurement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PREDEFINED_MEASUREMENT_UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit} className="text-sm">
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                     <SelectTrigger style={{ backgroundColor: field.value?.startsWith('bg-') ? undefined : field.value }} className={cn(field.value?.startsWith('bg-') ? field.value : '', "text-sm")}>
                        <SelectValue placeholder="Select a color" />
                     </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {HABIT_COLORS.map((colorClass) => (
                      <SelectItem key={colorClass} value={colorClass} className="text-sm">
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
