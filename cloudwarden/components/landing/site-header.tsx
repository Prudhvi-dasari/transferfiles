'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun, Menu, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cw_token');
      if (token) setIsLoggedIn(true);
    }
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-border py-3 shadow-sm" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container-page flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-brand-500 p-1.5 rounded-md text-white transition-transform group-hover:scale-105">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Cloudwarden</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#platform" className="text-muted-foreground hover:text-foreground transition-colors">Platform</Link>
          <Link href="#capabilities" className="text-muted-foreground hover:text-foreground transition-colors">Capabilities</Link>
          <Link href="#outcomes" className="text-muted-foreground hover:text-foreground transition-colors">Outcomes</Link>
          <Link href="mailto:contact@iprudhvi.in" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute top-2.5 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>
          
          {isLoggedIn ? (
            <Button asChild variant="outline" className="border-border font-medium">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="bg-brand-500 hover:bg-brand-600 text-white font-medium">
              <Link href="mailto:contact@iprudhvi.in">Request a demo</Link>
            </Button>
          )}
        </div>

        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg md:hidden">
          <Link href="#platform" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-muted rounded-md font-medium">Platform</Link>
          <Link href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-muted rounded-md font-medium">Capabilities</Link>
          <Link href="#outcomes" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-muted rounded-md font-medium">Outcomes</Link>
          <Link href="mailto:contact@iprudhvi.in" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-muted rounded-md font-medium">Contact</Link>
          <div className="h-px bg-border my-2" />
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-medium">Theme</span>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 border border-border rounded-md"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          {isLoggedIn ? (
            <Button asChild className="w-full mt-2" variant="outline">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="w-full mt-2 bg-brand-500 hover:bg-brand-600 text-white">
              <Link href="mailto:contact@iprudhvi.in" onClick={() => setMobileMenuOpen(false)}>Request a demo</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
