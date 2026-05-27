import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Landmark, Receipt, PiggyBank, Lightbulb, Palette, Sparkles } from "lucide-react";
import type { ComponentPropsWithoutRef, FC } from "react";

type SidebarOwnProps = {
  backgroundClassName?: string;
};

export type SidebarProps = ComponentPropsWithoutRef<"aside"> & SidebarOwnProps;

type SidebarBrandOwnProps = {
  className?: string;
};

export type SidebarBrandProps = Omit<SidebarProps, keyof SidebarBrandOwnProps | "children"> &
  SidebarBrandOwnProps;

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/accounts", label: "Accounts", icon: Landmark },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/design-system", label: "Design System", icon: Palette },
];

export const SidebarBrand: FC<SidebarBrandProps> = ({ className, ...brandProps }) => {
  return (
    <div className={`items-center gap-2 ${className ?? ""}`.trim()} {...brandProps}>
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Landmark className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-wide">Proton Finance</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Wealth Curator</div>
      </div>
    </div>
  );
};

export const Sidebar: FC<SidebarProps> = ({ className, backgroundClassName = "bg-[#1a1c1d]", ...asideProps }) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className={`min-h-screen px-6 py-6 ${backgroundClassName}`}>
      <aside
        className={`hidden items w-60 shrink-0 flex-col gap-1 ${backgroundClassName} md:flex ${className ?? ""}`.trim()}
        {...asideProps}
      >
        <SidebarBrand className="mb-6 flex items-center px-3" />
        
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
    </div>
  );
};

export default Sidebar;
