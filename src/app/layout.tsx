import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, SidebarInset, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarFooter } from '@/components/ui/sidebar'; // Assuming Sidebar can be minimal
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Habit Forge',
  description: 'Forge new habits and track your progress.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
        <SidebarProvider defaultOpen={false}>
          <Sidebar collapsible="icon" variant="sidebar" className="border-r-0">
            {/* Minimal Sidebar content, can be expanded later */}
            <SidebarHeader className="p-2 flex items-center justify-between">
               {/* Placeholder for logo or simple trigger if sidebar is collapsed by default */}
            </SidebarHeader>
            <SidebarContent>
              {/* Navigation items can go here if needed in the future */}
            </SidebarContent>
            <SidebarFooter>
              {/* Footer items */}
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
