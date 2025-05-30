// src/app/landing/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  CheckCircle,
  Rocket,
  Target,
  BarChart2,
  Users,
  ShieldCheck,
  Gem,
  Zap,
  TrendingUp,
  Lightbulb,
  PlayCircle,
  Heart,
  ThumbsUp,
  Sparkles,
  MessageSquareText,
  StepForward,
  ListChecks,
  BarChartBig,
  PenSquare,
  Mail,
  Flame,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background opacity-75"></div>
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-accent/20 rounded-full filter blur-3xl opacity-60 animate-pulse animation-delay-2000"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Flame className="w-24 h-24 md:w-28 md:h-28 text-primary mx-auto mb-6 animate-bounce" />
          <h1 className="text-[50px] lg:text-[64px] font-extrabold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              Habit Track
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-light">
            Transform your life, one habit at a time. Effortlessly build, track,
            and master habits that stick. Your journey to peak productivity and
            personal growth starts now!
          </p>
          <p className="text-lg text-accent font-semibold mb-10">
            Completely free to use!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/" passHref>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-7 shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                <Zap className="mr-2 h-5 w-5" /> Start Your Journey
              </Button>
            </Link>
            <Link href="#features" passHref>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 border-primary text-primary hover:bg-primary/10 shadow-md transform hover:scale-105 transition-transform duration-300"
              >
                <PlayCircle className="mr-2 h-5 w-5" /> Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[30px] md:text-[36px] font-bold text-primary mb-4">
              Unlock Your Potential
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Habit Track is packed with features designed to make habit
              formation intuitive, engaging, and effective.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Tailored Habit Tracking",
                description:
                  "Define habits your way – simple yes/no or detailed measurable goals. Perfect for any objective.",
              },
              {
                icon: BarChart2,
                title: "Insightful Progress Visuals",
                description:
                  "Watch your journey unfold with our dynamic 30-day grid and comprehensive graphical reports.",
              },
              {
                icon: TrendingUp,
                title: "Gamified Motivation System",
                description:
                  "Earn XP, conquer levels, and unlock prestigious badges. Make building habits an adventure!",
              },
              {
                icon: Lightbulb,
                title: "AI-Powered Encouragement",
                description:
                  "Receive personalized motivational messages and empathetic support to keep you on track.",
              },
              {
                icon: Users,
                title: "Community & Support (Soon!)",
                description:
                  "Share your progress, find accountability partners, and grow with a supportive community.",
              },
              {
                icon: ShieldCheck,
                title: "Secure & Private",
                description:
                  "Your data is stored locally for privacy. Premium offers secure cloud sync for access anywhere.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-card text-card-foreground shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl overflow-hidden group"
              >
                <CardHeader className="bg-gradient-to-br from-primary/5 via-background to-background p-6">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-[25px] font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <CardDescription className="text-md text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <StepForward className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-[30px] md:text-[36px] font-bold text-foreground mb-4">
              Simple Steps to Success
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Getting started with Habit Track is as easy as 1-2-3.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: PenSquare,
                title: "Define Your Habit",
                description:
                  "Clearly outline the habit you want to build or break. Be specific, set your goals, and choose your tracking style!",
              },
              {
                icon: ListChecks,
                title: "Track Your Progress",
                description:
                  "Log your daily efforts with our intuitive interface. Every entry counts towards building momentum and achieving mastery.",
              },
              {
                icon: BarChartBig,
                title: "Visualize & Grow",
                description:
                  "See your streaks grow, unlock achievements, and understand your patterns with insightful graphical reports. Celebrate your wins!",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-[25px] font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-md text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Showcase Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[30px] md:text-[36px] font-bold text-foreground mb-4">
              Visualize Your New Self
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              An intuitive and beautiful interface designed to keep you focused,
              motivated, and in control.
            </p>
          </div>
          <div className="flex justify-center items-center p-4 md:p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-background rounded-2xl shadow-2xl">
            <Image
              src="https://placehold.co/1200x675.png"
              alt="Habit Track App Screenshot"
              width={1200}
              height={675}
              className="rounded-xl shadow-lg border-2 border-primary/20 object-cover"
              data-ai-hint="app dashboard analytics"
              priority
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <MessageSquareText className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-[30px] md:text-[36px] font-bold text-foreground mb-4">
              Loved by Achievers Like You
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Here's what early users are
              saying (placeholders).
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah L.",
                role: "Productivity Enthusiast",
                quote:
                  "Habit Track has been a game-changer for my daily routine! The visual progress and AI encouragement keep me motivated.",
                icon: ThumbsUp,
              },
              {
                name: "Mike P.",
                role: "Fitness Buff",
                quote:
                  "Finally, a habit tracker that's both powerful and easy to use. Tracking my workouts and water intake has never been simpler.",
                icon: Heart,
              },
              {
                name: "Jessica B.",
                role: "Lifelong Learner",
                quote:
                  "I love the gamified approach. Earning XP and badges for learning new skills makes the process so much more fun!",
                icon: Sparkles,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="bg-card text-card-foreground shadow-xl hover:shadow-accent/20 transition-shadow duration-300 rounded-xl overflow-hidden"
              >
                <CardContent className="p-6 text-center">
                  <testimonial.icon className="w-10 h-10 text-accent mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <h4 className="text-[25px] font-semibold text-primary">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground/80">
                    {testimonial.role}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Habit Track? Section */}
      <section id="why-us" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Lightbulb className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-[30px] md:text-[36px] font-bold text-foreground mb-4">
              Why Choose Habit Track?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              We focus on what truly matters for building lasting habits.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <Image
                src="https://placehold.co/600x450.png"
                alt="Focused user with Habit Track"
                width={600}
                height={450}
                className="rounded-xl shadow-lg border-2 border-accent/20 object-cover"
                data-ai-hint="focused person planning"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              {[
                {
                  title: "Simplicity & Power",
                  description:
                    "An intuitive interface backed by robust tracking and analytics. No clutter, just clarity.",
                  icon: Zap,
                },
                {
                  title: "Motivation Built-In",
                  description:
                    "Gamification, AI coaching, and visual feedback to keep you engaged and inspired.",
                  icon: TrendingUp,
                },
                {
                  title: "You Own Your Data",
                  description:
                    "Local-first storage means your personal data stays private. Optional cloud sync for convenience.",
                  icon: ShieldCheck,
                },
                {
                  title: "Continuous Improvement",
                  description:
                    "We're dedicated to evolving Habit Track with features that truly support your growth journey.",
                  icon: Gem,
                },
              ].map((point) => (
                <div
                  key={point.title}
                  className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-md"
                >
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-1">
                    <point.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[25px] font-semibold text-foreground mb-1">
                      {point.title}
                    </h4>
                    <p className="text-md text-muted-foreground">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-accent/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <Gem className="w-20 h-20 text-accent mx-auto mb-6" />
          <h2 className="text-[30px] md:text-[36px] font-bold mb-6">
            Ready to Build Lasting Habits?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take the first step towards a more disciplined and fulfilling life.
            Join Habit Track today and start forging the habits of success.
          </p>
          <p className="text-xl text-accent font-semibold mb-10">
            Start for free – no credit card required!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/" passHref>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                <CheckCircle className="mr-2 h-5 w-5" /> Get Started for Free
              </Button>
            </Link>
            <Link href="/#subscribe" passHref>
              {" "}
              {/* This might need to point to a real subscribe section or modal trigger */}
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 border-accent text-accent hover:bg-accent/10 shadow-md transform hover:scale-105 transition-transform duration-300"
              >
                <Gem className="mr-2 h-5 w-5" /> Explore Premium
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-md text-muted-foreground">
            &copy; {new Date().getFullYear()} Habit Track. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Crafted with <span className="text-primary">&hearts;</span> to
            empower your growth.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Dummy pages for footer links - you can create these later
export function PrivacyPage() {
  return (
    <div className="container mx-auto p-8">
      <h1>Privacy Policy</h1>
      <p>Details about your privacy policy...</p>
    </div>
  );
}
export function TermsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1>Terms of Service</h1>
      <p>Details about your terms of service...</p>
    </div>
  );
}
