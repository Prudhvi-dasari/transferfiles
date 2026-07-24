"use client";

import { actions } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function ActionsPage() {
  const formatType = (type: string) => type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'in_progress': return 'default';
      case 'rolled_back': return 'destructive';
      default: return 'outline';
    }
  };

  const totalActions = actions.length;
  const totalSavings = actions.reduce((acc, curr) => acc + (curr.savingsPerMonth || 0), 0);
  const autoExecuted = actions.filter(a => a.executedBy === 'agent').length;

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffD = Math.floor(diffH / 24);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Action Audit Trail</h1>
          <p className="text-muted-foreground mt-1">History of optimizations and changes made to your infrastructure.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg"><Zap className="w-5 h-5 text-brand-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Actions</p>
              <p className="text-2xl font-bold">{totalActions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg"><CheckCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Savings</p>
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">${totalSavings.toLocaleString()}/mo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg"><Clock className="w-5 h-5 text-brand-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Auto-executed</p>
              <p className="text-2xl font-bold">{autoExecuted}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg"><AlertCircle className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Manual</p>
              <p className="text-2xl font-bold">{totalActions - autoExecuted}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto rounded-md">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Action Type</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Savings/Mo</th>
                <th className="px-4 py-3 font-medium">Executed By</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    <span title={new Date(action.executedAt).toLocaleString()}>{timeAgo(action.executedAt)}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatType(action.type)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {action.resource}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{action.provider}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusVariant(action.status) as "success" | "warning" | "default" | "destructive" | "outline"} className="capitalize">
                      {action.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-brand-600 dark:text-brand-400 font-medium">
                    {action.savingsPerMonth ? `$${action.savingsPerMonth.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {action.executedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
