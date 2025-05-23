
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google'; // Changed from Geist to Outfit
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, SidebarInset, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

const outfit = Outfit({ // Changed from geistSans/geistMono to outfit
  variable: '--font-outfit', // Changed variable name
  subsets: ['latin'],
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
      <body className={`${outfit.variable} antialiased`} suppressHydrationWarning={true}> {/* Used outfit.variable */}
        <SidebarProvider defaultOpen={false}>
          <Sidebar collapsible="icon" variant="sidebar" className="border-r-0">
            <SidebarHeader className="p-2 flex items-center justify-between">
            </SidebarHeader>
            <SidebarContent>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
