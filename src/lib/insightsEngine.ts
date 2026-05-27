/**
 * src/lib/insightsEngine.ts
 * Pure function module that generates dynamic AI insights from transaction data.
 * All functions are side-effect free — safe to use in useMemo.
 */

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

export interface SummaryData {
  netWorth: number;
  monthlyIncome: number;
  totalSpending: number;
  savingsRate: number;
  netWorthChange: number;
  spendingChange: number;
}

export interface GeneratedInsight {
  id: string;
  type: "saving" | "risk" | "opportunity" | "alert";
  title: string;
  description: string;
  impact: string;
  cta: string;
  priority: "high" | "medium" | "low";
}

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function spendingByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions
    .filter((t) => t.type === "debit" && t.status !== "failed")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});
}

// ---------------------------------------------------------------------------
// generateInsights — main export
// Returns an array of insight objects derived from live transaction data.
// ---------------------------------------------------------------------------
export function generateInsights(
  transactions: Transaction[],
  summary: SummaryData
): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];
  const categorySpend = spendingByCategory(transactions);
  const totalSpend = Object.values(categorySpend).reduce((a, b) => a + b, 0);

  // Rule 1: If any category spending > 30% of total → flag high concentration
  Object.entries(categorySpend).forEach(([category, amount]) => {
    const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
    if (pct > 30) {
      insights.push({
        id: `gen_concentration_${category.toLowerCase()}`,
        type: "risk",
        title: `High Concentration in ${category}`,
        description: `${category} accounts for ${pct.toFixed(1)}% of your total spending this period. Consider diversifying to reduce exposure to this category.`,
        impact: `${pct.toFixed(1)}% of spend`,
        cta: "Execute Strategy",
        priority: "high",
      });
    }
  });

  // Rule 2: Duplicate merchant in Subscriptions (appears 2+ times)
  const subscriptionMerchants = transactions
    .filter((t) => t.category === "Subscriptions" && t.type === "debit")
    .map((t) => t.merchant);
  const merchantCounts = subscriptionMerchants.reduce<Record<string, number>>((acc, m) => {
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});
  Object.entries(merchantCounts).forEach(([merchant, count]) => {
    if (count >= 2) {
      insights.push({
        id: `gen_duplicate_${merchant.toLowerCase().replace(/\s+/g, "_")}`,
        type: "saving",
        title: `Possible Duplicate: ${merchant}`,
        description: `"${merchant}" appears ${count} times in your subscriptions. This may be a duplicate charge worth reviewing.`,
        impact: "Potential duplicate charges",
        cta: "Review Subscriptions",
        priority: "high",
      });
    }
  });

  // Rule 3: Savings rate < 20% → warning
  if (summary.savingsRate < 20) {
    insights.push({
      id: "gen_savings_rate_low",
      type: "alert",
      title: "Savings Rate Below Recommended Threshold",
      description: `Your current savings rate is ${summary.savingsRate.toFixed(1)}%, below the recommended 20% minimum. Review discretionary spending to close this gap.`,
      impact: `${(20 - summary.savingsRate).toFixed(1)}% gap to target`,
      cta: "Optimize Budget",
      priority: "high",
    });
  }

  // Rule 4: Net worth increased > 3% MoM → positive reinforcement
  if (summary.netWorthChange > 3) {
    insights.push({
      id: "gen_net_worth_growth",
      type: "opportunity",
      title: `Strong Growth: Net Worth Up ${summary.netWorthChange}% This Month`,
      description: `Excellent trajectory — your net worth grew ${summary.netWorthChange}% this month, outpacing the average benchmark of 1.2%. Consider locking in gains.`,
      impact: `+${summary.netWorthChange}% MoM`,
      cta: "Review Portfolio",
      priority: "low",
    });
  }

  // Rule 5: Pending transactions count → verification reminder
  const pendingTransactions = transactions.filter((t) => t.status === "pending");
  if (pendingTransactions.length > 0) {
    insights.push({
      id: "gen_pending_transactions",
      type: "alert",
      title: `${pendingTransactions.length} Transaction${pendingTransactions.length > 1 ? "s" : ""} Pending — Verify Before Month Close`,
      description: `You have ${pendingTransactions.length} pending transaction${pendingTransactions.length > 1 ? "s" : ""} that may affect your monthly totals. Review these before the close of the billing cycle.`,
      impact: `${formatCurrency(pendingTransactions.reduce((sum, t) => sum + t.amount, 0))} pending`,
      cta: "Review Pending",
      priority: "medium",
    });
  }

  // Rule 6: Top spending category
  if (totalSpend > 0) {
    const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push({
        id: "gen_top_category",
        type: "saving",
        title: `Top Spend This Month: ${topCategory[0]} at ${formatCurrency(topCategory[1])}`,
        description: `${topCategory[0]} is your highest expense category this period at ${formatCurrency(topCategory[1])}. Small reductions here have the highest absolute dollar impact.`,
        impact: formatCurrency(topCategory[1]),
        cta: "Analyze Spending",
        priority: "medium",
      });
    }
  }

  // Rule 7: Portfolio rebalance if any single holding > 40% (uses netWorthChange as proxy)
  // In a real app this would check portfolio.allocation; we simulate with spending data
  const largestCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];
  if (largestCategory && totalSpend > 0 && (largestCategory[1] / totalSpend) * 100 > 40) {
    insights.push({
      id: "gen_rebalance",
      type: "risk",
      title: "Portfolio Rebalance Recommended",
      description: `A single spending category exceeds 40% of your budget allocation. Consider rebalancing your budget to reduce concentration risk and improve financial resilience.`,
      impact: "Concentration risk elevated",
      cta: "Execute Strategy",
      priority: "high",
    });
  }

  // Deduplicate by id and return sorted by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const unique = Array.from(new Map(insights.map((i) => [i.id, i])).values());
  return unique.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
