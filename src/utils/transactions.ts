import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../types/finance';
import { currencyFormatter } from './finance';

export type TransactionFilterType = 'all' | TransactionType;
export type TransactionCategoryFilter = 'all' | TransactionCategory;
export type TransactionSortOption = 'latest' | 'oldest' | 'highest' | 'lowest';

type TransactionFilters = {
  query: string;
  type: TransactionFilterType;
  category: TransactionCategoryFilter;
  sort: TransactionSortOption;
};

type TransactionSummary = {
  income: number;
  expenses: number;
  net: number;
};

const transactionDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export const transactionSortOptions: Array<{
  label: string;
  value: TransactionSortOption;
}> = [
  { label: 'Latest first', value: 'latest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Highest amount', value: 'highest' },
  { label: 'Lowest amount', value: 'lowest' },
];

function parseTransactionDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatTransactionDateLabel(dateString: string) {
  return transactionDateFormatter.format(parseTransactionDate(dateString));
}

export function formatSignedTransactionAmount(transaction: Transaction) {
  const amount = currencyFormatter.format(transaction.amount);
  return transaction.type === 'income' ? `+${amount}` : `-${amount}`;
}

export function getTransactionCategories(
  transactions: Transaction[],
): TransactionCategory[] {
  return Array.from(new Set(transactions.map((transaction) => transaction.category)))
    .sort((left, right) => left.localeCompare(right)) as TransactionCategory[];
}

export function applyTransactionFilters(
  transactions: Transaction[],
  filters: TransactionFilters,
) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return [...transactions]
    .filter((transaction) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${transaction.description} ${transaction.category} ${transaction.type}`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesType =
        filters.type === 'all' || transaction.type === filters.type;

      const matchesCategory =
        filters.category === 'all' || transaction.category === filters.category;

      return matchesQuery && matchesType && matchesCategory;
    })
    .sort((left, right) => {
      switch (filters.sort) {
        case 'oldest':
          return left.date.localeCompare(right.date);
        case 'highest':
          return right.amount - left.amount || right.date.localeCompare(left.date);
        case 'lowest':
          return left.amount - right.amount || right.date.localeCompare(left.date);
        case 'latest':
        default:
          return right.date.localeCompare(left.date);
      }
    });
}

export function summarizeTransactionActivity(
  transactions: Transaction[],
): TransactionSummary {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    income,
    expenses,
    net: income - expenses,
  };
}
