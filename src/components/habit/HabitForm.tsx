"use client";

import type { Habit, HabitTrackingFormat } from "@/lib/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HABIT_COLORS,
  PREDEFINED_MEASUREMENT_UNITS,
  HABIT_LUCIDE_ICONS_LIST,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const habitFormSchemaBase = z.object({
  title: z.string().min(1, "Title is required").max(100),
  icon: z.string().optional(),
  description: z.string().max(500).optional(),
  trackingFormat: z.enum(["yes/no", "measurable"], {
    required_error: "Tracking format is required",
  }),
  targetCount: z.coerce
    .number()
    .positive("Target count must be positive")
    .optional(),
  measurableUnit: z.string().max(50).optional(),
  // color: z.string().optional(), // Color removed from form
});

const habitFormSchema = habitFormSchemaBase.superRefine((data, ctx) => {
  if (data.trackingFormat === "measurable") {
    if (!data.targetCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Target count is required for measurable habits.",
        path: ["targetCount"],
      });
    }
    if (!data.measurableUnit || data.measurableUnit.trim() === "") {
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
  isHabitUpdating: boolean;
}

export function HabitForm({
  onSubmit,
  initialData,
  onCancel,
  isHabitUpdating,
}: HabitFormProps) {
  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      icon: initialData?.icon || undefined,
      description: initialData?.description || "",
      trackingFormat: initialData?.trackingFormat || "yes/no",
      targetCount: initialData?.targetCount || undefined,
      measurableUnit:
        initialData?.measurableUnit ||
        (PREDEFINED_MEASUREMENT_UNITS.length > 0
          ? PREDEFINED_MEASUREMENT_UNITS[0]
          : ""),
      // color: initialData?.color || HABIT_COLORS[0], // Color removed
    },
  });

  const trackingFormat = form.watch("trackingFormat");
  const selectedIconName = form.watch("icon");
  const SelectedIconComponent = HABIT_LUCIDE_ICONS_LIST.find(
    (i) => i.name === selectedIconName
  )?.icon;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Morning Run"
                    {...field}
                    className="text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem className="w-full sm:w-auto sm:min-w-[180px] pt-0 sm:pt-[28px]">
                {" "}
                {/* Adjusted padding for alignment */}
                {/* <FormLabel>Icon</FormLabel> */}
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-sm">
                      {SelectedIconComponent && (
                        <SelectedIconComponent className="w-4 h-4 mr-2 shrink-0" />
                      )}
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {HABIT_LUCIDE_ICONS_LIST.map((iconItem) => {
                        const IconComp = iconItem.icon;
                        return (
                          <SelectItem
                            key={iconItem.name}
                            value={iconItem.name}
                            className="text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <IconComp className="w-4 h-4 shrink-0" />
                              <span>{iconItem.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Run for 30 minutes around the park"
                  {...field}
                />
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
                    if (value === "yes/no") {
                      form.setValue("measurableUnit", "");
                      form.setValue("targetCount", undefined);
                      form.clearErrors("measurableUnit");
                      form.clearErrors("targetCount");
                    } else {
                      form.setValue(
                        "measurableUnit",
                        PREDEFINED_MEASUREMENT_UNITS.length > 0
                          ? PREDEFINED_MEASUREMENT_UNITS[0]
                          : ""
                      );
                      form.setValue("targetCount", 1); // Default target count for measurable
                    }
                  }}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes/no" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Yes / No (Completed or not)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="measurable" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Measurable (e.g., 5 pages, 30 minutes)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {trackingFormat === "measurable" && (
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name="targetCount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Target Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 5"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          parseInt(e.target.value, 10) || undefined
                        )
                      }
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measurableUnit"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {PREDEFINED_MEASUREMENT_UNITS.map((unit) => (
                          <SelectItem
                            key={unit}
                            value={unit}
                            className="text-sm"
                          >
                            {unit}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Color field removed
        <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              // ...
            )}
          />
        */}

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className={`${
              isHabitUpdating ? "cursor-not-allowed" : ""
            } bg-primary hover:bg-primary/90 text-primary-foreground`}
          >
            {initialData?.id ? "Save Changes" : "Create Habit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
