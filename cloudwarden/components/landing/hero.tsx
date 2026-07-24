import { ArrowRight, Send, CircleDollarSign, Leaf, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="container-page pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div>
            <Badge variant="outline" className="text-sm font-medium bg-background border-border">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse mr-2" />
              Always-on · Autonomous agent · SOC 2 friendly
            </Badge>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Cloud cost control that runs <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">while you sleep.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Cloudwarden is the continuous FinOps platform that detects drift, recommends sizing, and executes cost-saving changes automatically across your multi-cloud environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-600 text-white shadow-brand">
              <Link href="mailto:contact@iprudhvi.in">
                <Send className="w-4 h-4 mr-2" />
                Request a demo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border">
              <Link href="#how-it-works">
                See how it works
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Contact us at <a href="mailto:contact@iprudhvi.in" className="text-brand-500 hover:underline">contact@iprudhvi.in</a>
          </p>
        </div>
        
        <div className="relative z-10 w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 to-transparent rounded-xl blur-3xl -z-10" />
          <Card className="p-6 bg-card/80 backdrop-blur border-border lift overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="text-brand-500 w-5 h-5" />
                <h3 className="font-semibold">Live Cost Tracking</h3>
              </div>
              <Badge variant="secondary" className="bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                Active
              </Badge>
            </div>
            
            <div className="h-40 w-full bg-muted/30 rounded-lg mb-6 flex items-end relative overflow-hidden border border-border/50">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 Q20,70 40,85 T80,60 T100,50 L100,100 L0,100 Z" className="fill-brand-500/10" />
                <path d="M0,80 Q20,70 40,85 T80,60 T100,50" className="stroke-brand-500 stroke-2 fill-none" />
                <path d="M0,90 Q30,90 50,70 T100,30" className="stroke-muted-foreground/30 stroke-2 fill-none stroke-dasharray-4" strokeDasharray="4" />
              </svg>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Month-to-date</p>
                <p className="text-lg font-mono font-semibold">$284.1k</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-green-500" /> Saved
                </p>
                <p className="text-lg font-mono font-semibold text-green-500">$92.6k</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <TriangleAlert className="w-3 h-3 text-amber-500" /> Open candidates
                </p>
                <p className="text-lg font-mono font-semibold">47</p>
              </div>
            </div>
            
            <div className="bg-zinc-950 rounded p-3 font-mono text-xs text-green-400 flex items-center gap-2">
              <span className="text-zinc-500">❯</span>
              <span>Executed: spot_swap (us-east-1) - Saving $42.50/day</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
