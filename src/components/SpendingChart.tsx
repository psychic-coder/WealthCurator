/**
 * src/components/SpendingChart.tsx
 * Recharts-powered spending breakdown chart — lazy-loadable.
 *
 * WHY lazy-loaded: Recharts is ~200KB. Importing it only inside this lazy
 * component keeps the initial bundle lean and improves Time-to-Interactive.
 *
 * WHY Recharts is imported here (not at top level): Code-splitting requires
 * that heavy dependencies live in lazy-loaded chunks. Top-level imports
 * defeat the purpose of React.lazy().
 */

import React, { memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChartSkeleton } from "./SkeletonLoader";

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------
interface CategoryData {
  label: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  data: CategoryData[];
  isLoading?: boolean;
  /** "pie" or "bar" — defaults to "bar" */
  variant?: "pie" | "bar";
}

// ---------------------------------------------------------------------------
// Custom tooltip component for Recharts
// WHY: Default tooltips don't respect dark mode CSS variables
// ---------------------------------------------------------------------------
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: CategoryData }>;
}) {
  if (!active || !payload?.length) return null;
  const { label, value } = payload[0].payload;
  return (
    <div
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="font-semibold text-foreground">{label}</div>
      <div className="text-muted-foreground">
        ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pie chart variant
// ---------------------------------------------------------------------------
const SpendingPieChart = memo(function SpendingPieChart({
  data,
}: {
  data: CategoryData[];
}) {
  return (
    <div
      role="img"
      aria-label={`Pie chart showing spending breakdown: ${data.map((d) => `${d.label} ${d.value.toFixed(0)}%`).join(", ")}`}
      className="h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Bar chart variant
// ---------------------------------------------------------------------------
const SpendingBarChart = memo(function SpendingBarChart({
  data,
}: {
  data: CategoryData[];
}) {
  return (
    <div
      role="img"
      aria-label={`Bar chart showing spending by category: ${data.map((d) => `${d.label} $${d.value}`).join(", ")}`}
      className="h-48"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-accent)" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main SpendingChart component — memoized to avoid re-renders on unrelated state
// WHY React.memo: The chart is heavy (SVG re-render). Memo ensures it only
// re-renders when the spending data actually changes.
// ---------------------------------------------------------------------------
const SpendingChart = memo(function SpendingChart({
  data,
  isLoading = false,
  variant = "bar",
}: SpendingChartProps) {
  if (isLoading) return <ChartSkeleton />;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Spending Breakdown</h3>
        <div className="flex gap-2 text-xs">
          {data.map((d) => (
            <span key={d.label} className="flex items-center gap-1 text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
                aria-hidden="true"
              />
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {variant === "pie" ? (
        <SpendingPieChart data={data} />
      ) : (
        <SpendingBarChart data={data} />
      )}
    </div>
  );
});

export default SpendingChart;
