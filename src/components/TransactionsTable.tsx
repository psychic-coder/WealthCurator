/**
 * src/components/TransactionsTable.tsx
 * Fully-featured transactions table with:
 * - Semantic <table> markup for accessibility
 * - react-window FixedSizeList windowing when row count > 20
 * - React.memo on both the table and individual row components
 * - Color-coded status badges with text (not color-only)
 * - Search and category filtering support
 *
 * WHY react-window: Rendering 50+ DOM nodes for every transaction causes
 * layout thrashing. Virtual scrolling renders only visible rows (~10–15),
 * keeping frame rate smooth regardless of dataset size.
 *
 * WHY React.memo on RowComponent: Even with react-window, each row is a
 * separate component. Without memo, every parent re-render re-renders all
 * visible rows unnecessarily.
 */

import React, { memo, useCallback } from "react";
import { List } from "react-window";
import {
  ShoppingBag,
  Utensils,
  Zap,
  Plane,
  Tv,
  Heart,
  Music,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { TransactionsTableSkeleton } from "./SkeletonLoader";

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------
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
// Category icon mapping
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
// Status badge — uses BOTH color AND icon+text (a11y: not color-only)
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
// Individual row component — memoized to prevent re-renders from list scroll
// WHY: react-window passes style prop on each render; memo prevents unnecessary
// DOM updates for rows that haven't changed data.
// ---------------------------------------------------------------------------
const RowComponent = memo(function RowComponent({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: Transaction[];
}) {
  const t = data[index];
  if (!t) return null;

  const icon = CATEGORY_ICONS[t.category] ?? <MoreHorizontal className="h-4 w-4" />;
  const catClass = CATEGORY_COLORS[t.category] ?? "bg-muted text-muted-foreground";
  const isCredit = t.type === "credit";
  const formattedDate = new Date(t.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      style={style}
      role="row"
      className={`grid grid-cols-[1fr_1.8fr_1fr_1fr_1fr] items-center gap-4 border-b border-border/40 px-6 text-sm ${index % 2 === 0 ? "bg-transparent" : "bg-accent/20"}`}
    >
      <div role="cell" className="text-xs text-muted-foreground">{formattedDate}</div>
      <div role="cell" className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          {icon}
        </div>
        <span className="truncate font-medium">{t.merchant}</span>
      </div>
      <div role="cell">
        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-medium ${catClass}`}>
          {t.category}
        </span>
      </div>
      <div role="cell">
        <StatusBadge status={t.status} />
      </div>
      <div
        role="cell"
        className={`text-right font-semibold ${isCredit ? "text-emerald-400" : "text-foreground"}`}
      >
        {isCredit ? "+" : "-"}${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Small table (≤ 20 rows) — standard semantic <table> markup
// WHY: react-window uses divs which hurts screen readers for small lists.
// Use proper <table> markup when windowing is not needed.
// ---------------------------------------------------------------------------
const SemanticTable = memo(function SemanticTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <table className="w-full text-sm" role="table" aria-label="Transaction history">
      <thead>
        <tr className="border-b border-border/60">
          <th scope="col" className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Date
          </th>
          <th scope="col" className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Merchant
          </th>
          <th scope="col" className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </th>
          <th scope="col" className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </th>
          <th scope="col" className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t, index) => {
          const icon = CATEGORY_ICONS[t.category] ?? <MoreHorizontal className="h-4 w-4" />;
          const catClass = CATEGORY_COLORS[t.category] ?? "bg-muted text-muted-foreground";
          const isCredit = t.type === "credit";
          const formattedDate = new Date(t.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return (
            <tr
              key={t.id}
              className={`border-b border-border/40 last:border-0 ${index % 2 === 0 ? "" : "bg-accent/20"}`}
            >
              <td className="px-6 py-4 text-xs text-muted-foreground">{formattedDate}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground" aria-hidden="true">
                    {icon}
                  </div>
                  <span className="font-medium">{t.merchant}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-medium ${catClass}`}>
                  {t.category}
                </span>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={t.status} />
              </td>
              <td className={`px-6 py-4 text-right font-semibold ${isCredit ? "text-emerald-400" : ""}`}>
                {isCredit ? "+" : "-"}${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});

// ---------------------------------------------------------------------------
// Main TransactionsTable — switches to react-window when row count > 20
// WHY React.memo: The parent (transactions route) re-renders on search/filter
// changes. Without memo, the entire table unmounts/remounts on every keystroke.
// ---------------------------------------------------------------------------
const TransactionsTable = memo(function TransactionsTable({
  transactions,
  isLoading = false,
}: TransactionsTableProps) {
  const useWindowing = transactions.length > 20;

  const itemData = useCallback(() => transactions, [transactions])();

  if (isLoading) return <TransactionsTableSkeleton />;

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      {/* Header row — always rendered */}
      <div className="grid grid-cols-[1fr_1.8fr_1fr_1fr_1fr] gap-4 border-b border-border/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Date</div>
        <div>Merchant</div>
        <div>Category</div>
        <div>Status</div>
        <div className="text-right">Amount</div>
      </div>

      {transactions.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-muted-foreground">
          No transactions match your search or filters.
        </div>
      ) : useWindowing ? (
        /**
         * WHY react-window FixedSizeList:
         * With 50 rows each ~60px tall, the full list is 3000px of DOM nodes.
         * FixedSizeList renders only the ~8 visible rows at a time,
         * dramatically reducing paint and layout cost during scroll.
         */
        <div
          role="table"
          aria-label="Transaction history (virtualized)"
          aria-rowcount={transactions.length}
        >
          <List
            height={480}
            itemCount={transactions.length}
            itemSize={60}
            width="100%"
            itemData={itemData}
          >
            {RowComponent as React.ComponentType<{ index: number; style: React.CSSProperties; data: Transaction[] }>}
          </List>
        </div>
      ) : (
        <SemanticTable transactions={transactions} />
      )}

      <div className="border-t border-border/60 px-6 py-3 text-xs text-muted-foreground">
        Showing {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
});

export default TransactionsTable;
