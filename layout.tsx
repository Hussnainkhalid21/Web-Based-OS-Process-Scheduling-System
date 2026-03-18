import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Cpu, Activity, MessageSquare, ShieldAlert, BarChart3, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/processes", label: "Process Manager", icon: Cpu },
  { href: "/scheduler", label: "CPU Scheduling", icon: Activity },
  { href: "/ipc", label: "IPC Panel", icon: MessageSquare },
  { href: "/deadlock", label: "Deadlock Analysis", icon: ShieldAlert },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[rgba(15,23,42,0.72)] backdrop-blur-xl border-r border-white/[0.08] flex flex-col transition-transform md:static md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <h1 className="font-bold text-[11px] leading-snug tracking-tight">
            Web-Based OS Process<br />Scheduling Simulator
          </h1>
        </div>
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group",
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4", active ? "text-white" : "text-[#64748b] group-hover:text-white")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 flex items-center px-4 bg-[rgba(15,23,42,0.72)] border-b border-white/[0.08] md:hidden">
          <button onClick={() => setOpen(true)} className="p-1 text-white">
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-semibold">OS Simulator</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
