

import React, { memo } from "react";
import {
  ShoppingBag,
  Utensils,
  Heart,
  Plane,
  Tv,
  Music,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { TransactionsTableSkeleton } from "./SkeletonLoader";


export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: "debit" | "credit";
  status: "completed" | "pending" | "failed";
}

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Category icon and color mapping
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Shopping: <ShoppingBag className="h-4 w-4" />,
  Food: <Utensils className="h-4 w-4" />,
  Health: <Heart className="h-4 w-4" />,
  Transport: <Plane className="h-4 w-4" />,
  Subscriptions: <Tv className="h-4 w-4" />,
  Entertainment: <Music className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Shopping: "bg-sky-500/15 text-sky-400",
  Food: "bg-orange-500/15 text-orange-400",
  Health: "bg-emerald-500/15 text-emerald-400",
  Transport: "bg-blue-500/15 text-blue-400",
  Subscriptions: "bg-purple-500/15 text-purple-400",
  Entertainment: "bg-pink-500/15 text-pink-400",
};

// ---------------------------------------------------------------------------
// Status badge — uses BOTH icon AND text (a11y: never color-only)
// ---------------------------------------------------------------------------
const STATUS_CONFIG = {
  completed: {
    icon: <CheckCircle className="h-3 w-3" aria-hidden="true" />,
    label: "Cleared",
    className: "text-emerald-400",
  },
  pending: {
    icon: <Clock className="h-3 w-3" aria-hidden="true" />,
    label: "Pending",
    className: "text-amber-400",
  },
  failed: {
    icon: <XCircle className="h-3 w-3" aria-hidden="true" />,
    label: "Failed",
    className: "text-red-400",
  },
};

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`flex items-center gap-1.5 text-xs ${config.className}`}
      aria-label={`Status: ${config.label}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Single table row — memoized to prevent re-renders during parent state changes
// WHY: Filtering/searching causes parent re-renders. Without memo, all visible
// rows re-render on every keystroke even when their own data hasn't changed.
// ---------------------------------------------------------------------------
const TableRow = memo(function TableRow({
  transaction,
  index,
}: {
  transaction: Transaction;
  index: number;
}) {
  const t = transaction;
  const icon = CATEGORY_ICONS[t.category] ?? <MoreHorizontal className="h-4 w-4" />;
  const catClass = CATEGORY_COLORS[t.category] ?? "bg-muted text-muted-foreground";
  const isCredit = t.type === "credit";
  const formattedDate = new Date(t.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <tr className={`border-b border-border/40 last:border-0 transition-colors hover:bg-accent/30 ${index % 2 !== 0 ? "bg-accent/10" : ""}`}>
      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
        {formattedDate}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            {icon}
          </div>
          <span className="text-sm font-medium truncate max-w-[160px]">{t.merchant}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-medium ${catClass}`}>
          {t.category}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge status={t.status} />
      </td>
      <td className={`px-5 py-3.5 text-right text-sm font-semibold whitespace-nowrap ${isCredit ? "text-emerald-400" : "text-foreground"}`}>
        {isCredit ? "+" : "−"}${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  );
});

const TransactionsTable = memo(function TransactionsTable({
  transactions,
  isLoading = false,
}: TransactionsTableProps) {
  const useStickyScroll = transactions.length > 20;

  if (isLoading) return <TransactionsTableSkeleton />;

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      {/* Scrollable wrapper — sticky header stays visible on scroll for large lists */}
      <div
        className={useStickyScroll ? "overflow-y-auto max-h-[520px]" : ""}
        role="region"
        aria-label="Transaction history"
      >
        <table
          className="w-full text-sm"
          role="table"
          aria-label="Transaction history"
          aria-rowcount={transactions.length}
        >
          {/* Sticky header — stays pinned when scrolling through > 20 rows */}
          <thead className={useStickyScroll ? "sticky top-0 z-10 bg-card" : ""}>
            <tr className="border-b border-border/60">
              <th
                scope="col"
                className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Merchant
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-sm text-muted-foreground"
                >
                  No transactions match your search or filters.
                </td>
              </tr>
            ) : (
              transactions.map((t, index) => (
                <TableRow key={t.id} transaction={t} index={index} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground flex items-center justify-between">
        <span>
          Showing {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </span>
        {useStickyScroll && (
          <span className="text-muted-foreground/60 italic">Scroll to see all</span>
        )}
      </div>
    </div>
  );
});

export default TransactionsTable;
