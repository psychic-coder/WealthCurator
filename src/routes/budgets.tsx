import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Home, ShoppingCart, Film, Maximize2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/budgets")({ component: Budgets });

function Budgets() {
  return (
    <Layout>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Monthly Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fiscal Period: October 2026</p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          + Adjust Limits
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-6 lg:col-span-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Total Budget Velocity
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-4xl font-semibold">$12,450.00</div>
            <div className="text-sm text-muted-foreground">/ $15,000.00</div>
          </div>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: "83%" }} />
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>83% of monthly limit reached</span>
            <span>12 days remaining</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Projected Surplus
            </div>
            <div className="mt-2 text-2xl font-semibold text-emerald-400">+$2,550</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Savings Efficiency
            </div>
            <div className="mt-2 text-2xl font-semibold">94.2%</div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Category Allocation</h3>
            <button className="text-xs text-primary">View All Categories</button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CategoryCard
              icon={<Home className="h-4 w-4" />}
              tag="Fixed"
              tagClass="bg-sky-500/15 text-sky-400"
              name="Housing & Rent"
              spent="$3,200"
              pct={100}
              bar="bg-sky-400"
            />
            <CategoryCard
              icon={<ShoppingCart className="h-4 w-4" />}
              tag="Healthy"
              tagClass="bg-emerald-500/15 text-emerald-400"
              name="Groceries"
              spent="$642.50 / $900"
              pct={71}
              bar="bg-emerald-400"
            />
            <CategoryCard
              icon={<Film className="h-4 w-4" />}
              tag="Critical"
              tagClass="bg-red-500/15 text-red-400"
              name="Entertainment"
              spent="$450.00 / $500"
              pct={90}
              bar="bg-red-400"
            />
            <CategoryCard
              icon={<Maximize2 className="h-4 w-4" />}
              tag="Optimal"
              tagClass="bg-amber-500/15 text-amber-400"
              name="Lifestyle"
              spent="$210.00 / $600"
              pct={35}
              bar="bg-amber-400"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl bg-primary p-6 text-primary-foreground">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Budget Strategy
            </div>
            <div className="text-lg font-semibold leading-snug">
              Optimize your spending to save{" "}
              <span className="rounded bg-white/15 px-1.5 py-0.5">$200.00</span> next month.
            </div>
            <p className="mt-3 text-xs opacity-90">
              Based on your spending patterns at 'Gourmet Mart', switching to bulk purchases could
              reduce your grocery overhead by 14%.
            </p>
            <button className="mt-4 w-full rounded-md bg-white py-2 text-sm font-semibold text-primary">
              Apply Strategy
            </button>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              ⚠ Recent Alerts
            </div>
            <div className="space-y-4">
              <AlertItem
                color="border-red-400"
                title="Entertainment Threshold"
                body="Limit is at 90% ($450/$500). Pause non-essential bookings."
                time="2 hours ago"
              />
              <AlertItem
                color="border-amber-400"
                title="Dining Anomaly"
                body="Spending at 'The Oak Room' is 20% higher than your average."
                time="Yesterday"
              />
              <AlertItem
                color="border-sky-400"
                title="Subscription Renewed"
                body="'Bloomberg Terminal' subscription was successfully auto-paid."
                time="2 days ago"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CategoryCard({
  icon,
  tag,
  tagClass,
  name,
  spent,
  pct,
  bar,
}: {
  icon: React.ReactNode;
  tag: string;
  tagClass: string;
  name: string;
  spent: string;
  pct: number;
  bar: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
          {icon}
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase ${tagClass}`}>
          {tag}
        </span>
      </div>
      <div className="text-sm font-semibold">{name}</div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{spent}</span>
        <span className="font-semibold text-foreground">{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AlertItem({
  color,
  title,
  body,
  time,
}: {
  color: string;
  title: string;
  body: string;
  time: string;
}) {
  return (
    <div className={`border-l-2 pl-3 ${color}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{body}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{time}</div>
    </div>
  );
}
