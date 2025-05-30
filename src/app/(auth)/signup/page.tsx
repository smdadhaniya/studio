"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  ACCESS_TOKEN_KEY,
  HABITS_KEY,
  PROGRESS_KEY,
  REFRESH_TOKEN_KEY,
  USER_PROFILE_KEY,
} from "../../../lib/constants";
import { Flame } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { loadState, saveState } from "@/lib/localStorageUtils";
import { toast } from "@/hooks/use-toast";
import { Habit, HabitProgress } from "@/lib/types";

const signupSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms and Conditions.",
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Privacy Policy.",
  }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentUser } = useAuth();
  const allHabits = loadState<Habit[]>(HABITS_KEY, []);
  const allProgress = loadState<HabitProgress>(PROGRESS_KEY, {});
  const filteredHabits = allHabits.map(
    ({
      id,
      title,
      description,
      icon,
      trackingFormat,
      measurableUnit,
      targetCount,
      createdAt,
    }) => ({
      id,
      title,
      description,
      icon,
      tracking_format: trackingFormat,
      measurable_unit: measurableUnit,
      target_count: targetCount,
      created_at: createdAt,
    })
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    const fullName = `${data.firstName} ${data.lastName}`;

    const payload = {
      email: data.email,
      password: data.password,
      name: fullName,
      allHabits: filteredHabits,
      allProgress,
    };
    try {
      const response = await axiosInstance.post("/api/auth/register", payload);
      const { userProfile, accessToken, refreshToken } = response.data;

      saveState(USER_PROFILE_KEY, userProfile);
      saveState(ACCESS_TOKEN_KEY, accessToken);
      saveState(REFRESH_TOKEN_KEY, refreshToken);

      setCurrentUser(userProfile);
      toast({
        title: "Signup Successful",
        description: `Welcome, ${fullName}!`,
      });

      router.push("/habits");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || error.message || "Signup failed";
      toast({
        title: "Signup Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <Flame className="w-16 h-16 text-primary mx-auto mb-2" />
        <CardTitle className="text-2xl font-bold">
          Create Your Habit Track Account
        </CardTitle>
        <CardDescription>
          Join us and start building better habits today!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-1 sm:flex-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                {...register("firstName")}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1 sm:flex-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                {...register("lastName")}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="termsAccepted"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    aria-labelledby="terms-label"
                  />
                )}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="termsAccepted"
                  id="terms-label"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms and Conditions
                  </Link>
                </label>
                {errors.termsAccepted && (
                  <p className="text-xs text-destructive">
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Controller
                name="privacyAccepted"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="privacyAccepted"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    aria-labelledby="privacy-label"
                  />
                )}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="privacyAccepted"
                  id="privacy-label"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>
                </label>
                {errors.privacyAccepted && (
                  <p className="text-xs text-destructive">
                    {errors.privacyAccepted.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        <p className="text-muted-foreground w-full">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
