import type { Transaction } from '../types/finance';
import { currencyFormatter, getSummaryMetrics } from './finance';

export type InsightTone = 'positive' | 'neutral' | 'caution';

export type SpendingLeader = {
  category: string;
  total: number;
  share: number;
} | null;

export type MonthlyComparisonInsight = {
  currentLabel: string;
  previousLabel: string | null;
  currentExpenses: number;
  previousExpenses: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  direction: 'up' | 'down' | 'flat' | 'new';
} | null;

export type ObservationInsight = {
  title: string;
  detail: string;
  tone: InsightTone;
};

export type InsightsDigest = {
  topCategory: SpendingLeader;
  monthlyComparison: MonthlyComparisonInsight;
  largestExpense: Transaction | null;
  observations: ObservationInsight[];
};

type MonthlySnapshot = {
  label: string;
  expenses: number;
};

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function parseTransactionDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function buildMonthlyExpenseSnapshots(transactions: Transaction[]) {
  const monthlyTotals = new Map<
    string,
    { year: number; month: number; expenses: number }
  >();

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const date = parseTransactionDate(transaction.date);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const key = `${year}-${month}`;
      const current = monthlyTotals.get(key) ?? {
        year,
        month,
        expenses: 0,
      };

      current.expenses += transaction.amount;
      monthlyTotals.set(key, current);
    });

  return Array.from(monthlyTotals.values())
    .sort((left, right) =>
      left.year === right.year ? left.month - right.month : left.year - right.year,
    )
    .map<MonthlySnapshot>((snapshot) => ({
      label: monthYearFormatter.format(
        new Date(Date.UTC(snapshot.year, snapshot.month, 1)),
      ),
      expenses: snapshot.expenses,
    }));
}

function getTopSpendingCategory(transactions: Transaction[]): SpendingLeader {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense',
  );

  if (expenseTransactions.length === 0) {
    return null;
  }

  const totalExpenses = expenseTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  const totalsByCategory = expenseTransactions.reduce<Map<string, number>>(
    (accumulator, transaction) => {
      accumulator.set(
        transaction.category,
        (accumulator.get(transaction.category) ?? 0) + transaction.amount,
      );
      return accumulator;
    },
    new Map(),
  );

  const [category, total] = Array.from(totalsByCategory.entries()).sort(
    (left, right) => right[1] - left[1],
  )[0];

  return {
    category,
    total,
    share: Math.round((total / totalExpenses) * 100),
  };
}

function getMonthlyComparison(
  transactions: Transaction[],
): MonthlyComparisonInsight {
  const snapshots = buildMonthlyExpenseSnapshots(transactions);

  if (snapshots.length === 0) {
    return null;
  }

  const current = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];

  if (!previous) {
    return {
      currentLabel: current.label,
      previousLabel: null,
      currentExpenses: current.expenses,
      previousExpenses: null,
      changeAmount: null,
      changePercent: null,
      direction: 'new',
    };
  }

  const changeAmount = current.expenses - previous.expenses;
  const changePercent =
    previous.expenses === 0
      ? null
      : Math.round((changeAmount / previous.expenses) * 100);

  return {
    currentLabel: current.label,
    previousLabel: previous.label,
    currentExpenses: current.expenses,
    previousExpenses: previous.expenses,
    changeAmount,
    changePercent,
    direction:
      changeAmount === 0 ? 'flat' : changeAmount > 0 ? 'up' : 'down',
  };
}

function getLargestExpense(transactions: Transaction[]) {
  return transactions
    .filter((transaction) => transaction.type === 'expense')
    .sort((left, right) => right.amount - left.amount)[0] ?? null;
}

function buildObservations(transactions: Transaction[]): ObservationInsight[] {
  if (transactions.length === 0) {
    return [];
  }

  const summary = getSummaryMetrics(transactions);
  const topCategory = getTopSpendingCategory(transactions);
  const monthlyComparison = getMonthlyComparison(transactions);
  const largestExpense = getLargestExpense(transactions);

  const observations: ObservationInsight[] = [];

  observations.push(
    summary.net >= 0
      ? {
          title: 'Cash flow stays in the green',
          detail: `Income exceeds expenses by ${currencyFormatter.format(
            summary.net,
          )} across the tracked activity window.`,
          tone: 'positive',
        }
      : {
          title: 'Spending has moved ahead of income',
          detail: `Expenses are ahead of income by ${currencyFormatter.format(
            Math.abs(summary.net),
          )} across the tracked activity window.`,
          tone: 'caution',
        },
  );

  if (topCategory) {
    observations.push({
      title: `${topCategory.category} is the biggest expense bucket`,
      detail: `${currencyFormatter.format(topCategory.total)} sits in this category, representing ${topCategory.share}% of all expenses.`,
      tone: topCategory.share >= 35 ? 'caution' : 'neutral',
    });
  }

  if (monthlyComparison) {
    if (monthlyComparison.direction === 'up') {
      observations.push({
        title: 'Expense momentum increased in the latest month',
        detail: `${monthlyComparison.currentLabel} closed ${currencyFormatter.format(
          monthlyComparison.changeAmount ?? 0,
        )} above ${monthlyComparison.previousLabel}.`,
        tone: 'caution',
      });
    } else if (monthlyComparison.direction === 'down') {
      observations.push({
        title: 'Latest month spending eased',
        detail: `${monthlyComparison.currentLabel} landed ${currencyFormatter.format(
          Math.abs(monthlyComparison.changeAmount ?? 0),
        )} below ${monthlyComparison.previousLabel}.`,
        tone: 'positive',
      });
    } else if (monthlyComparison.direction === 'flat') {
      observations.push({
        title: 'Monthly expense pace is stable',
        detail: `${monthlyComparison.currentLabel} matched ${monthlyComparison.previousLabel} at nearly the same expense level.`,
        tone: 'neutral',
      });
    } else {
      observations.push({
        title: 'Only one expense month is tracked so far',
        detail: `${monthlyComparison.currentLabel} is the first expense month in the current dataset.`,
        tone: 'neutral',
      });
    }
  }

  if (largestExpense) {
    observations.push({
      title: 'One transaction stands out as the largest expense',
      detail: `${largestExpense.description} is the largest single outflow at ${currencyFormatter.format(
        largestExpense.amount,
      )}.`,
      tone: largestExpense.amount >= 1000 ? 'caution' : 'neutral',
    });
  }

  return observations.slice(0, 4);
}

export function buildInsightsDigest(transactions: Transaction[]): InsightsDigest {
  return {
    topCategory: getTopSpendingCategory(transactions),
    monthlyComparison: getMonthlyComparison(transactions),
    largestExpense: getLargestExpense(transactions),
    observations: buildObservations(transactions),
  };
}
