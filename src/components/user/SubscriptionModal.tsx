
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Rocket className="w-6 h-6 mr-2 text-primary" />
            Upgrade to Premium!
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm">
            Unlock cloud sync for your habits across all your devices, ensuring your progress is always safe and accessible.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-3xl font-bold text-primary">$5</p>
          <p className="text-sm text-muted-foreground">per month</p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Maybe Later
          </Button>
          <Button 
            type="button" 
            onClick={handleSubscribeClick} 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Subscribe for $5/month
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
