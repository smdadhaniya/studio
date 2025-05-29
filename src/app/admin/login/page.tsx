"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/contexts/AuthContext";
import { Flame } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { saveState } from "@/lib/localStorageUtils";
import { toast } from "@/hooks/use-toast";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_PROFILE_KEY,
} from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const { setLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setLoading(true);
      const payload = { email, password };

      const response = await axiosInstance.post(
        "/api/admin-panel/admin-signin",
        payload
      );

      if (!response?.data?.success) {
        router.replace("/");
        throw new Error(response.data?.message || "Authentication failed.");
      }

      const { accessToken, refreshToken } = response.data.data;
      saveState("admin_accessToken", accessToken);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      router.replace("/admin");
    } catch (error: any) {
      let errorMsg = "Login failed. Please try again.";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast({
        title: "Login Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-xl self-center justify-self-center mt-14">
      <CardHeader className="text-center">
        <Flame className="w-16 h-16 text-primary mx-auto mb-2" />
        <CardDescription>Log in to access admin panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging In..." : "Log In"}
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
