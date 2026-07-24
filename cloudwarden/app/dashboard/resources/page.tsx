"use client";

import { useState } from "react";
import { cloudResources } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown } from "lucide-react";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const providers = ["All", "AWS", "GCP", "Azure"];
  const statuses = ["All", "running", "idle", "stopped", "optimized"];

  const filteredResources = cloudResources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = providerFilter === "All" || r.provider === providerFilter;
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesProvider && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'running': return 'success';
      case 'idle': return 'warning';
      case 'stopped': return 'secondary';
      case 'optimized': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Resources</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and monitor all your cloud resources across providers.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Search resources by name or ID..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-md p-1 bg-slate-50 dark:bg-slate-900 shrink-0">
                {providers.map(p => (
                  <button
                    key={p}
                    onClick={() => setProviderFilter(p)}
                    className={`px-3 py-1.5 text-sm rounded-sm transition-colors whitespace-nowrap ${
                      providerFilter === p 
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-md p-1 bg-slate-50 dark:bg-slate-900 shrink-0">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-sm rounded-sm transition-colors capitalize whitespace-nowrap ${
                      statusFilter === s 
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">CPU %</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Mem %</th>
                  <th className="px-4 py-3 font-medium text-right">
                    <div className="flex items-center justify-end gap-1">
                      Cost/Mo <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <tr key={resource.id} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{resource.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">{resource.id}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{resource.type}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            resource.provider === 'AWS' ? 'bg-amber-500' : 
                            resource.provider === 'GCP' ? 'bg-blue-500' : 'bg-sky-400'
                          }`}></span>
                          {resource.provider}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{resource.region}</td>
                      <td className="px-4 py-4">
                        <Badge variant={getStatusVariant(resource.status) as any} className="capitalize">
                          {resource.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {resource.cpuUtilization ? `${resource.cpuUtilization}%` : '-'}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {resource.memoryUtilization ? `${resource.memoryUtilization}%` : '-'}
                      </td>
                      <td className="px-4 py-4 text-right font-medium">
                        ${resource.monthlyCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No resources found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
            <div>Showing {filteredResources.length} of {cloudResources.length} resources</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
