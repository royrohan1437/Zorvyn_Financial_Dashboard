import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../types/finance';
import { transactionCategories } from '../types/finance';
import { currencyFormatter } from './finance';

export type TransactionFilterType = 'all' | TransactionType;
export type TransactionCategoryFilter = 'all' | TransactionCategory;
export type TransactionSortOption = 'latest' | 'oldest' | 'highest' | 'lowest';
export type TransactionEditorMode = 'create' | 'edit';

export type TransactionDraft = {
  date: string;
  description: string;
  amount: string;
  category: TransactionCategory;
  type: TransactionType;
};

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

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
  if (transactions.length === 0) {
    return [...transactionCategories];
  }

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

export function createEmptyTransactionDraft(): TransactionDraft {
  return {
    date: getTodayDateInputValue(),
    description: '',
    amount: '',
    category: 'Food',
    type: 'expense',
  };
}

export function createDraftFromTransaction(
  transaction: Transaction,
): TransactionDraft {
  return {
    date: transaction.date,
    description: transaction.description,
    amount: String(transaction.amount),
    category: transaction.category,
    type: transaction.type,
  };
}

export function validateTransactionDraft(draft: TransactionDraft) {
  if (!draft.description.trim()) {
    return 'Add a short description before saving.';
  }

  if (!draft.date) {
    return 'Choose a transaction date.';
  }

  if (!transactionCategories.includes(draft.category)) {
    return 'Select a valid category.';
  }

  if (draft.type !== 'income' && draft.type !== 'expense') {
    return 'Select whether this is income or expense.';
  }

  const amount = Number(draft.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Enter an amount greater than zero.';
  }

  return null;
}

export function buildTransactionFromDraft(
  draft: TransactionDraft,
  transactionId: string,
): Transaction {
  return {
    id: transactionId,
    date: draft.date,
    description: draft.description.trim(),
    amount: Number(draft.amount),
    category: draft.category,
    type: draft.type,
  };
}

export function generateTransactionId() {
  return `txn-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
