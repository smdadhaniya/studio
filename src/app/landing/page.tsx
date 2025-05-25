
// src/app/landing/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Rocket, Target, BarChart2, Users, ShieldCheck, Gem } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <Rocket className="w-20 h-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Welcome to Habit Track
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Forge powerful habits, track your progress effortlessly, and unlock your full potential. Start your journey to a better you, today!
          </p>
          <Link href="/" passHref>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-3">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Habit Track?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Target className="w-12 h-12 text-primary mx-auto mb-3" />
                <CardTitle className="text-xl">Custom Habit Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Define habits your way - yes/no or measurable. Tailor tracking to fit your unique goals.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart2 className="w-12 h-12 text-primary mx-auto mb-3" />
                <CardTitle className="text-xl">Visual Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">See your journey unfold with our intuitive 30-day grid and insightful graphical reports.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mx-auto mb-3" />
                <CardTitle className="text-xl">Gamified Motivation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Earn XP, level up, and unlock badges. Make habit building fun and rewarding!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Placeholder Image Section */}
       <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Visualize Your Success</h2>
          <div className="flex justify-center">
            <Image
              src="https://placehold.co/800x450.png"
              alt="Habit Track App Screenshot"
              width={800}
              height={450}
              className="rounded-lg shadow-2xl border"
              data-ai-hint="app dashboard"
            />
          </div>
          <p className="text-center mt-6 text-muted-foreground text-lg">
            An intuitive interface designed to keep you focused and motivated.
          </p>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Habits?</h2>
          <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
            Join Habit Track today and take the first step towards achieving your goals.
            Upgrade to Premium for cloud sync and more!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/" passHref>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-3">
                  Start Tracking for Free
                </Button>
            </Link>
             <Link href="/#subscribe" passHref> {/* Or link to a dedicated pricing page if you create one */}
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-primary text-primary hover:bg-primary/10">
                    <Gem className="mr-2 h-5 w-5" /> View Premium Plans
                </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Habit Track. All rights reserved.</p>
          <p className="text-xs mt-1">Built with passion to help you succeed.</p>
        </div>
      </footer>
    </div>
  );
}
