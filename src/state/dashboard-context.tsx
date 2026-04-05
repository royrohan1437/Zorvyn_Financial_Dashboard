import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useReducer,
} from 'react';
import { mockTransactions } from '../data/mock-transactions';
import type { DashboardState, Role, Transaction } from '../types/finance';

type DashboardAction =
  | { type: 'set-role'; payload: Role }
  | { type: 'set-transactions'; payload: Transaction[] };

type DashboardContextValue = DashboardState & {
  dispatch: Dispatch<DashboardAction>;
};

const initialState: DashboardState = {
  transactions: mockTransactions,
  selectedRole: 'viewer',
};

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
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

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
