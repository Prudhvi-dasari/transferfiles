"use client";

import { policies } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileCode, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export default function PoliciesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "success" as const;
      case "draft": return "warning" as const;
      case "disabled": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policy Engine</h1>
          <p className="text-muted-foreground mt-1">Manage automation policies and guardrails.</p>
        </div>
        <Button className="bg-brand-600 hover:bg-brand-700 text-white">Create Policy</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {policies.map((policy) => (
          <Card key={policy.id} className="overflow-hidden">
            <div
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => toggleExpand(policy.id)}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-md shrink-0">
                  <FileCode className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{policy.name}</h3>
                    <Badge variant={getStatusVariant(policy.status)} className="capitalize">
                      {policy.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                      v{policy.version}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scope: <span className="font-medium text-foreground/80">{policy.scope}</span>
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedId === policy.id ? "rotate-180" : ""}`} />
            </div>

            {expandedId === policy.id && (
              <div className="border-t border-border bg-muted/20">
                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Configuration</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Execution Window:</span>
                          <span className="font-medium">{policy.window}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Cooldown:</span>
                          <span className="font-medium">{policy.cooldown}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Approval Required:</span>
                          <span>
                            {policy.requireApproval ?
                              <CheckCircle2 className="w-4 h-4 text-amber-500" /> :
                              <XCircle className="w-4 h-4 text-muted-foreground" />
                            }
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="font-medium">{policy.lastUpdated}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Allowed Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {policy.actions.map((action) => (
                          <Badge key={action} variant="outline" className="text-xs font-mono">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 lg:col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Policy Definition (YAML)</h4>
                    <div className="bg-[#0b1120] text-slate-300 p-4 rounded-md overflow-x-auto text-xs font-mono border border-slate-800">
                      <pre className="whitespace-pre-wrap">
                        {policy.yaml.split("\n").map((line, i) => {
                          // Basic YAML syntax highlighting
                          const commentMatch = line.match(/^(\s*)(#.*)$/);
                          if (commentMatch) {
                            return (
                              <div key={i}>
                                {commentMatch[1]}
                                <span className="text-slate-500">{commentMatch[2]}</span>
                              </div>
                            );
                          }
                          const kvMatch = line.match(/^(\s*)([\w_-]+)(:)(.*)$/);
                          if (kvMatch) {
                            return (
                              <div key={i}>
                                {kvMatch[1]}
                                <span className="text-brand-400">{kvMatch[2]}</span>
                                <span className="text-slate-500">{kvMatch[3]}</span>
                                <span className="text-sky-300">{kvMatch[4]}</span>
                              </div>
                            );
                          }
                          const listMatch = line.match(/^(\s*)(- )(.*)$/);
                          if (listMatch) {
                            return (
                              <div key={i}>
                                {listMatch[1]}
                                <span className="text-slate-500">{listMatch[2]}</span>
                                <span className="text-emerald-300">{listMatch[3]}</span>
                              </div>
                            );
                          }
                          return <div key={i}>{line}</div>;
                        })}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
