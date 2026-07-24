// ── Mock data for the CloudWarden dashboard ──

export interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: "AWS" | "GCP" | "Azure";
  region: string;
  status: "running" | "idle" | "stopped" | "optimized";
  monthlyCost: number;
  cpuUtilization: number;
  memoryUtilization: number;
  createdAt: string;
  tags: string[];
}

export interface Action {
  id: string;
  type: "spot_swap" | "rightsize" | "scale_down" | "terminate" | "resize_pool" | "rightsize_rds";
  resource: string;
  provider: "AWS" | "GCP" | "Azure";
  status: "completed" | "pending" | "in_progress" | "rolled_back";
  savingsPerMonth: number;
  executedAt: string;
  executedBy: "agent" | "manual";
  description: string;
}

export interface Policy {
  id: string;
  name: string;
  version: number;
  scope: string;
  status: "active" | "draft" | "disabled";
  actions: string[];
  window: string;
  cooldown: string;
  requireApproval: boolean;
  lastUpdated: string;
  yaml: string;
}

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  resource: string;
  provider: "AWS" | "GCP" | "Azure";
  createdAt: string;
  acknowledged: boolean;
}

export interface DashboardStats {
  monthToDate: number;
  totalSaved: number;
  openCandidates: number;
  activeResources: number;
  savingsPercent: number;
  actionsToday: number;
  monthlyTrend: { month: string; actual: number; counterfactual: number }[];
  providerBreakdown: { provider: string; cost: number; percentage: number }[];
}

// ── Dashboard Stats ──
export const dashboardStats: DashboardStats = {
  monthToDate: 284100,
  totalSaved: 92600,
  openCandidates: 47,
  activeResources: 1847,
  savingsPercent: 32.6,
  actionsToday: 12,
  monthlyTrend: [
    { month: "Jan", actual: 312000, counterfactual: 312000 },
    { month: "Feb", actual: 305000, counterfactual: 318000 },
    { month: "Mar", actual: 298000, counterfactual: 330000 },
    { month: "Apr", actual: 289000, counterfactual: 345000 },
    { month: "May", actual: 281000, counterfactual: 358000 },
    { month: "Jun", actual: 275000, counterfactual: 372000 },
    { month: "Jul", actual: 270000, counterfactual: 385000 },
    { month: "Aug", actual: 266000, counterfactual: 395000 },
    { month: "Sep", actual: 260000, counterfactual: 408000 },
    { month: "Oct", actual: 255000, counterfactual: 418000 },
    { month: "Nov", actual: 250000, counterfactual: 425000 },
    { month: "Dec", actual: 246000, counterfactual: 432000 },
  ],
  providerBreakdown: [
    { provider: "AWS", cost: 156200, percentage: 55 },
    { provider: "GCP", cost: 79700, percentage: 28 },
    { provider: "Azure", cost: 48200, percentage: 17 },
  ],
};

// ── Cloud Resources ──
export const cloudResources: CloudResource[] = [
  {
    id: "i-0a91b3f4e8",
    name: "prod-api-server-1",
    type: "EC2 m5.2xlarge",
    provider: "AWS",
    region: "us-east-1",
    status: "running",
    monthlyCost: 1245,
    cpuUtilization: 72,
    memoryUtilization: 68,
    createdAt: "2025-03-14",
    tags: ["production", "api"],
  },
  {
    id: "i-0b72c4d5f9",
    name: "staging-worker-3",
    type: "EC2 c5.xlarge",
    provider: "AWS",
    region: "us-west-2",
    status: "idle",
    monthlyCost: 524,
    cpuUtilization: 3,
    memoryUtilization: 12,
    createdAt: "2025-06-22",
    tags: ["staging", "worker"],
  },
  {
    id: "i-0c63d5e6g0",
    name: "ml-training-gpu-1",
    type: "EC2 p3.2xlarge",
    provider: "AWS",
    region: "us-east-1",
    status: "running",
    monthlyCost: 4890,
    cpuUtilization: 89,
    memoryUtilization: 94,
    createdAt: "2025-01-08",
    tags: ["production", "ml"],
  },
  {
    id: "gce-prod-8a2f",
    name: "analytics-cluster-node-1",
    type: "GCE n2-standard-8",
    provider: "GCP",
    region: "us-central1",
    status: "running",
    monthlyCost: 892,
    cpuUtilization: 45,
    memoryUtilization: 62,
    createdAt: "2025-04-18",
    tags: ["production", "analytics"],
  },
  {
    id: "gce-dev-3b4c",
    name: "dev-playground-vm",
    type: "GCE e2-standard-4",
    provider: "GCP",
    region: "europe-west1",
    status: "idle",
    monthlyCost: 198,
    cpuUtilization: 1,
    memoryUtilization: 8,
    createdAt: "2025-08-01",
    tags: ["development"],
  },
  {
    id: "gke-pool-7c5d",
    name: "gke-prod-analytics-pool",
    type: "GKE Node Pool",
    provider: "GCP",
    region: "us-central1",
    status: "optimized",
    monthlyCost: 2340,
    cpuUtilization: 7,
    memoryUtilization: 22,
    createdAt: "2025-02-12",
    tags: ["production", "kubernetes"],
  },
  {
    id: "azure-vm-4d6e",
    name: "eu-web-frontend-1",
    type: "Azure D4s v5",
    provider: "Azure",
    region: "westeurope",
    status: "running",
    monthlyCost: 645,
    cpuUtilization: 58,
    memoryUtilization: 42,
    createdAt: "2025-05-30",
    tags: ["production", "frontend"],
  },
  {
    id: "azure-vm-5e7f",
    name: "test-cosmos-db-vm",
    type: "Azure B2s",
    provider: "Azure",
    region: "eastus",
    status: "stopped",
    monthlyCost: 0,
    cpuUtilization: 0,
    memoryUtilization: 0,
    createdAt: "2025-07-15",
    tags: ["test", "database"],
  },
  {
    id: "rds-prod-1a2b",
    name: "prod-postgres-primary",
    type: "RDS db.r5.xlarge",
    provider: "AWS",
    region: "us-east-1",
    status: "running",
    monthlyCost: 1560,
    cpuUtilization: 34,
    memoryUtilization: 71,
    createdAt: "2024-11-20",
    tags: ["production", "database"],
  },
  {
    id: "lambda-batch-9x",
    name: "nightly-etl-batch",
    type: "Lambda 1024MB",
    provider: "AWS",
    region: "us-east-1",
    status: "running",
    monthlyCost: 89,
    cpuUtilization: 15,
    memoryUtilization: 45,
    createdAt: "2025-09-03",
    tags: ["production", "etl"],
  },
  {
    id: "bq-dataset-5f",
    name: "analytics-warehouse",
    type: "BigQuery Dataset",
    provider: "GCP",
    region: "US",
    status: "running",
    monthlyCost: 3200,
    cpuUtilization: 0,
    memoryUtilization: 0,
    createdAt: "2024-06-15",
    tags: ["production", "analytics", "data"],
  },
  {
    id: "aks-node-7g8h",
    name: "aks-microservices-pool",
    type: "AKS Node Pool",
    provider: "Azure",
    region: "westeurope",
    status: "running",
    monthlyCost: 1870,
    cpuUtilization: 62,
    memoryUtilization: 55,
    createdAt: "2025-01-22",
    tags: ["production", "kubernetes", "microservices"],
  },
];

// ── Actions / Audit Trail ──
export const actions: Action[] = [
  {
    id: "act_001",
    type: "spot_swap",
    resource: "i-0a91b3f4e8",
    provider: "AWS",
    status: "completed",
    savingsPerMonth: 317,
    executedAt: "2026-07-24T08:42:38Z",
    executedBy: "agent",
    description: "Swapped on-demand i-0a91b3f4e8 to Spot instance, saving $317/mo",
  },
  {
    id: "act_002",
    type: "rightsize",
    resource: "gce-prod-8a2f",
    provider: "GCP",
    status: "completed",
    savingsPerMonth: 234,
    executedAt: "2026-07-24T07:18:12Z",
    executedBy: "agent",
    description: "Right-sized analytics-cluster-node-1 from n2-standard-8 to n2-standard-4",
  },
  {
    id: "act_003",
    type: "scale_down",
    resource: "gke-pool-7c5d",
    provider: "GCP",
    status: "completed",
    savingsPerMonth: 780,
    executedAt: "2026-07-24T06:05:44Z",
    executedBy: "agent",
    description: "Scaled GKE prod-analytics pool from 3 to 1 node (CPU avg 7%)",
  },
  {
    id: "act_004",
    type: "terminate",
    resource: "i-0b72c4d5f9",
    provider: "AWS",
    status: "pending",
    savingsPerMonth: 524,
    executedAt: "2026-07-24T05:30:00Z",
    executedBy: "agent",
    description: "Scheduled termination of idle staging-worker-3 (3% CPU for 72h)",
  },
  {
    id: "act_005",
    type: "rightsize_rds",
    resource: "rds-prod-1a2b",
    provider: "AWS",
    status: "in_progress",
    savingsPerMonth: 420,
    executedAt: "2026-07-24T04:15:22Z",
    executedBy: "agent",
    description: "Right-sizing prod-postgres from db.r5.xlarge to db.r5.large",
  },
  {
    id: "act_006",
    type: "spot_swap",
    resource: "azure-vm-4d6e",
    provider: "Azure",
    status: "completed",
    savingsPerMonth: 258,
    executedAt: "2026-07-23T22:45:10Z",
    executedBy: "agent",
    description: "Moved eu-web-frontend-1 to Azure Spot VM with fallback",
  },
  {
    id: "act_007",
    type: "resize_pool",
    resource: "aks-node-7g8h",
    provider: "Azure",
    status: "rolled_back",
    savingsPerMonth: 0,
    executedAt: "2026-07-23T20:12:30Z",
    executedBy: "agent",
    description: "Attempted resize of AKS pool — rolled back due to pod scheduling conflict",
  },
  {
    id: "act_008",
    type: "terminate",
    resource: "gce-dev-3b4c",
    provider: "GCP",
    status: "completed",
    savingsPerMonth: 198,
    executedAt: "2026-07-23T18:30:00Z",
    executedBy: "manual",
    description: "Manual termination of idle dev-playground-vm",
  },
  {
    id: "act_009",
    type: "scale_down",
    resource: "lambda-batch-9x",
    provider: "AWS",
    status: "completed",
    savingsPerMonth: 34,
    executedAt: "2026-07-23T14:20:15Z",
    executedBy: "agent",
    description: "Reduced Lambda memory from 1024MB to 512MB based on usage patterns",
  },
  {
    id: "act_010",
    type: "rightsize",
    resource: "bq-dataset-5f",
    provider: "GCP",
    status: "completed",
    savingsPerMonth: 890,
    executedAt: "2026-07-23T10:05:30Z",
    executedBy: "agent",
    description: "Converted BigQuery dataset to flat-rate pricing, moved cold tables to Archive",
  },
];

// ── Policies ──
export const policies: Policy[] = [
  {
    id: "pol_001",
    name: "non-prod-cost-optimizer",
    version: 17,
    scope: "env:non-prod | tag:cost-opt",
    status: "active",
    actions: ["resize_pool", "spot_swap", "rightsize_rds"],
    window: "blue-hours",
    cooldown: "6h",
    requireApproval: false,
    lastUpdated: "2026-07-20",
    yaml: `# Non-production cost optimization policy
name: non-prod-cost-optimizer
version: 17
window: blue-hours
scope: env:non-prod | tag:cost-opt
allow:
  - resize_pool
  - spot_swap
  - rightsize_rds
require_approval: false  # auto-approved after v3
cooldown: 6h
rollback: signed_single_call
notifications:
  slack: "#finops-alerts"
  email: platform-team@company.com`,
  },
  {
    id: "pol_002",
    name: "prod-conservative",
    version: 8,
    scope: "env:production",
    status: "active",
    actions: ["spot_swap"],
    window: "maintenance-window",
    cooldown: "24h",
    requireApproval: true,
    lastUpdated: "2026-07-18",
    yaml: `# Production conservative policy
name: prod-conservative
version: 8
window: maintenance-window  # Sat 02:00-06:00 UTC
scope: env:production
allow:
  - spot_swap
deny:
  - terminate
  - scale_down
require_approval: true  # always require human sign-off
cooldown: 24h
rollback: signed_single_call
guard:
  min_cpu_headroom: 30%
  min_memory_headroom: 25%
  blackout_dates:
    - "2026-12-20/2027-01-05"  # holiday freeze`,
  },
  {
    id: "pol_003",
    name: "k8s-autoscaler",
    version: 5,
    scope: "resource:kubernetes/*",
    status: "active",
    actions: ["resize_pool", "scale_down"],
    window: "always",
    cooldown: "2h",
    requireApproval: false,
    lastUpdated: "2026-07-15",
    yaml: `# Kubernetes autoscaler policy
name: k8s-autoscaler
version: 5
window: always
scope: resource:kubernetes/*
allow:
  - resize_pool
  - scale_down
require_approval: false
cooldown: 2h
rollback: signed_single_call
guard:
  min_nodes: 1
  max_scale_down_percent: 50
  respect_pdb: true`,
  },
  {
    id: "pol_004",
    name: "saas-seat-reclaimer",
    version: 2,
    scope: "resource:saas/*",
    status: "draft",
    actions: ["reclaim_seat"],
    window: "business-hours",
    cooldown: "168h",
    requireApproval: true,
    lastUpdated: "2026-07-10",
    yaml: `# SaaS seat reclamation policy (DRAFT)
name: saas-seat-reclaimer
version: 2
window: business-hours
scope: resource:saas/*
allow:
  - reclaim_seat
require_approval: true
cooldown: 168h  # 7 days
idle_threshold: 30d  # no login for 30 days
notify_user_before: 7d
rollback: manual`,
  },
];

// ── Alerts ──
export const alerts: Alert[] = [
  {
    id: "alt_001",
    severity: "critical",
    title: "Spend spike detected",
    description: "AWS us-east-1 spend increased 340% over 24h baseline. Anomaly traced to untagged EC2 instances launched at 02:14 UTC.",
    resource: "aws://us-east-1",
    provider: "AWS",
    createdAt: "2026-07-24T08:14:00Z",
    acknowledged: false,
  },
  {
    id: "alt_002",
    severity: "warning",
    title: "GKE node pool over-provisioned",
    description: "gke/prod-analytics node pool running at 7% avg CPU across 3 nodes for the past 48 hours. Candidate for scale-down.",
    resource: "gke-pool-7c5d",
    provider: "GCP",
    createdAt: "2026-07-24T06:30:00Z",
    acknowledged: false,
  },
  {
    id: "alt_003",
    severity: "warning",
    title: "RDS instance underutilized",
    description: "prod-postgres-primary running at 34% CPU and 71% memory. Consider right-sizing from db.r5.xlarge to db.r5.large.",
    resource: "rds-prod-1a2b",
    provider: "AWS",
    createdAt: "2026-07-24T04:00:00Z",
    acknowledged: true,
  },
  {
    id: "alt_004",
    severity: "info",
    title: "Spot interruption handled",
    description: "Azure Spot VM eu-web-frontend-1 received interruption notice. Automatic fallback to on-demand completed in 8s.",
    resource: "azure-vm-4d6e",
    provider: "Azure",
    createdAt: "2026-07-23T22:50:00Z",
    acknowledged: true,
  },
  {
    id: "alt_005",
    severity: "critical",
    title: "LLM token budget exceeded",
    description: "OpenAI API spend has exceeded the monthly budget of $5,000. Current spend: $6,240. Rate limiting applied.",
    resource: "llm/openai-prod",
    provider: "GCP",
    createdAt: "2026-07-23T16:00:00Z",
    acknowledged: false,
  },
  {
    id: "alt_006",
    severity: "warning",
    title: "89 idle SaaS seats",
    description: "Notion (42 idle) and Salesforce (47 idle) have seats with no login in the past 30 days. Estimated waste: $2,670/mo.",
    resource: "saas/notion+salesforce",
    provider: "GCP",
    createdAt: "2026-07-23T10:00:00Z",
    acknowledged: false,
  },
  {
    id: "alt_007",
    severity: "info",
    title: "Policy v17 deployed",
    description: "non-prod-cost-optimizer policy updated to v17. New action 'rightsize_rds' added. Auto-approved after 3 successful cycles.",
    resource: "policy/non-prod-cost-optimizer",
    provider: "AWS",
    createdAt: "2026-07-20T14:00:00Z",
    acknowledged: true,
  },
];

// ── FAQ Data ──
export const faqItems = [
  {
    question: "Is Cloudwarden a dashboard, or does it actually do something?",
    answer:
      "Cloudwarden is an autonomous agent, not a passive dashboard. It continuously scans your cloud resources, identifies waste, and executes pre-approved remediations on your behalf. Every action is logged, signed, and reversible within the cooldown window. Think of it as a FinOps engineer that never sleeps.",
  },
  {
    question: "How do you avoid taking risky actions on production?",
    answer:
      "Three layers of protection: (1) Policy graphs define exactly what actions are allowed on which scopes — production workloads can be set to require human approval. (2) Every action runs in dry-run mode first, and the predicted impact is logged before execution. (3) A configurable cooldown window makes every action reversible with a single-call rollback.",
  },
  {
    question: "Will it touch our regulated workloads?",
    answer:
      "Only if your policy explicitly allows it. Cloudwarden ships with a deny-by-default posture. Regulated workloads can be scoped out entirely using tag-based or account-based exclusions. The audit trail is append-only and SOC 2/ISO 27001 compatible, so every decision is replayable by compliance reviewers.",
  },
  {
    question: "How is multi-cloud handled without five vendor portals?",
    answer:
      "Cloudwarden normalizes resource metadata from AWS, GCP, and Azure into a single ledger. You see one unified view of compute, storage, Kubernetes, SaaS seats, and AI token spend — with cost attribution by team, environment, and project. No CSV stitching required.",
  },
  {
    question: "What happens if Cloudwarden is wrong?",
    answer:
      "Every action comes with a rollback bundle. Within the cooldown window (configurable per policy, default 6h), any approver can trigger a single-call rollback that restores the previous state. The rollback itself is also logged in the append-only audit trail.",
  },
];
