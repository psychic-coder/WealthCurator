/**
 * src/components/AIInsightsPanel.tsx
 * AI-powered insights panel — lazy-loadable, memoized, analytics-wired.
 *
 * WHY React.memo with custom comparator: Insight data is structurally stable
 * (same ID set = same render). Without memoization this re-renders on every
 * parent state change even when insights haven't changed.
 */

import React, { memo, useEffect, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { InsightsPanelSkeleton } from "./SkeletonLoader";
import { useAnalytics } from "../hooks";
import { EVENTS, firesInsightCTAClicked, pushDataLayer } from "../analytics/events";
import type { GeneratedInsight } from "../lib/insightsEngine";

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------
interface AIInsightsPanelProps {
  insights: GeneratedInsight[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Custom areEqual comparator — only re-render if insight IDs or priorities change
// WHY: Prevents unnecessary re-renders when parent re-renders with same insight data
// ---------------------------------------------------------------------------
function insightsAreEqual(
  prevProps: AIInsightsPanelProps,
  nextProps: AIInsightsPanelProps
): boolean {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.insights.length !== nextProps.insights.length) return false;
  return prevProps.insights.every(
    (ins, i) =>
      ins.id === nextProps.insights[i]?.id &&
      ins.priority === nextProps.insights[i]?.priority
  );
}

// ---------------------------------------------------------------------------
// Icon mapping per insight type
// ---------------------------------------------------------------------------
const INSIGHT_ICONS: Record<GeneratedInsight["type"], React.ReactNode> = {
  saving: <Lightbulb className="h-4 w-4" />,
  risk: <AlertTriangle className="h-4 w-4" />,
  opportunity: <TrendingUp className="h-4 w-4" />,
  alert: <ShieldCheck className="h-4 w-4" />,
};

const INSIGHT_COLORS: Record<GeneratedInsight["type"], string> = {
  saving: "bg-emerald-500/15 text-emerald-400",
  risk: "bg-red-500/15 text-red-400",
  opportunity: "bg-primary/15 text-primary",
  alert: "bg-amber-500/15 text-amber-400",
};

const PRIORITY_BADGE: Record<GeneratedInsight["priority"], string> = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-emerald-500/15 text-emerald-400",
};

// ---------------------------------------------------------------------------
// Individual insight card — memoized to prevent row-level re-renders
// WHY: With react-window or many cards, each row re-rendering is expensive
// ---------------------------------------------------------------------------
const InsightCard = memo(function InsightCard({
  insight,
  onCTA,
}: {
  insight: GeneratedInsight;
  onCTA: (insight: GeneratedInsight) => void;
}) {
  return (
    <article
      className="rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
      aria-label={`Insight: ${insight.title}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-md ${INSIGHT_COLORS[insight.type]}`}
            aria-hidden="true"
          >
            {INSIGHT_ICONS[insight.type]}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground capitalize">
            {insight.type}
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_BADGE[insight.priority]}`}
          aria-label={`Priority: ${insight.priority}`}
        >
          {insight.priority}
        </span>
      </div>

      <h3 className="mb-2 text-sm font-semibold leading-snug">{insight.title}</h3>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        {insight.description}
      </p>

      <div className="mb-4 text-xs font-medium text-primary">
        Impact: {insight.impact}
      </div>

      <div className="flex gap-2">
        <button
          id={`cta-${insight.id}`}
          className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onCTA(insight)}
          aria-label={`${insight.cta} for insight: ${insight.title}`}
        >
          {insight.cta}
        </button>
        <button
          className="rounded-md border border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Dismiss insight: ${insight.title}`}
        >
          Dismiss
        </button>
      </div>
    </article>
  );
});

// ---------------------------------------------------------------------------
// Main AIInsightsPanel component
// WHY: Wrapped in React.memo with custom comparator to prevent re-renders
// when parent re-renders but insight data hasn't changed.
// ---------------------------------------------------------------------------
const AIInsightsPanel = memo(function AIInsightsPanel({
  insights,
  isLoading = false,
}: AIInsightsPanelProps) {
  const { trackEvent } = useAnalytics();

  // Simulate 800ms "AI computation" skeleton on first load
  const [showSkeleton, setShowSkeleton] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCTA = (insight: GeneratedInsight) => {
    // Fire insight_cta_clicked analytics event
    const params = firesInsightCTAClicked(insight.id, insight.type);
    trackEvent(
      params.event_category as string,
      EVENTS.INSIGHT_CTA_CLICKED,
      insight.id
    );
    pushDataLayer(EVENTS.INSIGHT_CTA_CLICKED, params);
  };

  if (isLoading || showSkeleton) {
    return (
      <section aria-label="AI Insights — loading" aria-busy="true">
        <div className="mb-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm font-medium text-muted-foreground">
            Refreshing insights...
          </span>
        </div>
        <InsightsPanelSkeleton />
      </section>
    );
  }

  return (
    <section aria-label="AI-generated financial insights">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          AI Strategy Insights
        </h2>
        <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {insights.length} active
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
          No insights available at this time. Keep tracking your spending!
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} onCTA={handleCTA} />
          ))}
        </div>
      )}
    </section>
  );
},
insightsAreEqual);

export default AIInsightsPanel;
