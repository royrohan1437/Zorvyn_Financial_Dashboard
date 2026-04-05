import type { Transaction } from '../types/finance';
import { currencyFormatter } from '../utils/finance';
import { buildInsightsDigest } from '../utils/insights';
import { formatTransactionDateLabel } from '../utils/transactions';

type InsightsSectionProps = {
  transactions: Transaction[];
};

export function InsightsSection({ transactions }: InsightsSectionProps) {
  const insights = buildInsightsDigest(transactions);
  const comparison = insights.monthlyComparison;

  const comparisonTone =
    comparison?.direction === 'up'
      ? 'caution'
      : comparison?.direction === 'down'
        ? 'positive'
        : 'neutral';

  const comparisonValue =
    comparison?.changeAmount == null
      ? comparison
        ? currencyFormatter.format(comparison.currentExpenses)
        : 'No expense data'
      : `${comparison.changeAmount >= 0 ? '+' : '-'}${currencyFormatter.format(
          Math.abs(comparison.changeAmount),
        )}`;

  const comparisonMeta =
    comparison == null
      ? 'Add expense activity to unlock month-over-month comparisons.'
      : comparison.previousLabel == null
        ? `${comparison.currentLabel} is the first tracked expense month.`
        : `${comparison.currentLabel} vs ${comparison.previousLabel}`;

  return (
    <section
      className="insights-panel"
      aria-labelledby="insights-section-title"
    >
      <div className="insights-panel__header">
        <div>
          <p className="eyebrow">Insights</p>
          <h2 id="insights-section-title">What the numbers are signaling</h2>
          <p className="insights-panel__copy">
            These signals are derived from the same transaction state powering
            the dashboard, so they react immediately when records change.
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <p>No insights available yet.</p>
          <span>Add transactions to unlock category, monthly, and anomaly signals.</span>
        </div>
      ) : (
        <>
          <div className="insights-grid">
            <article className="insight-card insight-card--spotlight">
              <span className="insight-card__label">Highest spending category</span>
              <strong className="insight-card__value">
                {insights.topCategory?.category ?? 'No expenses yet'}
              </strong>
              <p className="insight-card__meta">
                {insights.topCategory
                  ? currencyFormatter.format(insights.topCategory.total)
                  : 'No category data'}
              </p>
              <p className="insight-card__subtext">
                {insights.topCategory
                  ? `${insights.topCategory.share}% of all expenses`
                  : 'Expense categories will appear once outflow is recorded.'}
              </p>
            </article>

            <article className={`insight-card insight-card--${comparisonTone}`}>
              <span className="insight-card__label">Monthly comparison</span>
              <strong className="insight-card__value">{comparisonValue}</strong>
              <p className="insight-card__meta">{comparisonMeta}</p>
              <p className="insight-card__subtext">
                {comparison?.changePercent == null || comparison.previousLabel == null
                  ? 'Month-over-month movement will sharpen as more periods are tracked.'
                  : `${Math.abs(comparison.changePercent)}% ${
                      comparison.changePercent > 0
                        ? 'higher'
                        : comparison.changePercent < 0
                          ? 'lower'
                          : 'change'
                    } expense volume`}
              </p>
            </article>

            <article className="insight-card">
              <span className="insight-card__label">Largest single expense</span>
              <strong className="insight-card__value insight-card__value--compact">
                {insights.largestExpense?.description ?? 'No expense transactions yet'}
              </strong>
              <p className="insight-card__meta">
                {insights.largestExpense
                  ? currencyFormatter.format(insights.largestExpense.amount)
                  : 'No outflow to analyze'}
              </p>
              <p className="insight-card__subtext">
                {insights.largestExpense
                  ? `${formatTransactionDateLabel(insights.largestExpense.date)} in ${
                      insights.largestExpense.category
                    }`
                  : 'Largest-expense detection starts once expense records exist.'}
              </p>
            </article>
          </div>

          <div className="observation-list">
            {insights.observations.map((observation) => (
              <article
                key={observation.title}
                className={`observation-card observation-card--${observation.tone}`}
              >
                <p className="observation-card__title">{observation.title}</p>
                <p className="observation-card__detail">{observation.detail}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
