export type TransactionType = 'income' | 'expense';

export type Role = 'viewer' | 'admin';
export type ThemeMode = 'light' | 'dark';

export type TransactionCategory =
  | 'Salary'
  | 'Freelance'
  | 'Food'
  | 'Housing'
  | 'Transport'
  | 'Entertainment'
  | 'Utilities'
  | 'Healthcare'
  | 'Savings';

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
