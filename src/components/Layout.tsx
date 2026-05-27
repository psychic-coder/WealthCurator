import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Settings, Search } from "lucide-react";
import Sidebar, { SidebarBrand } from "./ui/sidebar";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Portfolio" },
  { to: "/insights", label: "Analysis" },
  { to: "/accounts", label: "Market" },
];

export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-6 px-6">
            <div className="relative hidden flex-1 max-w-md md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-9 w-full rounded-md border border-border/60 bg-card/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                placeholder="Search portfolio or markets..."
              />
            </div>

            <nav className="hidden items-center gap-6 lg:flex">
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

            <div className="flex items-center gap-3 ml-auto lg:ml-0">
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

        <main className="flex-1 px-6 py-6">{children}</main>

        <footer className="border-t border-border/60 py-6 mt-auto">
          <div className="flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 text-[11px] uppercase tracking-wider text-muted-foreground">
            <div>© 2026 Proton Finance · Data Encrypted with AES-256</div>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Security Audit</span>
              <span>API Docs</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
