import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrustBanner() {
  return (
    <div className="border-y border-border bg-muted/30">
      <div className="container-page py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <span>Built for regulated, multi-account environments.</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-border" />
          <div className="font-mono text-xs flex flex-wrap justify-center gap-4 md:gap-8 opacity-80">
            <span>SOC 2 · ISO 27001 compatible</span>
            <span className="hidden sm:inline">AWS + GCP + Azure + K8s + SaaS + LLMs</span>
            <span>Append-only audit trail</span>
          </div>
        </div>
      </div>
    </div>
  );
}
