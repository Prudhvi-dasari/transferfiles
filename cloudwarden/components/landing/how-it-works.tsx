'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Search, BrainCircuit, PlaySquare, FileCheck } from 'lucide-react';

const tabs = [
  { id: 'discover', label: 'Discover', icon: Search },
  { id: 'decide', label: 'Decide', icon: BrainCircuit },
  { id: 'act', label: 'Act', icon: PlaySquare },
  { id: 'audit', label: 'Audit', icon: FileCheck },
];

const tabContent = {
  discover: {
    title: 'Continuously scan every resource, every minute',
    description: 'Cloudwarden maintains an up-to-the-minute inventory of your cloud footprint, tracking usage metrics and configuration drift.',
    stats: [
      { label: 'Resources tracked', value: '4.2M+' },
      { label: 'Scan latency', value: '< 90s' },
    ],
    terminal: [
      '> cloudwarden scan --target all',
      '[info] Fetching AWS inventory across 14 accounts...',
      '[info] Fetching GCP inventory across 3 projects...',
      '[success] Sync complete. 4,219,892 resources indexed.',
      '> cat inventory.diff',
      '+ 14 EC2 instances (us-east-1)',
      '- 2 RDS clusters (eu-west-1)'
    ]
  },
  decide: {
    title: 'Rank candidates by confidence and projected ROI',
    description: 'Our decision engine analyzes historical patterns to identify waste and surface high-confidence savings opportunities.',
    stats: [
      { label: 'Avg. confidence', value: '98.4%' },
      { label: 'Rule types', value: '150+' },
    ],
    terminal: [
      '> cloudwarden analyze --focus compute',
      '[info] Analyzing usage patterns over 30d window...',
      'Found 47 actionable candidates:',
      '  1. [High] Downsize RDS (prod-db-1) - $1.2k/mo',
      '  2. [High] Delete unattached EBS - $450/mo',
      '  3. [Med] Migrate to GRAVITON3 - $380/mo',
      '> cloudwarden approve --candidate 1,2'
    ]
  },
  act: {
    title: 'Execute the pre-approved remediation',
    description: 'Automate the execution of cost-saving actions within your maintenance windows with single-click rollbacks.',
    stats: [
      { label: 'Actions automated', value: '85%' },
      { label: 'MTTR', value: '< 2m' },
    ],
    terminal: [
      '> cloudwarden execute --queue pending',
      '[exec] Starting job: spot_swap (us-east-1)',
      '  ✓ Draining node group worker-group-1',
      '  ✓ Provisioning spot fleet',
      '  ✓ Attaching to load balancer',
      '[success] Job spot_swap completed. Saving $42.50/day.',
      '[exec] Starting job: rightsize (prod-db-1)...'
    ]
  },
  audit: {
    title: 'Sign, timestamp, and archive every decision',
    description: 'Maintain a pristine, append-only ledger of every action taken for compliance, SOC 2 audits, and FinOps reporting.',
    stats: [
      { label: 'Retention', value: '7 Years' },
      { label: 'Format', value: 'JSON/CSV' },
    ],
    terminal: [
      '> cloudwarden audit --last 24h',
      '[info] Generating compliance report...',
      '{',
      '  "id": "evt_9a8b7c6d",',
      '  "timestamp": "2024-05-12T14:32:01Z",',
      '  "action": "spot_swap",',
      '  "actor": "system_agent",',
      '  "status": "success",',
      '  "signature": "sha256:8f4e2d..."',
      '}'
    ]
  }
};

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState('discover');
  const content = tabContent[activeTab as keyof typeof tabContent];

  return (
    <section id="how-it-works" className="container-page py-24 bg-muted/30">
      <div className="mb-16">
        <p className="text-eyebrow mb-3">The four phases</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">How Cloudwarden works</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-1/3 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 rounded-lg transition-all text-left whitespace-nowrap min-w-32 lg:min-w-0 border",
                  isActive 
                    ? "bg-card shadow-sm border-brand-500/20 text-foreground" 
                    : "hover:bg-muted border-transparent text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-brand-500" : "")} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="w-full lg:w-2/3">
          <Card className="p-8 border-border bg-card shadow-sm h-full flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">{content.title}</h3>
              <p className="text-muted-foreground mb-8 text-lg">{content.description}</p>
              
              <div className="grid grid-cols-2 gap-6">
                {content.stats.map((stat, i) => (
                  <div key={i}>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-semibold font-mono">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-zinc-950 rounded-lg p-4 font-mono text-xs overflow-hidden text-zinc-400 leading-relaxed shadow-inner">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-1">
                {content.terminal.map((line, i) => (
                  <div key={i} className={
                    line.startsWith('>') ? 'text-zinc-100' :
                    line.includes('[success]') ? 'text-green-400' :
                    line.includes('[error]') ? 'text-red-400' :
                    line.includes('[info]') ? 'text-blue-400' :
                    line.includes('[exec]') ? 'text-amber-400' : ''
                  }>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
