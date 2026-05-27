import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { TrendingUp, Sparkles, Briefcase, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/insights")({ component: Insights });

function Insights() {
  return (
    <Layout>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        Wealth Intelligence
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Portfolio Insights</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Your curated financial perspective, balancing algorithmic precision with long-term wealth
        preservation goals.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-6 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Active Signal: Rebalance Priority
          </div>
          <h2 className="max-w-md text-xl font-semibold leading-snug">
            Your technology exposure has increased by 14.2% since last quarter.
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Our algorithms suggest shifting 4% of gains into emerging market debt and high-yield
            real estate to maintain your risk-adjusted profile.
          </p>
          <div className="mt-5 flex gap-3">
            <button className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
              Review Strategy
            </button>
            <button className="text-sm font-medium text-primary">Dismiss</button>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Market Sentiment
          </div>
          <div className="flex flex-col items-center py-2">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-muted" fill="none" />
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-primary" fill="none" strokeDasharray={`${0.74 * 264} 264`} strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <div className="text-sm font-semibold">Optimistic</div>
                <div className="text-[10px] text-muted-foreground">Score: 74/100</div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Row k="Global Equities" v="Bullish" vClass="text-emerald-400" />
            <Row k="Fixed Income" v="Neutral" vClass="text-amber-400" />
            <Row k="Volatility Index" v="Low" vClass="text-sky-400" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-6 lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Portfolio Performance
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="text-3xl font-semibold">$1,424,902.18</div>
                <div className="text-sm font-semibold text-emerald-400">+12.4%</div>
              </div>
            </div>
            <div className="flex gap-1 rounded-md bg-muted p-1 text-xs">
              {["1M", "3M", "1Y", "ALL"].map((p, i) => (
                <button
                  key={p}
                  className={`rounded px-3 py-1 ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <svg viewBox="0 0 600 200" className="mt-6 h-48 w-full">
            <defs>
              <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.21 255)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="oklch(0.55 0.21 255)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,140 C80,130 120,90 200,100 S320,160 400,80 S540,40 600,30 L600,200 L0,200 Z"
              fill="url(#g1)"
            />
            <path
              d="M0,140 C80,130 120,90 200,100 S320,160 400,80 S540,40 600,30"
              fill="none"
              stroke="oklch(0.55 0.21 255)"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sector Allocation
            </div>
            <div className="space-y-2 text-sm">
              <Row k={<Legend color="bg-primary" label="Technology" />} v="42%" />
              <Row k={<Legend color="bg-orange-400" label="Financials" />} v="18%" />
              <Row k={<Legend color="bg-amber-400" label="Healthcare" />} v="15%" />
              <Row k={<Legend color="bg-muted-foreground" label="Other" />} v="25%" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-1 text-[10px] uppercase opacity-80">
                <TrendingUp className="h-3 w-3" /> Top Performer
              </div>
              <div className="mt-2 text-lg font-semibold">NVDA</div>
              <div className="text-xs opacity-80">+8.4%</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Risk Level
              </div>
              <div className="mt-2 text-lg font-semibold">Moderate</div>
              <div className="text-xs text-muted-foreground">Balanced</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash flow */}
      <div className="mt-5 rounded-xl border border-border/60 bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cash Flow Intelligence
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Automated suggestions based on your November spending patterns.
            </div>
          </div>
          <button className="text-sm font-medium text-primary">View Monthly Report →</button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Tip icon={<Sparkles className="h-4 w-4" />} title="Surplus Opportunity">
            You spent 12% less on dining this month. Transfer $450 to your 'Growth' bucket to stay
            ahead of your 2024 goal.
          </Tip>
          <Tip icon={<Briefcase className="h-4 w-4" />} title="Recurring Audit">
            We detected two overlapping streaming subscriptions. Canceling 'Media+' would save you
            $180 annually.
          </Tip>
          <Tip icon={<ShieldCheck className="h-4 w-4" />} title="Tax-Loss Harvesting">
            3 assets in your legacy portfolio are eligible for tax-loss harvesting. Potential
            benefit: $2,100.
          </Tip>
        </div>
      </div>
    </Layout>
  );
}

function Row({ k, v, vClass }: { k: React.ReactNode; v: string; vClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground">{k}</div>
      <div className={`font-semibold ${vClass ?? ""}`}>{v}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-foreground/80">
      <span className={`h-2 w-2 rounded-full ${color}`} /> {label}
    </span>
  );
}

function Tip({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/30 p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
        {icon}
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs leading-snug text-muted-foreground">{children}</div>
    </div>
  );
}
