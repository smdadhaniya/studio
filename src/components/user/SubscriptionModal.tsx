
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, Zap } from 'lucide-react'; // Added Zap for yearly
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: () => void;
}

export function SubscriptionModal({ open, onOpenChange, onSubscribe }: SubscriptionModalProps) {
  const handleSubscribeClick = () => {
    onSubscribe();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Rocket className="w-6 h-6 mr-2 text-primary" />
            Upgrade to Habit Track Premium!
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm">
            Unlock cloud sync for your habits across all your devices, ensuring your progress is always safe and accessible.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Monthly</CardTitle>
              <CardDescription>Flexible plan</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-primary">$5</p>
                <p className="text-xs text-muted-foreground text-center">per month</p>
              </div>
              <Button 
                type="button" 
                onClick={handleSubscribeClick} 
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Subscribe Monthly
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-primary ring-2 ring-primary relative">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold rounded-full flex items-center">
                <Zap className="w-3 h-3 mr-1" /> Best Value
            </div>
            <CardHeader className="pb-2 pt-6">
              <CardTitle className="text-lg">Yearly</CardTitle>
              <CardDescription>Save 16%!</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-primary">$50</p>
                <p className="text-xs text-muted-foreground text-center">per year</p>
              </div>
              <Button 
                type="button" 
                onClick={handleSubscribeClick} 
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Subscribe Yearly
              </Button>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
