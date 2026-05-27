/**
 * src/routes/index.tsx
 * Restored original layout wired to dynamic mock data and analytics.
 */

import React, { memo, useState, useMemo, useCallback, useEffect } from "react";
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
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { CardSkeleton } from "@/components/SkeletonLoader";
import { useFetch, useAnalytics } from "@/hooks";
import { EVENTS, pushDataLayer } from "@/analytics/events";
import { generateInsights } from "@/lib/insightsEngine";
import type { Transaction } from "@/components/TransactionsTable";

export const Route = createFileRoute("/")({ component: Dashboard });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SummaryData {
  netWorth: number;
  monthlyIncome: number;
  totalSpending: number;
  savingsRate: number;
  netWorthChange: number;
  spendingChange: number;
}

interface Alert {
  id: string;
  severity: "info" | "warning" | "danger";
  message: string;
  timestamp: string;
  read: boolean;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
const Stat = memo(function Stat({
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
    <div className="rounded-xl border border-border/60 p-5 bg-card">
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
});

const Bar = memo(function Bar({
  label,
  pct,
  value,
  color,
}: {
  label: string;
  pct: number;
  value: string;
  color: string;
}) {
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
});

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

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard() {
  const { trackEvent, trackPageView, trackCTA } = useAnalytics();

  // Fetch mock data
  const { data: summary, loading: summaryLoading } = useFetch<SummaryData>("mock:summary");
  const { data: transactions, loading: txLoading } = useFetch<Transaction[]>("mock:transactions");
  const { data: alertsData, loading: alertsLoading } = useFetch<Alert[]>("mock:alerts");

  useEffect(() => {
    trackPageView("Dashboard");
    trackEvent("lifecycle", EVENTS.DASHBOARD_LOADED, "initial_load");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate top insight dynamically
  const topInsight = useMemo(() => {
    if (!transactions || !summary) return null;
    const insights = generateInsights(transactions, summary);
    return insights[0] || null;
  }, [transactions, summary]);

  const handleExecuteStrategy = useCallback(() => {
    if (topInsight) {
      trackCTA("execute_strategy", { insight_id: topInsight.id });
    }
  }, [topInsight, trackCTA]);

  // Calculate dynamic spending composition
  const spendingComposition = useMemo(() => {
    if (!transactions) return [];
    const totals: Record<string, number> = {};
    let totalSpend = 0;

    transactions.forEach((t) => {
      if (t.type === "debit" && t.status !== "failed") {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
        totalSpend += t.amount;
      }
    });

    const colors: Record<string, string> = {
      Shopping: "bg-indigo-400",
      Food: "bg-orange-400",
      Subscriptions: "bg-emerald-400",
      Transport: "bg-sky-400",
      Health: "bg-pink-400",
      Entertainment: "bg-purple-400",
    };

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4) // top 4 categories
      .map(([label, value]) => ({
        label,
        pct: totalSpend > 0 ? Math.round((value / totalSpend) * 100) : 0,
        color: colors[label] || "bg-blue-400",
      }));
  }, [transactions]);

  // Map severities to alert styling
  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case "danger":
        return { icon: <AlertTriangle className="h-4 w-4 text-red-400" />, bg: "bg-red-500/10" };
      case "warning":
        return { icon: <PiggyBank className="h-4 w-4 text-amber-400" />, bg: "bg-amber-500/10" };
      default:
        return { icon: <Activity className="h-4 w-4 text-sky-400" />, bg: "bg-sky-500/10" };
    }
  };

  return (
    <Layout>
      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {summaryLoading || !summary ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Stat
              label="Total Net Worth"
              value={`$${summary.netWorth.toLocaleString()}`}
              delta={`+${summary.netWorthChange}% vs last month`}
            />
            <Stat
              label="Monthly Spending"
              value={`$${summary.totalSpending.toLocaleString()}`}
              delta={`${summary.spendingChange}% vs avg`}
              positive={summary.spendingChange < 0}
            />
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Total Savings
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">
                ${Math.round((summary.netWorth * summary.savingsRate) / 100).toLocaleString()}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> On track for Q4 goal
              </div>
            </div>
          </>
        )}
      </div>

      {/* Strategy + Alerts */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Dynamic Pro Strategy Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-blue-700 p-7 lg:col-span-2">
          {summaryLoading || !topInsight ? (
            <div className="h-40 animate-pulse bg-white/10 rounded-xl" />
          ) : (
            <>
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
                <button
                  onClick={handleExecuteStrategy}
                  className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90 transition-colors"
                >
                  Execute Strategy
                </button>
                <button className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                  Review Audit
                </button>
              </div>
            </>
          )}
        </div>

        {/* Dynamic Alerts */}
        <div>
          <div className="mb-3 text-lg font-semibold">Active Alerts</div>
          {alertsLoading || !alertsData ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[74px] animate-pulse rounded-xl bg-muted/60" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {alertsData.slice(0, 3).map((alert) => {
                const style = getAlertStyle(alert.severity);
                return (
                  <AlertCard
                    key={alert.id}
                    icon={style.icon}
                    bg={style.bg}
                    title={alert.message.split(".")[0]}
                    body={alert.message}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Composition + Recent */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Dynamic Spending Composition */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Spending Composition</h3>
            <button className="text-xs text-primary hover:underline">View All</button>
          </div>
          
          {txLoading ? (
            <div className="space-y-5">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-6 animate-pulse bg-muted/60 rounded" />)}
            </div>
          ) : (
            <div className="space-y-5">
              {spendingComposition.map((comp) => (
                <Bar
                  key={comp.label}
                  label={comp.label}
                  value={`${comp.pct}%`}
                  pct={comp.pct}
                  color={comp.color}
                />
              ))}
            </div>
          )}

          <div className="mt-6 rounded-lg border border-border/50 bg-background/40 p-4 text-xs italic text-muted-foreground">
            <div className="mb-1 not-italic text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
              Editor's Note
            </div>
            "Your discretionary spending on 'Dining & Leisure' is down 12% this month. This surplus
            has been automatically moved to your 'S&P 500' bucket."
          </div>
        </div>

        {/* Dynamic Recent Activity */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <div className="flex gap-2">
              <button className="rounded-md border border-border/60 px-3 py-1.5 text-xs hover:bg-accent transition-colors">
                Export CSV
              </button>
              <button className="rounded-md border border-border/60 px-3 py-1.5 text-xs hover:bg-accent transition-colors">
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

          {txLoading ? (
            <div className="space-y-0">
              {[1, 2, 3].map(i => <div key={i} className="h-16 border-b border-border/40 animate-pulse bg-muted/20" />)}
            </div>
          ) : (
            <div>
              {transactions?.slice(0, 4).map((t) => {
                const isCredit = t.type === "credit";
                const catClass: Record<string, string> = {
                  Shopping: "bg-sky-500/15 text-sky-400",
                  Food: "bg-orange-500/15 text-orange-400",
                  Health: "bg-emerald-500/15 text-emerald-400",
                  Transport: "bg-blue-500/15 text-blue-400",
                  Subscriptions: "bg-purple-500/15 text-purple-400",
                  Entertainment: "bg-pink-500/15 text-pink-400",
                };
                const iconMap: Record<string, React.ReactNode> = {
                  Shopping: <ShoppingBag className="h-4 w-4" />,
                  Food: <Utensils className="h-4 w-4" />,
                  Transport: <Zap className="h-4 w-4" />, // Mapping Zap to transport for styling parity
                };
                const icon = iconMap[t.category] || <MoreHorizontal className="h-4 w-4" />;
                const statusDot: Record<string, string> = {
                  completed: "bg-emerald-400",
                  pending: "bg-amber-400",
                  failed: "bg-red-400",
                };
                
                const formattedDate = new Date(t.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }).replace(",", ""); // format close to "Oct 24 2023 · 14:20"

                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-3 border-b border-border/40 py-3 text-sm last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate max-w-[120px]">{t.merchant}</div>
                        <div className="text-[11px] text-muted-foreground whitespace-nowrap">{formattedDate}</div>
                      </div>
                    </div>
                    <div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-medium ${catClass[t.category] || "bg-muted"}`}>
                        {t.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`h-2 w-2 rounded-full ${statusDot[t.status]}`} /> 
                      <span className="capitalize">{t.status === "completed" ? "Cleared" : t.status}</span>
                    </div>
                    <div className={`text-right text-sm font-semibold ${isCredit ? "text-emerald-400" : ""}`}>
                      {isCredit ? "+" : "-"}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
