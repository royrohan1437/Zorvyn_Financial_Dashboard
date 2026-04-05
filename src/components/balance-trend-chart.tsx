import { currencyFormatter } from '../utils/finance';

type BalanceDatum = {
  label: string;
  balance: number;
};

type BalanceTrendChartProps = {
  data: BalanceDatum[];
  currentBalance: number;
};

function buildLinePath(data: BalanceDatum[], width: number, height: number) {
  if (data.length === 0) {
    return '';
  }

  const maxBalance = Math.max(...data.map((item) => item.balance));
  const minBalance = Math.min(...data.map((item) => item.balance));
  const range = Math.max(maxBalance - minBalance, 1);

  return data
    .map((item, index) => {
      const x =
        data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const y = height - ((item.balance - minBalance) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function BalanceTrendChart({
  data,
  currentBalance,
}: BalanceTrendChartProps) {
  const chartWidth = 520;
  const chartHeight = 220;
  const linePath = buildLinePath(data, chartWidth, chartHeight);
  const maxBalance =
    data.length === 0 ? 0 : Math.max(...data.map((item) => item.balance));
  const minBalance =
    data.length === 0 ? 0 : Math.min(...data.map((item) => item.balance));
  const range = Math.max(maxBalance - minBalance, 1);

  return (
    <section className="chart-card">
      <div className="chart-card__header">
        <div>
          <p className="eyebrow">Balance trend</p>
          <h2>Monthly closing balance</h2>
        </div>
        <p className="chart-card__headline">
          {currencyFormatter.format(currentBalance)}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <p>No balance trend yet.</p>
          <span>Add transactions to unlock the timeline view.</span>
        </div>
      ) : (
        <>
          <svg
            className="line-chart"
            viewBox={`0 0 ${chartWidth} ${chartHeight + 28}`}
            aria-label="Monthly balance trend chart"
            role="img"
          >
            <defs>
              <linearGradient id="balance-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(22, 163, 74, 0.30)" />
                <stop offset="100%" stopColor="rgba(22, 163, 74, 0.02)" />
              </linearGradient>
            </defs>

            <path
              d={`${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
              fill="url(#balance-fill)"
            />
            <path d={linePath} fill="none" stroke="#166534" strokeWidth="4" />

            {data.map((item, index) => {
              const x =
                data.length === 1
                  ? chartWidth / 2
                  : (index / (data.length - 1)) * chartWidth;
              const y =
                chartHeight - ((item.balance - minBalance) / range) * chartHeight;

              return (
                <g key={item.label}>
                  <circle cx={x} cy={y} r="6" fill="#fefce8" stroke="#166534" />
                  <text x={x} y={chartHeight + 22} textAnchor="middle">
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="chart-card__footnote">
            Ending balances are derived from the opening balance plus each
            month&apos;s net movement.
          </div>
        </>
      )}
    </section>
  );
}
