import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useEffect,
  useContext,
  useReducer,
} from 'react';
import { mockTransactions } from '../data/mock-transactions';
import type {
  DashboardState,
  Role,
  ThemeMode,
  Transaction,
} from '../types/finance';
import { transactionCategories } from '../types/finance';

type DashboardAction =
  | { type: 'set-role'; payload: Role }
  | { type: 'set-theme'; payload: ThemeMode }
  | { type: 'set-transactions'; payload: Transaction[] }
  | { type: 'reset-transactions' };

type DashboardContextValue = DashboardState & {
  dispatch: Dispatch<DashboardAction>;
};

const THEME_STORAGE_KEY = 'zorvyn-dashboard-theme';
const ROLE_STORAGE_KEY = 'zorvyn-dashboard-role';
const TRANSACTIONS_STORAGE_KEY = 'zorvyn-dashboard-transactions';

const initialState: DashboardState = {
  transactions: mockTransactions,
  selectedRole: 'viewer',
  selectedTheme: 'light',
};

function getPreferredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getPreferredRole(): Role {
  if (typeof window === 'undefined') {
    return 'viewer';
  }

  return window.localStorage.getItem(ROLE_STORAGE_KEY) === 'admin'
    ? 'admin'
    : 'viewer';
}

function isValidTransaction(transaction: unknown): transaction is Transaction {
  if (!transaction || typeof transaction !== 'object') {
    return false;
  }

  const candidate = transaction as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(candidate.date) &&
    typeof candidate.description === 'string' &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount) &&
    transactionCategories.includes(
      candidate.category as (typeof transactionCategories)[number],
    ) &&
    (candidate.type === 'income' || candidate.type === 'expense')
  );
}

function getPreferredTransactions(): Transaction[] {
  if (typeof window === 'undefined') {
    return mockTransactions;
  }

  const savedTransactions = window.localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

  if (!savedTransactions) {
    return mockTransactions;
  }

  try {
    const parsedTransactions = JSON.parse(savedTransactions);

    return Array.isArray(parsedTransactions) &&
      parsedTransactions.every(isValidTransaction)
      ? parsedTransactions
      : mockTransactions;
  } catch {
    return mockTransactions;
  }
}

function createInitialState(state: DashboardState): DashboardState {
  return {
    ...state,
    selectedRole: getPreferredRole(),
    selectedTheme: getPreferredTheme(),
    transactions: getPreferredTransactions(),
  };
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case 'set-role':
      return {
        ...state,
        selectedRole: action.payload,
      };
    case 'set-theme':
      return {
        ...state,
        selectedTheme: action.payload,
      };
    case 'set-transactions':
      return {
        ...state,
        transactions: action.payload,
      };
    case 'reset-transactions':
      return {
        ...state,
        transactions: mockTransactions,
      };
    default:
      return state;
  }
}

export function DashboardProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    dashboardReducer,
    initialState,
    createInitialState,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = state.selectedTheme;
    document.documentElement.style.colorScheme = state.selectedTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, state.selectedTheme);
  }, [state.selectedTheme]);

  useEffect(() => {
    window.localStorage.setItem(ROLE_STORAGE_KEY, state.selectedRole);
  }, [state.selectedRole]);

  useEffect(() => {
    window.localStorage.setItem(
      TRANSACTIONS_STORAGE_KEY,
      JSON.stringify(state.transactions),
    );
  }, [state.transactions]);

  return (
    <DashboardContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }

  return context;
}
