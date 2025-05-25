
import type { Metadata } from 'next';
import Link from 'next/link'; // Added for navigation
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Habit Track',
  description: 'Track new habits and monitor your progress.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${poppins.variable} antialiased`} suppressHydrationWarning={true}>
        <div className="flex flex-col min-h-screen">
          {/* New Global Navigation Bar */}
          <nav className="w-full bg-card border-b border-border shadow-sm sticky top-0 z-50">
            <div className="container mx-auto flex h-14 items-center justify-start gap-x-4 sm:gap-x-6 px-4">
              <Link href="/landing" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2">
                Home
              </Link>
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2">
                My Habits
              </Link>
              <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2">
                Admin
              </Link>
            </div>
          </nav>

          {/* The main content area */}
          <main className="flex-grow">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
