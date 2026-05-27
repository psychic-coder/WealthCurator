import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ShoppingBag, Plane, Utensils } from "lucide-react";

export const Route = createFileRoute("/transactions")({ component: Transactions });

const rows = [
  {
    date: "Oct 24, 2026",
    icon: <ShoppingBag className="h-4 w-4" />,
    merchant: "Apple Store Soho",
    cat: "Technology",
    catClass: "bg-sky-500/15 text-sky-400",
    status: "Cleared",
    statusDot: "bg-emerald-400",
    amount: "$2,499.00",
  },
  {
    date: "Oct 22, 2026",
    icon: <Plane className="h-4 w-4" />,
    merchant: "Delta Air Lines",
    cat: "Travel",
    catClass: "bg-orange-500/15 text-orange-400",
    status: "Pending",
    statusDot: "bg-amber-400",
    amount: "$842.10",
  },
  {
    date: "Oct 20, 2026",
    icon: <Utensils className="h-4 w-4" />,
    merchant: "Le Coucou NYC",
    cat: "Lifestyle",
    catClass: "bg-indigo-500/15 text-indigo-300",
    status: "Cleared",
    statusDot: "bg-emerald-400",
    amount: "$312.50",
  },
];

function Transactions() {
  return (
    <Layout>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            05 Data Integrity
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Transactional Ledger</h1>
        </div>
        <button className="text-sm font-medium text-primary">View Full Ledger →</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-border/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Date</div>
          <div>Merchant</div>
          <div>Category</div>
          <div>Status</div>
          <div className="text-right">Amount</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr] items-center gap-4 border-b border-border/40 px-6 py-4 text-sm last:border-0"
          >
            <div className="text-muted-foreground">{r.date}</div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                {r.icon}
              </div>
              <span className="font-medium">{r.merchant}</span>
            </div>
            <div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${r.catClass}`}>
                {r.cat}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${r.statusDot}`} /> {r.status}
            </div>
            <div className="text-right font-semibold">{r.amount}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-5">
        <div className="flex gap-3">
          <div className="text-red-400">⚠</div>
          <div>
            <div className="text-sm font-semibold text-red-300">Unusual Activity Detected</div>
            <div className="mt-1 text-xs text-red-200/80">
              A transaction of $1,250.00 at 'Unknown Merchant' requires your immediate verification.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
