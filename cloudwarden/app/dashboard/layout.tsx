"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AgentDemo } from "@/components/dashboard/agent-demo";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Overview';
  const title = pageTitle === 'dashboard' ? 'Overview' : pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  return (
    <div className="min-h-screen bg-muted/40 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden md:pl-64">
        {/* Top Header */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-6 shrink-0">
          <h1 className="text-xl font-display font-semibold">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search resources..."
                className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
              />
            </div>
            <Button variant="outline" size="icon" className="relative rounded-full">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
      <AgentDemo />
    </div>
  );
}
