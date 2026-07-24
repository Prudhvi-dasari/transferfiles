import { Cloud, GitBranch, Sparkles, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ContactCTA() {
  return (
    <section className="container-page py-24">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 to-transparent rounded-2xl blur-3xl -z-10" />
        <Card className="bg-card/80 backdrop-blur border-border p-8 md:p-12 rounded-2xl overflow-hidden shadow-brand">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to automate your cloud cost?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join engineering teams that have automated their FinOps lifecycle. Stop building internal dashboards and let Cloudwarden manage the complexity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-600 text-white">
                  <Link href="mailto:contact@iprudhvi.in">
                    <Send className="w-4 h-4 mr-2" />
                    Request a demo
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-border">
                  <Link href="mailto:contact@iprudhvi.in">
                    Contact sales
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:pl-12 lg:border-l border-border/50">
              <div className="flex items-start gap-4">
                <div className="bg-brand-500/10 p-2 rounded-lg shrink-0">
                  <Cloud className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Multi-cloud native</h4>
                  <p className="text-sm text-muted-foreground mt-1">One platform for AWS, GCP, Azure, and Kubernetes.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-brand-500/10 p-2 rounded-lg shrink-0">
                  <GitBranch className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Policy as code</h4>
                  <p className="text-sm text-muted-foreground mt-1">Define guardrails in YAML, versioned in your Git repo.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-brand-500/10 p-2 rounded-lg shrink-0">
                  <Sparkles className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Autonomous execution</h4>
                  <p className="text-sm text-muted-foreground mt-1">Moves beyond read-only to active remediation.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
