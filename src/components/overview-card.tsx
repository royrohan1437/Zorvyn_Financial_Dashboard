import {
  CircularBreakdownChart,
  type CircularBreakdownSegment,
} from './circular-breakdown-chart';

type OverviewCardProps = {
  label: string;
  value: string;
  delta: string;
  description: string;
  emptyLabel: string;
  segments: CircularBreakdownSegment[];
  tone: 'neutral' | 'positive' | 'negative';
};

export function OverviewCard({
  label,
  value,
  delta,
  description,
  emptyLabel,
  segments,
  tone,
}: OverviewCardProps) {
  return (
    <article className={`overview-card overview-card--${tone}`}>
      <div className="overview-card__topline">
        <span>{label}</span>
        <span className="overview-card__delta">{delta}</span>
      </div>

      <CircularBreakdownChart
        centerLabel={label}
        centerValue={value}
        emptyLabel={emptyLabel}
        segments={segments}
      />

      <p className="overview-card__description">{description}</p>
    </article>
  );
}
