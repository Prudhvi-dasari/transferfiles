"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Zap, Server, ShieldCheck, Activity } from "lucide-react";
import { dashboardStats, actions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverview() {
  return (
    <>
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lift shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month-to-Date Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(dashboardStats.monthToDate / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">
              -4% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="lift shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <Zap className="h-4 w-4 text-brand-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-600">${(dashboardStats.totalSaved / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground text-brand-500/80">
              Lifetime savings
            </p>
          </CardContent>
        </Card>

        <Card className="lift shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Candidates</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.openCandidates}</div>
            <p className="text-xs text-muted-foreground">
              Pending review
            </p>
          </CardContent>
        </Card>

        <Card className="lift shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeResources.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all providers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        {/* Chart Area */}
        <Card className="col-span-4 lift shadow-sm">
          <CardHeader>
            <CardTitle>Spend Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] w-full bg-muted/20 rounded-md border border-dashed flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <path d="M0,80 L50,60 L100,70 L150,40 L200,50 L250,20 L300,30 L350,10 L400,20" 
                      fill="none" stroke="oklch(0.60 0.14 180 / 0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M0,80 L50,65 L100,75 L150,50 L200,60 L250,40 L300,55 L350,30 L400,45" 
                      fill="none" stroke="oklch(0.60 0.14 180)" strokeWidth="3" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">Actual vs Counterfactual</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Actions */}
        <Card className="col-span-3 lift shadow-sm">
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {actions.slice(0, 4).map((action) => (
                <div key={action.id} className="flex items-center">
                  <div className="mr-4 mt-1 bg-muted p-2 rounded-full">
                    <ShieldCheck className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {action.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.resource}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      action.status === 'completed' ? 'success' : 
                      action.status === 'pending' ? 'warning' : 
                      action.status === 'rolled_back' ? 'destructive' : 'default'
                    }>
                      {action.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
