import { Card } from '@/components/ui/card';

export function Outcomes() {
  const stats = [
    { value: '30–50%', label: 'Average savings on compute and storage spend within first 90 days' },
    { value: '24 / 7', label: 'Autonomous agent running continuously without human intervention' },
    { value: '< 90s', label: 'End-to-end latency from drift detection to executed remediation' },
    { value: '100%', label: 'Cryptographically verified, replayable audit log of all decisions' }
  ];

  return (
    <section className="container-page py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <p className="text-muted-foreground font-medium leading-relaxed mt-2">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
