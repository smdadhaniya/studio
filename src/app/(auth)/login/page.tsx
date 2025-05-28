"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  useAuth,
  USER_PROFILE_KEY,
} from "@/contexts/AuthContext"; // Assuming AuthContext is in src/contexts
import { Flame } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { saveState } from "@/lib/localStorageUtils";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Min 1 for login, actual check is on server
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, loading, setLoading } = useAuth(); // Use loading from auth context
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const payload = {
      email: data.email,
      password: data.password,
    };
    try {
      const response = await axiosInstance({
        method: "post",
        url: "/api/auth/signin",
        data: payload,
      });
      const { userInfo, accessToken, refreshToken } = response.data.data;

      saveState(USER_PROFILE_KEY, userInfo);
      saveState(ACCESS_TOKEN_KEY, accessToken);
      saveState(REFRESH_TOKEN_KEY, refreshToken);

      setCurrentUser(userInfo);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push("/");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || error.message || "Login failed";
      toast({
        title: "Login Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isLoading = isSubmitting || loading;

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <Flame className="w-16 h-16 text-primary mx-auto mb-2" />
        <CardTitle className="text-2xl font-bold">
          Welcome Back to Habit Track
        </CardTitle>
        <CardDescription>Log in to continue your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Logging In..." : "Log In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        <p className="text-muted-foreground w-full">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
