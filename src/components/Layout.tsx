/**
 * src/components/Layout.tsx
 * App shell with:
 * - Dark mode toggle (useLocalStorage + prefers-color-scheme detection)
 * - Skip-to-content link for keyboard navigation
 * - Fully semantic HTML: <header>, <main>, <footer>
 * - Aria labels on all icon-only buttons
 * - Header is memoized to NOT re-render on transaction list changes
 */

import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Settings, Search, Moon, Sun } from "lucide-react";
import Sidebar from "./ui/sidebar";
import { memo, useEffect, useCallback, useState, type ReactNode } from "react";
import { useLocalStorage, useAnalytics } from "@/hooks";
import { EVENTS, firesDarkModeToggled, pushDataLayer } from "@/analytics/events";

const tabs = [
  { to: "/", label: "Portfolio" },
  { to: "/insights", label: "Analysis" },
  { to: "/accounts", label: "Market" },
];

// ---------------------------------------------------------------------------
// useDarkMode — single source of truth for theme state.
// Lives OUTSIDE TopBar so it can be passed down as a stable prop,
// avoiding TopBar needing to re-render just to sync the icon state.
// ---------------------------------------------------------------------------
function useDarkMode() {
  const { trackEvent } = useAnalytics();

  const getInitialTheme = (): "dark" | "light" => {
    if (typeof window === "undefined") return "dark";
    // 1. Check persisted preference first
    try {
      const stored = window.localStorage.getItem("wc-theme");
      if (stored === "dark" || stored === "light") return stored;
    } catch {
      // ignore
    }
    // 2. Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [theme, setTheme] = useLocalStorage<"dark" | "light">("wc-theme", getInitialTheme());

  // Apply / remove the "dark" class on <html> whenever theme changes.
  // This is the only place the DOM is mutated — one authoritative source.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    trackEvent("preferences", EVENTS.DARK_MODE_TOGGLED);
    pushDataLayer(EVENTS.DARK_MODE_TOGGLED, firesDarkModeToggled(next === "dark"));
  }, [theme, setTheme, trackEvent]);

  return { theme, toggle };
}

// ---------------------------------------------------------------------------
// TopBar — receives theme+toggle as props so it re-renders only when needed.
// React.memo still prevents re-renders from unrelated parent state changes
// (e.g. transaction search query updates).
// ---------------------------------------------------------------------------
const TopBar = memo(function TopBar({
  pathname,
  theme,
  onThemeToggle,
}: {
  pathname: string;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-6 px-6">
        {/* Search */}
        <div className="relative hidden flex-1 max-w-md md:block">
          <label htmlFor="global-search" className="sr-only">
            Search portfolio or markets
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-9 w-full rounded-md border border-border/60 bg-card/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            placeholder="Search portfolio or markets..."
            aria-label="Search transactions"
          />
        </div>

        {/* Navigation tabs */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
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
                aria-current={active ? "page" : undefined}
              >
                {t.label}
                {active && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-primary" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto lg:ml-0">
          {/* Dark / Light mode toggle */}
          <button
            onClick={onThemeToggle}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={theme === "dark"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            className="flex items-center gap-2 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            <span className="hidden text-sm xl:inline">Settings</span>
          </button>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-semibold text-white"
            role="img"
            aria-label="User profile: AS"
          >
            AS
          </div>
        </div>
      </div>
    </header>
  );
});

// ---------------------------------------------------------------------------
// Main Layout component
// ---------------------------------------------------------------------------
export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useDarkMode();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Skip to content — keyboard accessibility */}
      <a
        href="#main-content"
        className="skip-to-content sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to content
      </a>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar pathname={pathname} theme={theme} onThemeToggle={toggle} />

        <main id="main-content" className="flex-1 px-6 py-6" tabIndex={-1}>
          {children}
        </main>

        <footer className="border-t border-border/60 py-6 mt-auto">
          <div className="flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 text-[11px] uppercase tracking-wider text-muted-foreground">
            <div>© 2026 Proton Finance · Data Encrypted with AES-256</div>
            <nav aria-label="Footer links">
              <ul className="flex gap-6 list-none">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security Audit</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
