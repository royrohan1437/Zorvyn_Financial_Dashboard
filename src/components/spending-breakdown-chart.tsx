import { currencyFormatter } from '../utils/finance';

type SpendingDatum = {
  category: string;
  total: number;
  share: number;
};

type SpendingBreakdownChartProps = {
  data: SpendingDatum[];
};

const chartColors = ['#0f766e', '#ca8a04', '#b45309', '#334155', '#166534'];

export function SpendingBreakdownChart({
  data,
}: SpendingBreakdownChartProps) {
  const topCategories = data.slice(0, 5);

  return (
    <section className="chart-card">
      <div className="chart-card__header">
        <div>
          <p className="eyebrow">Spending mix</p>
          <h2>Where the money is going</h2>
        </div>
        <p className="chart-card__subtle">By expense category</p>
      </div>

      {topCategories.length === 0 ? (
        <div className="empty-state">
          <p>No spending breakdown yet.</p>
          <span>Expense categories will appear once outflow is tracked.</span>
        </div>
      ) : (
        <div className="category-chart">
          {topCategories.map((item, index) => (
            <article key={item.category} className="category-chart__row">
              <div className="category-chart__labels">
                <div className="category-chart__title">
                  <span
                    className="category-chart__swatch"
                    style={{ backgroundColor: chartColors[index] }}
                    aria-hidden="true"
                  />
                  <strong>{item.category}</strong>
                </div>
                <span>{currencyFormatter.format(item.total)}</span>
              </div>

              <div
                className="category-chart__bar"
                aria-label={`${item.category} takes ${item.share}% of total expenses`}
              >
                <span
                  className="category-chart__bar-fill"
                  style={{
                    width: `${Math.max(item.share, 8)}%`,
                    backgroundColor: chartColors[index],
                  }}
                />
              </div>
              <p className="category-chart__meta">{item.share}% of total expenses</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
