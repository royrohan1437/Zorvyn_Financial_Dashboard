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

type DashboardAction =
  | { type: 'set-role'; payload: Role }
  | { type: 'set-theme'; payload: ThemeMode }
  | { type: 'set-transactions'; payload: Transaction[] };

type DashboardContextValue = DashboardState & {
  dispatch: Dispatch<DashboardAction>;
};

const THEME_STORAGE_KEY = 'zorvyn-dashboard-theme';

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

function createInitialState(state: DashboardState): DashboardState {
  return {
    ...state,
    selectedTheme: getPreferredTheme(),
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
