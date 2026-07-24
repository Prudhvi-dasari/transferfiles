"use client";

import { alerts } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, AlertCircle, Check, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function AlertsPage() {
  const [localAlerts, setLocalAlerts] = useState(alerts.sort((a, b) => {
    if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
    const sevScore = { critical: 3, warning: 2, info: 1 };
    return sevScore[b.severity as keyof typeof sevScore] - sevScore[a.severity as keyof typeof sevScore];
  }));

  const handleAcknowledge = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      case 'info': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Alerts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">System notifications and anomaly detections.</p>
        </div>
      </div>

      <div className="space-y-3">
        {localAlerts.map(alert => (
          <Card key={alert.id} className={`${!alert.acknowledged ? 'border-l-4 border-l-teal-500' : 'opacity-75'}`}>
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <div className="flex gap-4 items-start">
                <div className="mt-1 shrink-0">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h3>
                    <Badge variant={getSeverityBadge(alert.severity) as any} className="capitalize text-[10px] h-5">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{alert.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    {alert.resource && <span>• Resource: <span className="font-mono">{alert.resource}</span></span>}
                  </div>
                </div>
              </div>
              
              {!alert.acknowledged ? (
                <Button 
                  onClick={() => handleAcknowledge(alert.id)}
                  variant="outline" 
                  size="sm"
                  className="shrink-0 self-start sm:self-center hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-800"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Acknowledge
                </Button>
              ) : (
                <div className="text-xs text-slate-400 flex items-center shrink-0 self-start sm:self-center">
                  <Check className="w-3 h-3 mr-1" /> Acknowledged
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {localAlerts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p>No alerts at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
