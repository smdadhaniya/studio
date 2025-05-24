
import type { Badge, PresetHabitFormData, IconListItem } from './types';
import {
  Settings, BookOpen, Droplet, Dumbbell, Brain, Bed, Apple, Wrench, AlarmClock, GlassWater,
  PenSquare, CalendarDays, Headphones, Users, Smartphone, Sparkles, HeartHandshake, Lightbulb,
  DollarSign, Palette, Smile, Star, Sunrise, TrendingUp, Zap, Shield, CalendarCheck, Trophy,
  BarChartBig, Award, Gem, Check, Target, Moon, Briefcase, Coffee, Film, LineChart, Activity,
  Ruler, Podcast, ChefHat, BedDouble, Phone, SpellCheck, Flower, PenTool, Code2, Paintbrush,
  PiggyBank, ClipboardCheck, Languages, Music, GraduationCap
} from 'lucide-react';


export const XP_PER_COMPLETION = 10;
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000];

export const DEFAULT_USER_NAME = "Habit Tracker";

export const HABIT_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

export const HABIT_LUCIDE_ICONS_LIST: IconListItem[] = [
    { name: "Check", icon: Check },
    { name: "Target", icon: Target },
    { name: "Book Open", icon: BookOpen },
    { name: "Bed", icon: Bed },
    { name: "Apple", icon: Apple },
    { name: "Dumbbell", icon: Dumbbell },
    { name: "Brain", icon: Brain },
    { name: "Sunrise", icon: Sunrise },
    { name: "Moon", icon: Moon },
    { name: "Briefcase", icon: Briefcase },
    { name: "Smile", icon: Smile },
    { name: "Heart Handshake", icon: HeartHandshake },
    { name: "Dollar Sign", icon: DollarSign },
    { name: "Users", icon: Users },
    { name: "Coffee", icon: Coffee },
    { name: "Headphones", icon: Headphones },
    { name: "Palette", icon: Palette },
    { name: "Pen Square", icon: PenSquare },
    { name: "Line Chart", icon: LineChart },
    { name: "Film", icon: Film },
    { name: "Droplet", icon: Droplet },
    { name: "Wrench", icon: Wrench },
    { name: "Alarm Clock", icon: AlarmClock },
    { name: "Glass Water", icon: GlassWater },
    { name: "Calendar Days", icon: CalendarDays },
    { name: "Smartphone", icon: Smartphone },
    { name: "Sparkles", icon: Sparkles },
    { name: "Lightbulb", icon: Lightbulb },
    { name: "Settings", icon: Settings },
    { name: "Star", icon: Star },
    { name: "TrendingUp", icon: TrendingUp },
    { name: "Zap", icon: Zap },
    { name: "Shield", icon: Shield },
    { name: "CalendarCheck", icon: CalendarCheck },
    { name: "Trophy", icon: Trophy },
    { name: "BarChartBig", icon: BarChartBig },
    { name: "Award", icon: Award },
    { name: "Gem", icon: Gem },
    { name: "Activity", icon: Activity },
    { name: "Ruler", icon: Ruler },
    { name: "Podcast", icon: Podcast },
    { name: "ChefHat", icon: ChefHat },
    { name: "BedDouble", icon: BedDouble },
    { name: "Phone", icon: Phone },
    { name: "SpellCheck", icon: SpellCheck },
    { name: "Flower", icon: Flower },
    { name: "PenTool", icon: PenTool },
    { name: "Code2", icon: Code2 },
    { name: "Paintbrush", icon: Paintbrush },
    { name: "PiggyBank", icon: PiggyBank },
    { name: "ClipboardCheck", icon: ClipboardCheck },
    { name: "Languages", icon: Languages },
    { name: "Music", icon: Music },
    { name: "GraduationCap", icon: GraduationCap },
];

export const PREDEFINED_MEASUREMENT_UNITS: string[] = [
  'pages', 'minutes', 'hours', 'km', 'miles', 'steps', 'times', 'servings',
  'glasses', 'reps', 'sets', 'kg', 'g', 'lbs', 'calls', 'tasks', 'words', 'lines of code', 'songs', 'chapters', 'units',
  'currency', 'items', 'modules' // Added new units
];


export const PRESET_HABITS: PresetHabitFormData[] = [
  // Existing Measurable (10)
  { title: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day.', trackingFormat: 'measurable', measurableUnit: 'glasses', targetCount: 8, icon: 'Droplet' },
  { title: 'Read for 30 minutes', description: 'Expand your knowledge or enjoy a story.', trackingFormat: 'measurable', measurableUnit: 'minutes', targetCount: 30, icon: 'Book Open' },
  { title: 'Exercise for 30 minutes', description: 'Physical activity for a healthy body.', trackingFormat: 'measurable', measurableUnit: 'minutes', targetCount: 30, icon: 'Dumbbell' },
  { title: 'Meditate for 10 minutes', description: 'Clear your mind and reduce stress.', trackingFormat: 'measurable', measurableUnit: 'minutes', targetCount: 10, icon: 'Brain' },
  { title: 'Eat 5 servings of fruits/vegetables', description: 'Nutritious eating for well-being.', trackingFormat: 'measurable', measurableUnit: 'servings', targetCount: 5, icon: 'Apple' },
  { title: 'Practice a new skill for 20 mins', description: 'Learn coding, an instrument, etc.', trackingFormat: 'measurable', measurableUnit: 'minutes', targetCount: 20, icon: 'Wrench' },
  { title: 'Spend 15 mins learning', description: 'Focused learning on a chosen topic.', trackingFormat: 'measurable', measurableUnit: 'minutes', targetCount: 15, icon: 'Headphones' },
  { title: 'Limit social media to 30 mins', description: 'Reduce screen time and distractions.', trackingFormat: 'measurable', measurableUnit: 'minutes', targetCount: 30, icon: 'Smartphone' },
  { title: 'Tidy up for 15 minutes', description: 'Keep your living space organized.', trackingFormat: 'measurable', measurableUnit: 'minutes', targetCount: 15, icon: 'Sparkles' },
  { title: 'Practice gratitude (3 things)', description: 'List three things you are grateful for.', trackingFormat: 'measurable', measurableUnit: 'items', targetCount: 3, icon: 'Heart Handshake' },

  // New Measurable (10 more)
  { title: 'Write 500 words', description: 'Work on your novel, blog, or journal.', trackingFormat: 'measurable', measurableUnit: 'words', targetCount: 500, icon: 'PenTool' },
  { title: 'Practice coding for 1 hour', description: 'Develop your programming skills.', trackingFormat: 'measurable', measurableUnit: 'hours', targetCount: 1, icon: 'Code2' },
  { title: 'Spend 30 minutes on a hobby', description: 'Engage in a relaxing activity.', trackingFormat: 'measurable', measurableUnit: 'minutes', targetCount: 30, icon: 'Paintbrush' },
  { title: 'Save $10', description: 'Build your savings consistently.', trackingFormat: 'measurable', measurableUnit: 'currency', targetCount: 10, icon: 'PiggyBank' },
  { title: 'Complete 3 work/study tasks', description: 'Achieve your daily professional goals.', trackingFormat: 'measurable', measurableUnit: 'tasks', targetCount: 3, icon: 'ClipboardCheck' },
  { title: 'Walk 5,000 steps', description: 'Stay active with a daily step goal.', trackingFormat: 'measurable', measurableUnit: 'steps', targetCount: 5000, icon: 'TrendingUp' },
  { title: 'No social media for 2 hours straight', description: 'Focus without digital distractions.', trackingFormat: 'measurable', measurableUnit: 'hours', targetCount: 2, icon: 'Shield' },
  { title: 'Learn 5 new vocabulary items', description: 'Expand your language skills.', trackingFormat: 'measurable', measurableUnit: 'items', targetCount: 5, icon: 'Languages' },
  { title: 'Practice musical instrument for 20 mins', description: 'Hone your musical talents.', trackingFormat: 'measurable', measurableUnit: 'minutes', targetCount: 20, icon: 'Music' },
  { title: 'Complete 1 module of an online course', description: 'Progress in your online learning.', trackingFormat: 'measurable', measurableUnit: 'modules', targetCount: 1, icon: 'GraduationCap' },
  
  // Existing Yes/No (10)
  { title: 'Go to bed by 10 PM', description: 'Ensure adequate sleep for recovery.', trackingFormat: 'yes/no', icon: 'Bed' },
  { title: 'Wake up at 6 AM', description: 'Start your day early and productively.', trackingFormat: 'yes/no', icon: 'Alarm Clock' },
  { title: 'No sugary drinks', description: 'Opt for healthier beverage choices.', trackingFormat: 'yes/no', icon: 'Glass Water' },
  { title: 'Write in a journal', description: 'Reflect on your day, thoughts, and feelings.', trackingFormat: 'yes/no', icon: 'Pen Square' },
  { title: 'Plan your next day', description: 'Organize tasks and set priorities.', trackingFormat: 'yes/no', icon: 'Calendar Days' },
  { title: 'Connect with a loved one', description: 'Call or spend quality time.', trackingFormat: 'yes/no', icon: 'Users' },
  { title: 'Work on a personal project', description: 'Dedicate time to your passions.', trackingFormat: 'yes/no', icon: 'Lightbulb' },
  { title: 'Review finances/budget', description: 'Stay on top of your financial health.', trackingFormat: 'yes/no', icon: 'Dollar Sign' },
  { title: "Do something creative", description: "Painting, writing, music, etc.", trackingFormat: "yes/no", icon: "Palette" },
  { title: 'Compliment someone', description: 'Spread positivity and kindness.', trackingFormat: 'yes/no', icon: 'Smile' },

  // New Yes/No (10 more)
  { title: 'Take a 10-minute walk', description: 'A short break to refresh.', trackingFormat: 'yes/no', icon: 'Activity' },
  { title: 'No snooze button', description: 'Wake up right away.', trackingFormat: 'yes/no', icon: 'Sunrise' },
  { title: 'Stretch for 5 minutes', description: 'Improve flexibility and reduce tension.', trackingFormat: 'yes/no', icon: 'Activity' }, // Using Activity as stretch icon is not available
  { title: 'Drink a cup of green tea', description: 'Enjoy a healthy beverage.', trackingFormat: 'yes/no', icon: 'Coffee' }, // Using Coffee as placeholder
  { title: 'Listen to a podcast episode', description: 'Learn something new or be entertained.', trackingFormat: 'yes/no', icon: 'Podcast' },
  { title: 'Avoid processed foods for the day', description: 'Focus on whole, natural foods.', trackingFormat: 'yes/no', icon: 'ChefHat' },
  { title: 'Make your bed', description: 'Start the day with a small accomplishment.', trackingFormat: 'yes/no', icon: 'BedDouble' },
  { title: 'Call a family member or friend', description: 'Nurture your relationships.', trackingFormat: 'yes/no', icon: 'Phone' },
  { title: 'Learn one new word/fact', description: 'Daily micro-learning.', trackingFormat: 'yes/no', icon: 'SpellCheck' },
  { title: 'Water your plants', description: 'Care for your green companions.', trackingFormat: 'yes/no', icon: 'Flower' },
];


export const BADGES: Badge[] = [
  {
    id: 'first_completion',
    name: 'First Step',
    description: 'Complete a habit for the first time.',
    icon: 'Star',
    milestoneType: 'totalCompletions',
    milestoneValue: 1,
    xpReward: 5,
  },
  {
    id: 'dedicated_start',
    name: 'Dedicated Start',
    description: 'Complete any habit 5 times.',
    icon: 'Sunrise',
    milestoneType: 'totalCompletions',
    milestoneValue: 5,
    xpReward: 25,
  },
  {
    id: 'consistent_performer',
    name: 'Consistent Performer',
    description: 'Achieve a 3-day streak on any habit.',
    icon: 'TrendingUp',
    milestoneType: 'streak',
    milestoneValue: 3,
    xpReward: 30,
  },
  {
    id: '7_day_streak',
    name: 'Week Warrior',
    description: 'Maintain a habit streak for 7 days.',
    icon: 'Zap',
    milestoneType: 'streak',
    milestoneValue: 7,
    xpReward: 50,
  },
  {
    id: 'habit_committed',
    name: 'Committed',
    description: 'Log 15 completions for any single habit.',
    icon: 'Shield',
    milestoneType: 'totalCompletions',
    milestoneValue: 15,
    xpReward: 75,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete a habit every day for a full week (7 completions).',
    icon: 'CalendarCheck',
    milestoneType: 'totalCompletions',
    milestoneValue: 7,
    xpReward: 60,
  },
  {
    id: '30_day_streak',
    name: 'Month Master',
    description: 'Maintain a habit streak for 30 days.',
    icon: 'Trophy',
    milestoneType: 'streak',
    milestoneValue: 30,
    xpReward: 200,
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Log 50 total completions across all habits.',
    icon: 'BarChartBig',
    milestoneType: 'totalCompletions',
    milestoneValue: 50,
    xpReward: 100,
  },
  {
    id: 'level_5',
    name: 'Level 5 Reached',
    description: 'Reach Level 5 in your habit journey.',
    icon: 'Award',
    milestoneType: 'level',
    milestoneValue: 5,
    xpReward: 100,
  },
  {
    id: 'level_10_hero',
    name: 'Level 10 Hero',
    description: 'Reach Level 10 in your habit journey.',
    icon: 'Gem',
    milestoneType: 'level',
    milestoneValue: 10,
    xpReward: 150,
  }
];

export const MAX_PROGRESS_DAYS = 30;


    