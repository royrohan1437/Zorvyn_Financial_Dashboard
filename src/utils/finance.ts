import { openingBalance } from '../data/mock-transactions';
import type { Transaction } from '../types/finance';

type MonthlyTotals = {
  year: number;
  month: number;
  label: string;
  income: number;
  expenses: number;
  balance: number;
};

type SpendingSlice = {
  category: string;
  total: number;
  share: number;
};

export type CircularBreakdownSlice = {
  label: string;
  value: number;
  share: number;
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
});

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export const currencyFormatter = currency;

function parseTransactionDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function getSummaryMetrics(transactions: Transaction[]) {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const net = income - expenses;
  const totalBalance = openingBalance + net;
  const activityBase = income + expenses;

  return {
    openingBalance,
    income,
    expenses,
    net,
    totalBalance,
    balanceChange: net,
    incomeShare: activityBase === 0 ? 0 : Math.round((income / activityBase) * 100),
    expenseShare:
      activityBase === 0 ? 0 : Math.round((expenses / activityBase) * 100),
  };
}

export function buildBalanceTrend(
  transactions: Transaction[],
  initialBalance: number,
): MonthlyTotals[] {
  if (transactions.length === 0) {
    return [];
  }

  const monthlyAccumulator = new Map<
    string,
    Omit<MonthlyTotals, 'balance' | 'label'>
  >();

  [...transactions]
    .sort((left, right) => left.date.localeCompare(right.date))
    .forEach((transaction) => {
      const date = parseTransactionDate(transaction.date);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const key = `${year}-${month}`;
      const current = monthlyAccumulator.get(key) ?? {
        year,
        month,
        income: 0,
        expenses: 0,
      };

      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expenses += transaction.amount;
      }

      monthlyAccumulator.set(key, current);
    });

  let runningBalance = initialBalance;

  return Array.from(monthlyAccumulator.values())
    .sort((left, right) =>
      left.year === right.year ? left.month - right.month : left.year - right.year,
    )
    .map((monthTotals) => {
      runningBalance += monthTotals.income - monthTotals.expenses;

      return {
        ...monthTotals,
        label: monthFormatter.format(
          new Date(Date.UTC(monthTotals.year, monthTotals.month, 1)),
        ),
        balance: runningBalance,
      };
    });
}

export function buildSpendingBreakdown(
  transactions: Transaction[],
): SpendingSlice[] {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense',
  );

  if (expenseTransactions.length === 0) {
    return [];
  }

  const totalsByCategory = expenseTransactions.reduce<Map<string, number>>(
    (accumulator, transaction) => {
      const current = accumulator.get(transaction.category) ?? 0;
      accumulator.set(transaction.category, current + transaction.amount);
      return accumulator;
    },
    new Map(),
  );

  const totalExpenses = expenseTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  return Array.from(totalsByCategory.entries())
    .map(([category, total]) => ({
      category,
      total,
      share: Math.round((total / totalExpenses) * 100),
    }))
    .sort((left, right) => right.total - left.total);
}

function buildCategoryBreakdown(
  transactions: Transaction[],
  type: 'income' | 'expense',
): CircularBreakdownSlice[] {
  const filteredTransactions = transactions.filter(
    (transaction) => transaction.type === type,
  );

  if (filteredTransactions.length === 0) {
    return [];
  }

  const totalsByCategory = filteredTransactions.reduce<Map<string, number>>(
    (accumulator, transaction) => {
      accumulator.set(
        transaction.category,
        (accumulator.get(transaction.category) ?? 0) + transaction.amount,
      );
      return accumulator;
    },
    new Map(),
  );

  const totalValue = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  return Array.from(totalsByCategory.entries())
    .map(([label, value]) => ({
      label,
      value,
      share: Math.round((value / totalValue) * 100),
    }))
    .sort((left, right) => right.value - left.value);
}

export function buildIncomeBreakdown(transactions: Transaction[]) {
  return buildCategoryBreakdown(transactions, 'income');
}

export function buildExpenseBreakdown(transactions: Transaction[]) {
  return buildCategoryBreakdown(transactions, 'expense');
}

export function buildBalanceComposition(transactions: Transaction[]) {
  const summary = getSummaryMetrics(transactions);
  const segments = [
    {
      label: 'Opening balance',
      value: summary.openingBalance,
    },
    {
      label: 'Income added',
      value: summary.income,
    },
    {
      label: 'Expenses paid',
      value: summary.expenses,
    },
  ].filter((segment) => segment.value > 0);

  const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (totalValue === 0) {
    return [];
  }

  return segments.map((segment) => ({
    ...segment,
    share: Math.round((segment.value / totalValue) * 100),
  }));
}

export function getTransactionWindowLabel(transactions: Transaction[]) {
  if (transactions.length === 0) {
    return 'No activity';
  }

  const sortedTransactions = [...transactions].sort((left, right) =>
    left.date.localeCompare(right.date),
  );

  const firstDate = parseTransactionDate(sortedTransactions[0].date);
  const lastDate = parseTransactionDate(
    sortedTransactions[sortedTransactions.length - 1].date,
  );

  return `${monthYearFormatter.format(firstDate)} to ${monthYearFormatter.format(
    lastDate,
  )}`;
}
