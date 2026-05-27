import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import {
  TrendingUp,
  AlertTriangle,
  PiggyBank,
  Activity,
  ShoppingBag,
  Utensils,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Stat({
  label,
  value,
  delta,
  positive = true,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div
        className={`mt-2 flex items-center gap-1 text-xs ${
          positive ? "text-emerald-400" : "text-amber-400"
        }`}
      >
        <TrendingUp className="h-3 w-3" /> {delta}
      </div>
    </div>
  );
}

function Bar({ label, pct, value, color }: { label: string; pct: number; value: string; color: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <Layout>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Stat label="Total Net Worth" value="$1,248,500" delta="+12.4% vs last month" />
        <Stat label="Monthly Spending" value="$4,280" delta="+2.1% higher than avg" positive={false} />
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Total Savings
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight">$245,000</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> On track for Q4 goal
          </div>
        </div>
      </div>

      {/* Strategy + Alerts */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-blue-700 p-7 lg:col-span-2">
          <div className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Pro Strategy Insight
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-white">
            Optimizing your portfolio for the upcoming Q3 market shift.
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/80">
            Our AI analyzed your current allocation and identified 3 key rebalancing
            opportunities to increase yield by 2.4%.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90">
              Execute Strategy
            </button>
            <button className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Review Audit
            </button>
          </div>
        </div>

        <div>
          <div className="mb-3 text-lg font-semibold">Active Alerts</div>
          <div className="space-y-3">
            <AlertCard
              icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
              bg="bg-red-500/10"
              title="Subscription Spike"
              body="3 new recurring charges detected from “Cloud SaaS” in the last 48h."
            />
            <AlertCard
              icon={<PiggyBank className="h-4 w-4 text-amber-400" />}
              bg="bg-amber-500/10"
              title="Emergency Fund Cap"
              body="Your “Rainy Day” fund has reached its target of $20k. Redirecting flows?"
            />
            <AlertCard
              icon={<Activity className="h-4 w-4 text-sky-400" />}
              bg="bg-sky-500/10"
              title="Dividend Reinvestment"
              body="AAPL and MSFT paid dividends today. Automatic reinvestment pending."
            />
          </div>
        </div>
      </div>

      {/* Composition + Recent */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Spending Composition</h3>
            <button className="text-xs text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-5">
            <Bar label="Housing & Utilities" value="42%" pct={42} color="bg-indigo-400" />
            <Bar label="Dining & Leisure" value="18%" pct={18} color="bg-orange-400" />
            <Bar label="Investments" value="25%" pct={25} color="bg-emerald-400" />
            <Bar label="Transportation" value="15%" pct={15} color="bg-sky-400" />
          </div>

          <div className="mt-6 rounded-lg border border-border/50 bg-background/40 p-4 text-xs italic text-muted-foreground">
            <div className="mb-1 not-italic text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
              Editor's Note
            </div>
            "Your discretionary spending on 'Dining & Leisure' is down 12% this month. This
            surplus has been automatically moved to your 'S&P 500' bucket."
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <div className="flex gap-2">
              <button className="rounded-md border border-border/60 px-3 py-1.5 text-xs">
                Export CSV
              </button>
              <button className="rounded-md border border-border/60 px-3 py-1.5 text-xs">
                Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-3 border-b border-border/60 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Merchant</div>
            <div>Category</div>
            <div>Status</div>
            <div className="text-right">Amount</div>
          </div>

          {[
            {
              icon: <ShoppingBag className="h-4 w-4" />,
              name: "Apple Store Soho",
              date: "Oct 24, 2023 · 14:20",
              cat: "Technology",
              catClass: "bg-sky-500/15 text-sky-400",
              status: "Cleared",
              statusDot: "bg-emerald-400",
              amount: "-$1,299.00",
            },
            {
              icon: <Utensils className="h-4 w-4" />,
              name: "Blue Hill Farm",
              date: "Oct 23, 2023 · 20:15",
              cat: "Lifestyle",
              catClass: "bg-orange-500/15 text-orange-400",
              status: "Cleared",
              statusDot: "bg-emerald-400",
              amount: "-$485.20",
            },
            {
              icon: <Zap className="h-4 w-4" />,
              name: "ConEd Utility Bill",
              date: "Oct 22, 2023 · 09:00",
              cat: "Utilities",
              catClass: "bg-indigo-500/15 text-indigo-300",
              status: "Pending",
              statusDot: "bg-amber-400",
              amount: "-$214.10",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-3 border-b border-border/40 py-3 text-sm last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  {t.icon}
                </div>
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.date}</div>
                </div>
              </div>
              <div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${t.catClass}`}>
                  {t.cat}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`h-2 w-2 rounded-full ${t.statusDot}`} /> {t.status}
              </div>
              <div className="text-right text-sm font-semibold">{t.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function AlertCard({
  icon,
  bg,
  title,
  body,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-card p-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs leading-snug text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
