"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Layers, Settings, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/projects", label: "Projects", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/reports", label: "Reports", icon: BarChart3 }
];

export function AppShell({
  children,
  title,
  description
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              3D Print Cost Calculator
            </div>
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
          </div>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
