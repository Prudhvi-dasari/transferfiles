"use client";

import { useAuth } from "@/components/providers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, User, Bell, Shield, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("cw_live_9f8e7d6c5b4a3f2e1d0c");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-teal-500" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <Input defaultValue={user?.name || ""} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                  <Input defaultValue={user?.role || "ADMIN"} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <Input defaultValue={user?.email || ""} readOnly className="bg-slate-50 dark:bg-slate-900" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-teal-500" />
                <CardTitle>API Access</CardTitle>
              </div>
              <CardDescription>Keys for programmatic access to the CloudWarden API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Production API Key</label>
                <div className="flex gap-2">
                  <Input type="password" defaultValue="cw_live_9f8e7d6c5b4a3f2e1d0c" readOnly className="font-mono bg-slate-50 dark:bg-slate-900 flex-1" />
                  <Button variant="outline" onClick={handleCopy} className="w-16 shrink-0">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Keep this key secret. It provides admin access to your workspace.</p>
              </div>
              <Button variant="secondary" className="mt-2 text-sm">Generate New Key</Button>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-500" />
                <CardTitle>Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "email-alerts", label: "Email Alerts", desc: "Critical issues only", default: true },
                { id: "slack-integ", label: "Slack Integration", desc: "Action summaries", default: true },
                { id: "weekly-report", label: "Weekly Report", desc: "Cost savings digest", default: false }
              ].map(setting => (
                <div key={setting.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{setting.label}</p>
                    <p className="text-xs text-slate-500">{setting.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked={setting.default} />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Permanently delete your account and all associated cloud connection data. This cannot be undone.
              </p>
              <Button variant="destructive" className="w-full">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
