'use client';

import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";

// Use dynamic import with SSR disabled for components that rely on browser APIs
const MessagingApp = dynamic(() => import('@/components/MessagingApp'), { ssr: false });

// Create a client
const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <div className="h-screen w-full overflow-hidden" role="application" aria-label="Messaging Application">
            <Toaster />
            <Sonner />
            <MessagingApp />
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
