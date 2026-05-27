import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Landmark, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/accounts")({ component: Accounts });

const accounts = [
  { name: "Proton Checking", num: "4829-2041-0021", balance: "$84,230.45", delta: "+12.4%" },
  { name: "High Yield Savings", num: "5610-1199-0042", balance: "$245,000.00", delta: "+4.8%" },
  { name: "Brokerage — Growth", num: "9921-7700-0188", balance: "$1,142,902.18", delta: "+18.2%" },
  { name: "Crypto Vault", num: "0xA1f...92cE", balance: "$22,415.00", delta: "-2.1%" },
];

function Accounts() {
  return (
    <Layout>
      <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Consolidated view of all linked financial accounts.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {accounts.map((a) => (
          <div key={a.name} className="rounded-xl border border-border/60 bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">{a.num}</div>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 text-xs ${a.delta.startsWith("-") ? "text-red-400" : "text-emerald-400"}`}
              >
                <TrendingUp className="h-3 w-3" /> {a.delta}
              </div>
            </div>
            <div className="mt-5 text-3xl font-semibold tracking-tight">{a.balance}</div>
            <div className="mt-1 text-xs text-muted-foreground">Available balance</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
