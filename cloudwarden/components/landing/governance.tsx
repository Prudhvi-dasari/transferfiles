import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export function Governance() {
  return (
    <section className="container-page py-24 bg-muted/30">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-eyebrow mb-3">Governance</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Policy as code. Evidence by default.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Define your FinOps boundaries in code. Cloudwarden translates your YAML policies into safe, deterministic actions while maintaining a cryptographic audit trail of every change.
          </p>
          
          <div className="flex flex-col gap-4">
            {[
              'Append-only ledger of all decisions',
              'Cryptographically signed actions',
              'Single-call rollback via API'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-brand-500/10 rounded-full p-1">
                  <Check className="w-4 h-4 text-brand-500" />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Card className="bg-zinc-950 border-border/10 overflow-hidden shadow-2xl">
            <div className="flex items-center px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="ml-4 flex-1 text-center font-mono text-xs text-zinc-400">
                policy/compute-savings.yaml
              </div>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre">
              <span className="text-pink-400">name</span><span className="text-zinc-300">: non-prod-idle-shutdown</span>
              {'\n'}
              <span className="text-pink-400">resource</span><span className="text-zinc-300">: aws_ec2_instance</span>
              {'\n'}
              <span className="text-pink-400">filters</span><span className="text-zinc-300">:</span>
              {'\n'}
              <span className="text-zinc-300">  - </span><span className="text-pink-400">tag</span><span className="text-zinc-300">: {`env`}</span>
              {'\n'}
              <span className="text-zinc-300">    </span><span className="text-pink-400">value</span><span className="text-zinc-300">: </span><span className="text-amber-300">"dev"</span>
              {'\n'}
              <span className="text-zinc-300">  - </span><span className="text-pink-400">metrics</span><span className="text-zinc-300">:</span>
              {'\n'}
              <span className="text-zinc-300">      </span><span className="text-pink-400">name</span><span className="text-zinc-300">: CPUUtilization</span>
              {'\n'}
              <span className="text-zinc-300">      </span><span className="text-pink-400">operator</span><span className="text-zinc-300">: less_than</span>
              {'\n'}
              <span className="text-zinc-300">      </span><span className="text-pink-400">value</span><span className="text-zinc-300">: </span><span className="text-purple-400">2</span>
              {'\n'}
              <span className="text-zinc-300">      </span><span className="text-pink-400">period</span><span className="text-zinc-300">: </span><span className="text-amber-300">"4h"</span>
              {'\n'}
              <span className="text-pink-400">actions</span><span className="text-zinc-300">:</span>
              {'\n'}
              <span className="text-zinc-300">  - </span><span className="text-pink-400">type</span><span className="text-zinc-300">: stop</span>
              {'\n'}
              <span className="text-zinc-300">    </span><span className="text-pink-400">schedule</span><span className="text-zinc-300">: </span><span className="text-amber-300">"cron(0 20 * * ? *)"</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
