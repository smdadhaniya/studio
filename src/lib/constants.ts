
import type { Badge, PresetHabitFormData } from './types';
import { 
    Award, Zap, Trophy, Star, ShieldCheck, CalendarDays, Sunrise, TrendingUp, Activity, Gem,
    CheckCircle, ListChecks, Target, BookOpen, Bed, Apple, Dumbbell, Brain, Moon, Briefcase, 
    Smile, Heart, DollarSign, Users, Coffee, Headphones, Palette, DraftingCompass, Edit, GitFork, 
    BarChart, Music, Film, Settings
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';


export const XP_PER_COMPLETION = 10;
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000]; 

export const DEFAULT_USER_NAME = "Habit Tracker";

export const HABIT_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

export const HABIT_ICONS_LIST: { name: string, Icon: LucideIcon }[] = [
    { name: "CheckCircle", Icon: CheckCircle },
    { name: "ListChecks", Icon: ListChecks },
    { name: "Target", Icon: Target },
    { name: "BookOpen", Icon: BookOpen },
    { name: "Bed", Icon: Bed },
    { name: "Apple", Icon: Apple },
    { name: "Dumbbell", Icon: Dumbbell },
    { name: "Brain", Icon: Brain },
    { name: "Sunrise", Icon: Sunrise },
    { name: "Moon", Icon: Moon },
    { name: "Briefcase", Icon: Briefcase },
    { name: "Smile", Icon: Smile },
    { name: "Heart", Icon: Heart },
    { name: "DollarSign", Icon: DollarSign },
    { name: "Users", Icon: Users },
    { name: "Coffee", Icon: Coffee },
    { name: "Headphones", Icon: Headphones },
    { name: "Palette", Icon: Palette },
    { name: "DraftingCompass", Icon: DraftingCompass },
    { name: "Edit", Icon: Edit },
    { name: "GitFork", Icon: GitFork },
    { name: "BarChart", Icon: BarChart },
    { name: "Music", Icon: Music },
    { name: "Film", Icon: Film },
    { name: "Settings", Icon: Settings },
];

export const PRESET_HABITS: PresetHabitFormData[] = [
  { title: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day.', trackingFormat: 'yes/no', icon: 'CheckCircle' },
  { title: 'Read for 30 minutes', description: 'Expand your knowledge or enjoy a story.', trackingFormat: 'yes/no', icon: 'BookOpen' },
  { title: 'Exercise for 30 minutes', description: 'Physical activity for a healthy body.', trackingFormat: 'yes/no', icon: 'Dumbbell' },
  { title: 'Meditate for 10 minutes', description: 'Clear your mind and reduce stress.', trackingFormat: 'yes/no', icon: 'Brain' },
  { title: 'Go to bed by 10 PM', description: 'Ensure adequate sleep for recovery.', trackingFormat: 'yes/no', icon: 'Bed' },
  { title: 'Eat 5 servings of fruits/vegetables', description: 'Nutritious eating for well-being.', trackingFormat: 'measurable', icon: 'Apple' },
  { title: 'Practice a new skill for 20 mins', description: 'Learn coding, an instrument, etc.', trackingFormat: 'yes/no', icon: 'DraftingCompass' },
  { title: 'Wake up at 6 AM', description: 'Start your day early and productively.', trackingFormat: 'yes/no', icon: 'Sunrise' },
  { title: 'No sugary drinks', description: 'Opt for healthier beverage choices.', trackingFormat: 'yes/no', icon: 'Coffee' }, // Using Coffee as a stand-in for drinks
  { title: 'Write in a journal', description: 'Reflect on your day, thoughts, and feelings.', trackingFormat: 'yes/no', icon: 'Edit' },
  { title: 'Plan your next day', description: 'Organize tasks and set priorities.', trackingFormat: 'yes/no', icon: 'ListChecks' },
  { title: 'Spend 15 mins learning', description: 'Focused learning on a chosen topic.', trackingFormat: 'yes/no', icon: 'Headphones' }, // Using Headphones for learning
  { title: 'Connect with a loved one', description: 'Call or spend quality time.', trackingFormat: 'yes/no', icon: 'Users' },
  { title: 'Limit social media to 30 mins', description: 'Reduce screen time and distractions.', trackingFormat: 'measurable', icon: 'Film' }, // Using Film as a stand-in for media
  { title: 'Tidy up for 15 minutes', description: 'Keep your living space organized.', trackingFormat: 'yes/no', icon: 'Briefcase' }, // Using Briefcase as a stand-in for tidying
  { title: 'Practice gratitude', description: 'List three things you are grateful for.', trackingFormat: 'yes/no', icon: 'Heart' },
  { title: 'Work on a personal project', description: 'Dedicate time to your passions.', trackingFormat: 'yes/no', icon: 'Palette' },
  { title: 'Review finances/budget', description: 'Stay on top of your financial health.', trackingFormat: 'yes/no', icon: 'DollarSign' },
  { title: 'Do something creative', description: 'Painting, writing, music, etc.', trackingFormat: 'yes/no', icon: 'Music' },
  { title: 'Compliment someone', description: 'Spread positivity and kindness.', trackingFormat: 'yes/no', icon: 'Smile' },
];


export const BADGES: Badge[] = [
  {
    id: 'first_completion',
    name: 'First Step',
    description: 'Complete a habit for the first time.',
    icon: Star,
    milestoneType: 'totalCompletions',
    milestoneValue: 1,
    xpReward: 5,
  },
  {
    id: 'dedicated_start',
    name: 'Dedicated Start',
    description: 'Complete any habit 5 times.',
    icon: Sunrise,
    milestoneType: 'totalCompletions',
    milestoneValue: 5,
    xpReward: 25,
  },
  {
    id: 'consistent_performer',
    name: 'Consistent Performer',
    description: 'Achieve a 3-day streak on any habit.',
    icon: TrendingUp,
    milestoneType: 'streak',
    milestoneValue: 3,
    xpReward: 30,
  },
  {
    id: '7_day_streak',
    name: 'Week Warrior',
    description: 'Maintain a habit streak for 7 days.',
    icon: Zap,
    milestoneType: 'streak',
    milestoneValue: 7,
    xpReward: 50,
  },
  {
    id: 'habit_committed',
    name: 'Committed',
    description: 'Log 15 completions for any single habit.',
    icon: ShieldCheck,
    milestoneType: 'totalCompletions', 
    milestoneValue: 15, 
    xpReward: 75,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete a habit every day for a full week (7 completions).',
    icon: CalendarDays,
    milestoneType: 'totalCompletions', 
    milestoneValue: 7,
    xpReward: 60,
  },
  {
    id: '30_day_streak',
    name: 'Month Master',
    description: 'Maintain a habit streak for 30 days.',
    icon: Trophy,
    milestoneType: 'streak',
    milestoneValue: 30,
    xpReward: 200,
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Log 50 total completions across all habits.',
    icon: Activity,
    milestoneType: 'totalCompletions', // This type implies checking sum of completions for all habits
    milestoneValue: 50,
    xpReward: 100,
  },
  {
    id: 'level_5',
    name: 'Level 5 Reached',
    description: 'Reach Level 5 in your habit journey.',
    icon: Award,
    milestoneType: 'level',
    milestoneValue: 5,
    xpReward: 100,
  },
  {
    id: 'level_10_hero',
    name: 'Level 10 Hero',
    description: 'Reach Level 10 in your habit journey.',
    icon: Gem,
    milestoneType: 'level',
    milestoneValue: 10,
    xpReward: 150,
  }
];

export const MAX_PROGRESS_DAYS = 30;
