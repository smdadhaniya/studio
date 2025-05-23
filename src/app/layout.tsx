
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Changed from Outfit to Poppins
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, SidebarInset, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

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
