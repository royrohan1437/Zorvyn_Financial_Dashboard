export type TransactionType = 'income' | 'expense';

export type Role = 'viewer' | 'admin';
export type ThemeMode = 'light' | 'dark';

export const transactionCategories = [
  'Salary',
  'Freelance',
  'Food',
  'Housing',
  'Transport',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Savings',
] as const;

export type TransactionCategory = (typeof transactionCategories)[number];

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
};

export type DashboardState = {
  transactions: Transaction[];
  selectedRole: Role;
  selectedTheme: ThemeMode;
};
