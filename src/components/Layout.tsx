import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  Landmark,
  Receipt,
  PiggyBank,
  Lightbulb,
  Bell,
  Settings,
  Search,
  Palette,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/accounts", label: "Accounts", icon: Landmark },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/design-system", label: "Design System", icon: Palette },
];

const tabs = [
  { to: "/", label: "Portfolio" },
  { to: "/insights", label: "Analysis" },
  { to: "/accounts", label: "Market" },
];

export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-full items-center gap-6 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">Proton Finance</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Wealth Curator
              </div>
            </div>
          </div>

          <div className="relative ml-20 hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-9 w-full rounded-md border border-border/60 bg-card/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
              placeholder="Search portfolio or markets..."
            />
          </div>

          <nav className="ml-auto hidden items-center gap-6  lg:flex">
            {tabs.map((t) => {
              const active = pathname === t.to;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`relative text-sm transition-colors ${
                    active
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button className="rounded-md p-2 text-muted-foreground hover:bg-accent">
              <Bell className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 rounded-md p-2 text-muted-foreground hover:bg-accent">
              <Settings className="h-4 w-4" />
              <span className="hidden text-sm xl:inline">Settings</span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-semibold text-white">
              AS
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-full gap-6 px-6   py-6">
        {/* Sidebar */}
        <aside className="hidden items w-60 shrink-0 flex-col gap-1 md:flex">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}

          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> Pro Access
            </div>
            <div className="mb-3 text-sm font-medium leading-snug">Unlock AI Strategy Insights</div>
            <button className="w-full rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              Upgrade to Premium
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 text-[11px] uppercase tracking-wider text-muted-foreground">
          <div>© 2026 Proton Finance · Data Encrypted with AES-256</div>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Security Audit</span>
            <span>API Docs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
