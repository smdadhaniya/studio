"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface SubscriptionPlan {
  id: string;
  amount: number;
  created_at: Date;
  currency: string;
  description: string;
  duration_days: string;
  is_active: boolean;
  is_best_value: boolean;
  plan_name: string;
}

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionModal({
  open,
  onOpenChange,
}: SubscriptionModalProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscribePlan, setSubscribePlan] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Load Razorpay script once when modal opens
  useEffect(() => {
    if (!open) return;
    const loadRazorpayScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (typeof window === "undefined") return;

        if (window.Razorpay) {
          setRazorpayReady(true);
          return resolve();
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          setRazorpayReady(true);
          resolve();
        };
        script.onerror = () => reject("Failed to load Razorpay script");

        document.body.appendChild(script);
      });
    };

    loadRazorpayScript().catch((err) => {
      console.error("Razorpay load error:", err);
      toast({
        title: "Error",
        description: "Failed to load payment gateway. Try again later.",
      });
    });
  }, [open]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axiosInstance.get("/api/subscription-plans");
        const sortedPlans = res.data.plans.sort(
          (a: SubscriptionPlan, b: SubscriptionPlan) => a.amount - b.amount
        );
        setPlans(sortedPlans);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load subscription plans.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPlans();
    }
  }, [open]);

  const handleSubscribeClick = async (plan: SubscriptionPlan) => {
    setSubscribePlan(plan.id);
    if (!currentUser?.uid) {
      onOpenChange(false);
      router.replace("/login");
      return;
    }

    if (!razorpayReady) {
      toast({
        title: "Error",
        description: "Payment gateway not ready. Please try again later.",
      });
      return;
    }

    setPaymentLoading(true);

    try {
      const USD_TO_INR = 82;
      const amountInINR = Math.round(plan.amount * USD_TO_INR * 100);

      const res = await axiosInstance.post("/api/create-razorpay-order", {
        amount: amountInINR, // paise
        currency: "INR",
        name: currentUser.name,
        email: currentUser.email,
        subscriptionId: plan.id,
      });
      const order = res.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID || "",
        amount: order.amount,
        currency: "INR",
        display_currency: "INR",
        name: plan.plan_name,
        description: plan.description,
        order_id: order.id,
        prefill: {
          name: currentUser.userName,
          email: currentUser.email,
        },
        handler: async (response: any) => {
          try {
            await axiosInstance.post("/api/subscription", {
              subscriptions: {
                currency: "INR",
                payment_method: "RAZORPAY",
                amount: (order.amount / 100).toFixed(2),
                user_id: currentUser.uid,
                subscription_id: plan.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            toast({
              title: "Success",
              description: "Subscription activated!",
            });
            onOpenChange(false);
          } catch (err: any) {
            toast({
              title: "Error",
              description:
                "Failed to save subscription. Please contact support.",
            });
            console.error("Subscription store error:", err.message);
          }
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment initiation failed", err.message);
      toast({ title: "Error", description: "Failed to start payment." });
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold">
            <Rocket className="w-6 h-6 mr-2 text-primary" />
            Upgrade to Habit Track Premium!
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            Unlock cloud sync for your habits across all your devices, ensuring
            your progress is always safe and accessible. Plus, gain access to
            exclusive themes and advanced reporting features.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div>Loading Plans...</div>
        ) : (
          <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans?.map((plan) => {
              const isBest = plan.is_best_value;

              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col transition-shadow duration-200 ${
                    isBest
                      ? "border-2 border-primary ring-2 ring-primary/50 shadow-xl hover:shadow-2xl relative"
                      : "border hover:shadow-lg"
                  }`}
                >
                  {isBest && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-full flex items-center shadow-md">
                      <Zap className="w-3.5 h-3.5 mr-1.5" />
                      Best Value
                    </div>
                  )}

                  <CardHeader className={`pb-3 ${isBest ? "pt-8" : ""}`}>
                    <CardTitle className="text-lg font-medium">
                      {plan.plan_name}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow flex flex-col justify-between items-center text-center">
                    <div className="mb-4">
                      <p className="text-[25px] font-bold text-primary">
                        {plan.currency.toUpperCase() === "USD"
                          ? "$"
                          : plan.currency}
                        {plan.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        per {plan.duration_days}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleSubscribeClick(plan)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={paymentLoading}
                    >
                      {paymentLoading && subscribePlan === plan.id
                        ? "Processing..."
                        : `Choose ${plan.plan_name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
