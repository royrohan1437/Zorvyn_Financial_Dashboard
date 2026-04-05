import {
  CircularBreakdownChart,
  type CircularBreakdownSegment,
} from './circular-breakdown-chart';

type OverviewCardProps = {
  label: string;
  value: number;
  delta: string;
  description: string;
  emptyLabel: string;
  hintText?: string;
  selectedSegmentLabel?: string | null;
  segments: CircularBreakdownSegment[];
  tone: 'neutral' | 'positive' | 'negative';
  onSegmentSelect?: (segment: CircularBreakdownSegment) => void;
};

export function OverviewCard({
  label,
  value,
  delta,
  description,
  emptyLabel,
  hintText,
  selectedSegmentLabel,
  segments,
  tone,
  onSegmentSelect,
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
        hintText={hintText}
        selectedSegmentLabel={selectedSegmentLabel}
        segments={segments}
        onSegmentSelect={onSegmentSelect}
      />

      <p className="overview-card__description">{description}</p>
    </article>
  );
}
