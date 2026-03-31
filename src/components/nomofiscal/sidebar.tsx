"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Users,
  BriefcaseBusiness,
  CalendarClock,
  FileBarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/daily-log", label: "Daily Log", icon: ClipboardList },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/services", label: "Services", icon: BriefcaseBusiness },
  { href: "/periodos", label: "Periodos", icon: CalendarClock },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full flex-col bg-white p-5", className)}>
      <div className="px-2 pb-6 pt-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">NomoFiscal</h1>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
