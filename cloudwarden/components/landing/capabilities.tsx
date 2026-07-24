import { Cloud, Cpu, ShieldCheck, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function Capabilities() {
  return (
    <section className="container-page py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 lift border-border bg-card">
          <Cloud className="w-10 h-10 text-brand-500 mb-6" />
          <h3 className="text-xl font-bold mb-4">Watch</h3>
          <ul className="space-y-3">
            {[
              'Real-time drift detection',
              'Cross-account cost rollups',
              'LLM token attribution'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <Check className="w-5 h-5 text-brand-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        <Card className="p-8 lift border-border bg-card">
          <Cpu className="w-10 h-10 text-brand-500 mb-6" />
          <h3 className="text-xl font-bold mb-4">Act</h3>
          <ul className="space-y-3">
            {[
              'Reversible automated actions',
              'Custom maintenance windows',
              'Dry-run pre-execution mode'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <Check className="w-5 h-5 text-brand-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-8 lift border-border bg-card">
          <ShieldCheck className="w-10 h-10 text-brand-500 mb-6" />
          <h3 className="text-xl font-bold mb-4">Govern</h3>
          <ul className="space-y-3">
            {[
              'Append-only audit ledger',
              'Per-action compliance evidence',
              'Single-click rollback'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <Check className="w-5 h-5 text-brand-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
