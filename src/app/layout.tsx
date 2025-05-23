
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Changed from Outfit to Poppins
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
// Removed Sidebar imports as they are not used
// import { SidebarProvider, SidebarInset, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
// import { Button } from '@/components/ui/button';
// import { Flame } from 'lucide-react';

const poppins = Poppins({ // Changed from outfit to poppins
  variable: '--font-poppins', // Changed variable name
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'], // Added common weights for Poppins
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
      <body className={`${poppins.variable} antialiased`} suppressHydrationWarning={true}> {/* Used poppins.variable */}
        {/* Removed SidebarProvider and Sidebar structure */}
        <div className="flex flex-col min-h-screen">
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
