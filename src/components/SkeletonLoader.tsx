/**
 * src/components/SkeletonLoader.tsx
 * Reusable animated skeleton loader components used as Suspense fallbacks
 * and loading states throughout the dashboard.
 *
 * WHY: Skeleton loaders provide immediate visual feedback during async data
 * loading, preventing layout shift and improving perceived performance.
 */

import React from "react";

// ---------------------------------------------------------------------------
// Base skeleton pulse element — all variants compose from this
// ---------------------------------------------------------------------------
function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted/60 ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Card skeleton — matches the summary stat card shape
// ---------------------------------------------------------------------------
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5" aria-busy="true" aria-label="Loading card">
      <SkeletonPulse className="h-3 w-24 mb-4" />
      <SkeletonPulse className="h-8 w-32 mb-3" />
      <SkeletonPulse className="h-3 w-20" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row skeleton — matches a transaction table row shape
// ---------------------------------------------------------------------------
export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border/40 py-4 px-6" aria-busy="true" aria-label="Loading row">
      <SkeletonPulse className="h-8 w-8 rounded-md shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-3 w-40" />
        <SkeletonPulse className="h-2 w-24" />
      </div>
      <SkeletonPulse className="h-5 w-16 rounded-full" />
      <SkeletonPulse className="h-3 w-14" />
      <SkeletonPulse className="h-4 w-16 ml-auto" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart placeholder skeleton — matches chart panel dimensions
// ---------------------------------------------------------------------------
export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6" aria-busy="true" aria-label="Loading chart">
      <div className="mb-5 flex items-center justify-between">
        <SkeletonPulse className="h-4 w-40" />
        <SkeletonPulse className="h-6 w-24 rounded-md" />
      </div>
      <SkeletonPulse className="h-48 w-full rounded-lg" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Insight card skeleton — matches AI insight card shape
// ---------------------------------------------------------------------------
export function InsightCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6" aria-busy="true" aria-label="Loading insight">
      <div className="flex items-center gap-2 mb-4">
        <SkeletonPulse className="h-5 w-5 rounded-full" />
        <SkeletonPulse className="h-3 w-24" />
      </div>
      <SkeletonPulse className="h-5 w-3/4 mb-3" />
      <SkeletonPulse className="h-3 w-full mb-2" />
      <SkeletonPulse className="h-3 w-5/6 mb-4" />
      <div className="flex gap-3">
        <SkeletonPulse className="h-8 w-28 rounded-md" />
        <SkeletonPulse className="h-8 w-16 rounded-md" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full dashboard loading skeleton — used as Suspense fallback for Dashboard
// ---------------------------------------------------------------------------
export function DashboardSkeleton() {
  return (
    <div className="space-y-5 p-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-4 flex gap-3">
              <SkeletonPulse className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonPulse className="h-3 w-32" />
                <SkeletonPulse className="h-2 w-full" />
                <SkeletonPulse className="h-2 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Insights panel skeleton — "Refreshing insights..." state
// ---------------------------------------------------------------------------
export function InsightsPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <SkeletonPulse className="h-4 w-4 rounded-full" />
        <SkeletonPulse className="h-3 w-36" />
      </div>
      {[1, 2, 3].map((i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Transactions table skeleton
// ---------------------------------------------------------------------------
export function TransactionsTableSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="px-6 py-3 border-b border-border/60">
        <SkeletonPulse className="h-3 w-48" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

export default SkeletonLoader;

function SkeletonLoader() {
  return <DashboardSkeleton />;
}
