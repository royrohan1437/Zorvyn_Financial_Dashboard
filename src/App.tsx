import { startTransition, useState } from 'react';
import { DashboardHeader } from './components/dashboard-header';
import { BalanceTrendChart } from './components/balance-trend-chart';
import { InsightsSection } from './components/insights-section';
import { OverviewCard } from './components/overview-card';
import { ScrollToTopButton } from './components/scroll-to-top-button';
import { SpendingBreakdownChart } from './components/spending-breakdown-chart';
import { TransactionsSection } from './components/transactions-section';
import { useDashboard } from './state/dashboard-context';
import { transactionCategories, type TransactionCategory } from './types/finance';
import {
  buildBalanceComposition,
  buildBalanceTrend,
  buildExpenseBreakdown,
  buildIncomeBreakdown,
  buildSpendingBreakdown,
  currencyFormatter,
  getSummaryMetrics,
  getTransactionWindowLabel,
} from './utils/finance';
import type {
  TransactionCategoryFilter,
  TransactionFilterType,
} from './utils/transactions';

const balancePalette = ['#2563eb', '#16a34a', '#d97706'];
const incomePalette = ['#0f766e', '#16a34a', '#0ea5e9', '#0891b2'];
const expensePalette = [
  '#b45309',
  '#dc2626',
  '#475569',
  '#0284c7',
  '#0f766e',
  '#be123c',
];

function assignChartColors<T extends { label: string; value: number; share: number }>(
  segments: T[],
  palette: string[],
) {
  return segments.map((segment, index) => ({
    ...segment,
    color: palette[index % palette.length],
  }));
}

function App() {
  const { dispatch, selectedRole, selectedTheme, transactions } = useDashboard();
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<TransactionFilterType>('all');
  const [selectedTransactionCategory, setSelectedTransactionCategory] =
    useState<TransactionCategoryFilter>('all');
  const summary = getSummaryMetrics(transactions);
  const balanceTrend = buildBalanceTrend(transactions, summary.openingBalance);
  const spendingBreakdown = buildSpendingBreakdown(transactions);
  const balanceComposition = assignChartColors(
    buildBalanceComposition(transactions),
    balancePalette,
  );
  const incomeBreakdown = assignChartColors(
    buildIncomeBreakdown(transactions),
    incomePalette,
  );
  const expenseBreakdown = assignChartColors(
    buildExpenseBreakdown(transactions),
    expensePalette,
  );
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

  function handleTransactionTypeChange(nextType: TransactionFilterType) {
    setSelectedTransactionType(nextType);
  }

  function handleTransactionCategoryChange(nextCategory: TransactionCategoryFilter) {
    setSelectedTransactionCategory(nextCategory);
  }

  function resetTransactionFilters() {
    setSelectedTransactionType('all');
    setSelectedTransactionCategory('all');
  }

  function handleExpenseSegmentSelect(segment: { label: string }) {
    if (!transactionCategories.includes(segment.label as TransactionCategory)) {
      return;
    }

    const nextCategory = segment.label as TransactionCategoryFilter;
    const isSameSelection =
      selectedTransactionType === 'expense' &&
      selectedTransactionCategory === nextCategory;

    setSelectedTransactionType(isSameSelection ? 'all' : 'expense');
    setSelectedTransactionCategory(isSameSelection ? 'all' : nextCategory);
  }

  const selectedExpenseSegmentLabel =
    selectedTransactionType === 'expense' && selectedTransactionCategory !== 'all'
      ? selectedTransactionCategory
      : null;

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
            value={summary.totalBalance}
            delta={`${summary.balanceChange >= 0 ? '+' : ''}${currencyFormatter.format(
              summary.balanceChange,
            )}`}
            emptyLabel="No balance composition yet."
            segments={balanceComposition}
            tone="neutral"
            description="Opening capital, income added, and expenses paid shown in one circular balance view."
          />
          <OverviewCard
            label="Income"
            value={summary.income}
            delta={`${summary.incomeShare}% of activity`}
            emptyLabel="No income categories yet."
            segments={incomeBreakdown}
            tone="positive"
            description="Hover the ring to inspect which income categories contribute the most."
          />
          <OverviewCard
            label="Expenses"
            value={summary.expenses}
            delta={`${summary.expenseShare}% of activity`}
            emptyLabel="No expense categories yet."
            hintText="Hover to preview. Click a category to filter the transactions below."
            selectedSegmentLabel={selectedExpenseSegmentLabel}
            segments={expenseBreakdown}
            tone="negative"
            description="Each expense slice shows how much a category is consuming from total outflow."
            onSegmentSelect={handleExpenseSegmentSelect}
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

        <TransactionsSection
          transactions={transactions}
          selectedCategory={selectedTransactionCategory}
          selectedType={selectedTransactionType}
          onCategoryChange={handleTransactionCategoryChange}
          onResetFilters={resetTransactionFilters}
          onTypeChange={handleTransactionTypeChange}
        />
      </main>

      <ScrollToTopButton />
    </div>
  );
}

export default App;
