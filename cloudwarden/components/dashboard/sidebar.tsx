"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Server, Zap, FileText, Bell, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alerts } from "@/lib/mock-data";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const unackAlerts = alerts.filter(a => !a.acknowledged).length;

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Resources", href: "/dashboard/resources", icon: Server },
    { name: "Actions", href: "/dashboard/actions", icon: Zap },
    { name: "Policies", href: "/dashboard/policies", icon: FileText },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell, count: unackAlerts },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#0b1120] text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0b1120] text-slate-300 transform transition-transform duration-200 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 p-6 text-white font-semibold text-xl border-b border-slate-800">
          <Shield className="text-teal-500" size={28} />
          <span>CloudWarden</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? "bg-teal-600/10 text-teal-500 font-medium" 
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? "text-teal-500" : "text-slate-400"} />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-teal-500 hover:bg-teal-600 text-white" : ""}>
                    {item.count}
                  </Badge>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <button
              onClick={() => {
                window.dispatchEvent(new Event('toggle-agent'));
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors hover:bg-slate-800 hover:text-white text-brand-400 group"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-20"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                </span>
                <span className="font-medium text-slate-300 group-hover:text-white">AI Assistant</span>
              </div>
              <Badge variant="outline" className="border-brand-500/30 text-[10px] text-brand-400 uppercase">Beta</Badge>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{user?.name || "User"}</span>
              <span className="text-xs text-slate-400 truncate max-w-[150px]">{user?.email || "user@example.com"}</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-400 uppercase">
              {user?.role || "ADMIN"}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
            onClick={logout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
