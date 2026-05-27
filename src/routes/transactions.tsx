/**
 * src/routes/transactions.tsx
 * Full transactions ledger — wired to useFetch mock data with debounced search,
 * category filtering, react-window windowing (>20 rows), and analytics events.
 */

import React, { lazy, Suspense, useState, useMemo, useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Search } from "lucide-react";
import { TransactionsTableSkeleton } from "@/components/SkeletonLoader";
import { useFetch, useDebounce, useAnalytics } from "@/hooks";
import { EVENTS, pushDataLayer } from "@/analytics/events";
import type { Transaction } from "@/components/TransactionsTable";

// WHY lazy: TransactionsTable + react-window are heavy. Lazy loading keeps
// the initial page bundle light and defers cost until the user visits this page.
const TransactionsTable = lazy(() => import("@/components/TransactionsTable"));

export const Route = createFileRoute("/transactions")({ component: Transactions });

const CATEGORIES = ["All", "Food", "Shopping", "Transport", "Subscriptions", "Health", "Entertainment"];
const STATUSES = ["All", "completed", "pending", "failed"];

function Transactions() {
  const { trackEvent, trackPageView } = useAnalytics();
  const { data: transactions, loading } = useFetch<Transaction[]>("mock:transactions");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fire page view on mount
  useEffect(() => {
    trackPageView("Transactions");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire search_used when debounced query changes
  useEffect(() => {
    if (debouncedSearch.length > 0) {
      trackEvent("search", EVENTS.SEARCH_USED, undefined, debouncedSearch.length);
      pushDataLayer(EVENTS.SEARCH_USED, { query_length: debouncedSearch.length });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Memoize filtered transaction list — recalculates only when dependencies change
  // WHY useMemo: Filters run on every render without it. With 50 records this
  // is fine but demonstrates correct patterns for production scale.
  // ---------------------------------------------------------------------------
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) => {
      const matchesSearch =
        debouncedSearch.length === 0 ||
        t.merchant.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || t.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "All" || t.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [transactions, debouncedSearch, selectedCategory, selectedStatus]);

  // ---------------------------------------------------------------------------
  // Memoize summary totals from filtered transactions
  // ---------------------------------------------------------------------------
  const summaryTotals = useMemo(() => {
    const debits = filteredTransactions.filter((t) => t.type === "debit" && t.status !== "failed");
    const credits = filteredTransactions.filter((t) => t.type === "credit");
    return {
      totalDebit: debits.reduce((sum, t) => sum + t.amount, 0),
      totalCredit: credits.reduce((sum, t) => sum + t.amount, 0),
      pending: filteredTransactions.filter((t) => t.status === "pending").length,
    };
  }, [filteredTransactions]);

  // ---------------------------------------------------------------------------
  // useCallback for all handlers — stable references prevent child re-renders
  // ---------------------------------------------------------------------------
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = useCallback(
    (cat: string) => {
      setSelectedCategory(cat);
      trackEvent("filter", EVENTS.FILTER_CHANGED, cat);
      pushDataLayer(EVENTS.FILTER_CHANGED, { filter_value: cat });
    },
    [trackEvent]
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      setSelectedStatus(status);
      trackEvent("filter", EVENTS.FILTER_CHANGED, `status:${status}`);
    },
    [trackEvent]
  );

  return (
    <Layout>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Data Integrity
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Transactional Ledger</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete record of all financial transactions, searchable and filterable.
          </p>
        </div>
        <button
          className="rounded-md border border-border/60 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          aria-label="Export transactions as CSV"
        >
          Export CSV
        </button>
      </div>

      {/* Summary chips */}
      {!loading && (
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="rounded-lg border border-border/60 bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Outflow: </span>
            <span className="font-semibold text-foreground">${summaryTotals.totalDebit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Inflow: </span>
            <span className="font-semibold text-emerald-400">${summaryTotals.totalCredit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Pending: </span>
            <span className="font-semibold text-amber-400">{summaryTotals.pending}</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Showing: </span>
            <span className="font-semibold">{filteredTransactions.length} of {transactions?.length ?? 0}</span>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="mt-5 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <label htmlFor="ledger-search" className="sr-only">Search transactions</label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="ledger-search"
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search merchant or category..."
            className="h-9 w-full rounded-md border border-border/60 bg-card/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            aria-label="Search transactions by merchant or category"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              aria-pressed={selectedCategory === cat}
              aria-label={`Filter by category: ${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                selectedStatus === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              aria-pressed={selectedStatus === s}
              aria-label={`Filter by status: ${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions table — lazy loaded with react-window */}
      <div className="mt-5">
        <Suspense fallback={<TransactionsTableSkeleton />}>
          <TransactionsTable
            transactions={filteredTransactions}
            isLoading={loading}
          />
        </Suspense>
      </div>

      {/* Unusual activity alert */}
      {!loading && filteredTransactions.some((t) => t.merchant === "Unknown Merchant") && (
        <div
          className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-5"
          role="alert"
          aria-label="Unusual activity detected"
        >
          <div className="flex gap-3">
            <div className="text-red-400" aria-hidden="true">⚠</div>
            <div>
              <div className="text-sm font-semibold text-red-300">Unusual Activity Detected</div>
              <div className="mt-1 text-xs text-red-200/80">
                A transaction at "Unknown Merchant" requires your immediate verification.
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
