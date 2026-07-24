import { Card } from '@/components/ui/card';

export function Platform() {
  return (
    <section className="container-page py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-eyebrow mb-3">The unified ledger</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Complete visibility across all your clouds</h2>
        <p className="text-muted-foreground text-lg">
          Cloudwarden integrates natively with your existing cloud providers to construct a real-time, unified ledger of every resource, its cost, and its utilization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 lift bg-card border-border">
          <div className="flex items-start justify-between mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#FF9900]/10 flex items-center justify-center font-bold text-[#FF9900]">01</div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold">AWS</div>
              <div className="text-xs text-muted-foreground">99.9% coverage</div>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground font-medium">
            <li>EC2 / Fargate / Lambda</li>
            <li>RDS / DynamoDB / ElastiCache</li>
            <li>S3 / EBS / EFS</li>
            <li>CloudFront / NAT Gateways</li>
          </ul>
        </Card>

        <Card className="p-6 lift bg-card border-border">
          <div className="flex items-start justify-between mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center font-bold text-[#4285F4]">02</div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold">GCP</div>
              <div className="text-xs text-muted-foreground">98.5% coverage</div>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground font-medium">
            <li>Compute Engine / GKE / Cloud Run</li>
            <li>Cloud SQL / Spanner / Bigtable</li>
            <li>Cloud Storage / Persistent Disk</li>
            <li>Cloud Load Balancing</li>
          </ul>
        </Card>

        <Card className="p-6 lift bg-card border-border">
          <div className="flex items-start justify-between mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#00A4EF]/10 flex items-center justify-center font-bold text-[#00A4EF]">03</div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold">Azure</div>
              <div className="text-xs text-muted-foreground">95.2% coverage</div>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground font-medium">
            <li>Virtual Machines / AKS / App Service</li>
            <li>Azure SQL / Cosmos DB</li>
            <li>Blob Storage / Managed Disks</li>
            <li>Azure Front Door / App Gateway</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}
