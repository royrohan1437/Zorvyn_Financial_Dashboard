type OverviewCardProps = {
  label: string;
  value: string;
  delta: string;
  description: string;
  tone: 'neutral' | 'positive' | 'negative';
};

export function OverviewCard({
  label,
  value,
  delta,
  description,
  tone,
}: OverviewCardProps) {
  return (
    <article className={`overview-card overview-card--${tone}`}>
      <div className="overview-card__topline">
        <span>{label}</span>
        <span className="overview-card__delta">{delta}</span>
      </div>

      <p className="overview-card__value">{value}</p>
      <p className="overview-card__description">{description}</p>
    </article>
  );
}
