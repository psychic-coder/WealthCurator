import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/design-system")({ component: DesignSystem });

const swatches = [
  { name: "Primary Blue", hex: "#0058be", bg: "bg-[#0058be]" },
  { name: "Success Green", hex: "#10b981", bg: "bg-emerald-500" },
  { name: "Error Red", hex: "#ba1a1a", bg: "bg-red-600" },
  { name: "Warning Gold", hex: "#924700", bg: "bg-amber-700" },
  { name: "Surface Low", hex: "#334155", bg: "bg-slate-700" },
  { name: "Surface High", hex: "#0f172a", bg: "bg-slate-900" },
];

function DesignSystem() {
  return (
    <Layout>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        Proton Finance
      </div>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Design <span className="text-primary">System</span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        A curated editorial framework for premium wealth management. Defined by tonal depth,
        intentional asymmetry, and financial clarity.
      </p>

      {/* Typography */}
      <Section num="01" title="Editorial Heirarchy" subtitle="Typography Scale">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>Display Medium (2.75rem)</Label>
            <div className="mt-1 text-5xl font-semibold tracking-tight">$142,850.42</div>
            <Label className="mt-6">Headline Small (1.5rem)</Label>
            <div className="mt-1 text-2xl font-semibold">Monthly Cash Flow</div>
            <Label className="mt-6">Title Medium (1.125rem)</Label>
            <div className="mt-1 text-lg font-semibold">Portfolio Growth Analysis</div>
          </div>
          <div>
            <Label>Body Medium (0.875rem)</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              The "Wealth Curator" design system prioritizes legibility and intentional asymmetry
              to create a premium digital experience for discerning investors.
            </p>
            <Label className="mt-6">Label Small (0.6875rem)</Label>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Transaction Pending
            </div>
          </div>
        </div>
      </Section>

      {/* Colors */}
      <Section num="02" title="Atmospheric Palette" subtitle="Color System">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {swatches.map((s) => (
            <div key={s.name}>
              <div className={`h-20 w-full rounded-md ${s.bg}`} />
              <div className="mt-2 text-xs font-semibold">{s.name}</div>
              <div className="text-[10px] text-muted-foreground">{s.hex}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Controls */}
      <Section num="03" title="Interactive Elements" subtitle="Controls">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <Label>Button Variations</Label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Primary Action
              </button>
              <button className="rounded-md border border-border/60 bg-card px-4 py-2 text-sm font-semibold">
                Secondary
              </button>
              <button className="text-sm font-semibold text-primary hover:underline">
                Ghost Button
              </button>
            </div>
          </div>
          <div>
            <Label>Data Entry</Label>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              Account Number
            </div>
            <input
              defaultValue="4829-2041-0021"
              className="mt-1 w-full rounded-md border border-border/60 bg-card px-3 py-2 text-sm"
            />
            <div className="mt-3 flex gap-2">
              {["Week", "Month", "Year"].map((t, i) => (
                <button
                  key={t}
                  className={`rounded-full px-4 py-1.5 text-xs ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Bento */}
      <Section num="04" title="The Bento Surface Logic" subtitle="Layout & Containers">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Main Portfolio
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                +12.4%
              </span>
            </div>
            <div className="mt-2 text-3xl font-semibold">$412,064.20</div>
            <div className="mt-6 flex h-32 items-end gap-2">
              {[40, 55, 35, 70, 50, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/70"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-primary p-6 text-primary-foreground">
            <div className="text-2xl">✨</div>
            <div className="mt-3 text-lg font-semibold">AI Wealth Signal</div>
            <p className="mt-2 text-xs opacity-90">
              Your real estate allocation is 4% under-weighted compared to your long-term goal.
              Consider rebalancing.
            </p>
            <button className="mt-4 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold">
              Review Strategy
            </button>
          </div>
        </div>
      </Section>
    </Layout>
  );
}

function Section({
  num,
  title,
  subtitle,
  children,
}: {
  num: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-border/50 pt-8">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        {num} {subtitle}
      </div>
      <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-[10px] uppercase tracking-wider text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}
