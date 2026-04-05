import { startTransition } from 'react';
import { DashboardHeader } from './components/dashboard-header';
import { BalanceTrendChart } from './components/balance-trend-chart';
import { InsightsSection } from './components/insights-section';
import { OverviewCard } from './components/overview-card';
import { SpendingBreakdownChart } from './components/spending-breakdown-chart';
import { TransactionsSection } from './components/transactions-section';
import { useDashboard } from './state/dashboard-context';
import {
  buildBalanceTrend,
  buildSpendingBreakdown,
  currencyFormatter,
  getSummaryMetrics,
  getTransactionWindowLabel,
} from './utils/finance';

function App() {
  const { dispatch, selectedRole, selectedTheme, transactions } = useDashboard();
  const summary = getSummaryMetrics(transactions);
  const balanceTrend = buildBalanceTrend(transactions, summary.openingBalance);
  const spendingBreakdown = buildSpendingBreakdown(transactions);
  const timeWindowLabel = getTransactionWindowLabel(transactions);

  function handleThemeToggle() {
    dispatch({
      type: 'set-theme',
      payload: selectedTheme === 'light' ? 'dark' : 'light',
    });
  }

  function handleRoleChange(nextRole: 'viewer' | 'admin') {
    startTransition(() => {
      dispatch({
        type: 'set-role',
        payload: nextRole,
      });
    });
  }

  return (
    <div className="app-shell">
      <div className="app-shell__gradient" />
      <DashboardHeader
        currentRole={selectedRole}
        currentTheme={selectedTheme}
        onRoleChange={handleRoleChange}
        onThemeToggle={handleThemeToggle}
        timeWindowLabel={timeWindowLabel}
      />

      <main className="dashboard-layout">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Financial overview</p>
            <h1>Stay ahead of your cash flow with one focused dashboard.</h1>
            <p className="hero-copy">
              This dashboard combines live summary metrics, trend views,
              role-aware transaction workflows, and insight signals generated
              from one shared application state.
            </p>
          </div>

          <div className="hero-panel__highlight">
            <span className="badge badge--success">Healthy run rate</span>
            <p className="hero-panel__value">
              {currencyFormatter.format(summary.net)}
            </p>
            <p className="hero-panel__meta">
              Net movement across {timeWindowLabel.toLowerCase()}
            </p>
          </div>
        </section>

        <section className="summary-grid" aria-label="Financial summary">
          <OverviewCard
            label="Total balance"
            value={currencyFormatter.format(summary.totalBalance)}
            delta={`${summary.balanceChange >= 0 ? '+' : ''}${currencyFormatter.format(
              summary.balanceChange,
            )}`}
            tone="neutral"
            description="Opening balance plus all tracked movement."
          />
          <OverviewCard
            label="Income"
            value={currencyFormatter.format(summary.income)}
            delta={`${summary.incomeShare}% of activity`}
            tone="positive"
            description="All incoming cash across salary, freelance, and refunds."
          />
          <OverviewCard
            label="Expenses"
            value={currencyFormatter.format(summary.expenses)}
            delta={`${summary.expenseShare}% of activity`}
            tone="negative"
            description="Tracked outflow grouped for rapid pattern recognition."
          />
        </section>

        <section className="chart-grid" aria-label="Overview visualizations">
          <BalanceTrendChart
            data={balanceTrend}
            currentBalance={summary.totalBalance}
          />
          <SpendingBreakdownChart data={spendingBreakdown} />
        </section>

        <InsightsSection transactions={transactions} />

        <TransactionsSection transactions={transactions} />
      </main>
    </div>
  );
}

export default App;
