import { useState } from 'react';
import { useCountUp } from '../hooks/use-count-up';
import { currencyFormatter, type CircularBreakdownSlice } from '../utils/finance';

export type CircularBreakdownSegment = CircularBreakdownSlice & {
  color: string;
};

type CircularBreakdownChartProps = {
  centerLabel: string;
  centerValue: number;
  emptyLabel: string;
  hintText?: string;
  selectedSegmentLabel?: string | null;
  segments: CircularBreakdownSegment[];
  onSegmentSelect?: (segment: CircularBreakdownSegment) => void;
};

const chartSize = 208;
const strokeWidth = 18;
const radius = 72;
const circumference = 2 * Math.PI * radius;
const centerCoordinate = chartSize / 2;

export function CircularBreakdownChart({
  centerLabel,
  centerValue,
  emptyLabel,
  hintText,
  selectedSegmentLabel,
  segments,
  onSegmentSelect,
}: CircularBreakdownChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeSegment =
    activeIndex != null && activeIndex >= 0 && activeIndex < segments.length
      ? segments[activeIndex]
      : null;
  const hasActiveSegment = activeSegment != null;
  const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0);
  const animatedCenterValue = useCountUp(centerValue);
  const displayedLabel = activeSegment?.label ?? centerLabel;
  const displayedValue =
    activeSegment != null
      ? currencyFormatter.format(activeSegment.value)
      : currencyFormatter.format(animatedCenterValue);
  const centerKey = activeSegment?.label ?? `default-${centerLabel}`;

  let cumulativeOffset = 0;

  function handleSegmentSelect(index: number) {
    if (!onSegmentSelect) {
      setActiveIndex(index);
      return;
    }

    onSegmentSelect(segments[index]);
  }

  return (
    <div className="radial-chart">
      <div className="radial-chart__visual">
        <svg
          className="radial-chart__svg"
          viewBox={`0 0 ${chartSize} ${chartSize}`}
          role="img"
          aria-label={`${centerLabel} breakdown chart`}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <circle
            className="radial-chart__track"
            cx={centerCoordinate}
            cy={centerCoordinate}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
          />

          {segments.map((segment, index) => {
            const segmentLength =
              totalValue === 0 ? 0 : (segment.value / totalValue) * circumference;
            const strokeDasharray = `${segmentLength} ${
              circumference - segmentLength
            }`;
            const strokeDashoffset = -cumulativeOffset;
            cumulativeOffset += segmentLength;
            const isSelected = selectedSegmentLabel === segment.label;
            const isActive = index === activeIndex;
            const isDimmed = hasActiveSegment && !isActive;

            return (
              <circle
                key={segment.label}
                className={`radial-chart__segment${
                  isActive ? ' radial-chart__segment--active' : ''
                }${isDimmed ? ' radial-chart__segment--dimmed' : ''}${
                  isSelected ? ' radial-chart__segment--selected' : ''
                }`}
                cx={centerCoordinate}
                cy={centerCoordinate}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={
                  isActive || isSelected ? strokeWidth + 2 : strokeWidth
                }
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${centerCoordinate} ${centerCoordinate})`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                onClick={() => handleSegmentSelect(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSegmentSelect(index);
                  }
                }}
                role={onSegmentSelect ? 'button' : undefined}
                aria-pressed={onSegmentSelect ? isSelected : undefined}
                tabIndex={0}
              >
                <title>
                  {segment.label}: {currencyFormatter.format(segment.value)}
                </title>
              </circle>
            );
          })}
        </svg>

        <div className="radial-chart__center">
          <div key={centerKey} className="radial-chart__center-copy">
            <span className="radial-chart__center-label">{displayedLabel}</span>
            <strong className="radial-chart__center-value">{displayedValue}</strong>
            {activeSegment ? (
              <span className="radial-chart__center-meta">
                {activeSegment.share}%
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="radial-chart__hint">
        {segments.length > 0
          ? hintText ?? 'Hover a slice to preview its category amount in the center.'
          : emptyLabel}
      </div>

      {segments.length > 0 ? (
        <div className="radial-chart__legend">
          {segments.map((segment, index) => {
            const isActive = index === activeIndex;
            const isSelected = selectedSegmentLabel === segment.label;
            const isDimmed = hasActiveSegment && !isActive;

            return (
              <button
                key={segment.label}
                type="button"
                className={`radial-chart__legend-item${
                  isActive ? ' radial-chart__legend-item--active' : ''
                }${isDimmed ? ' radial-chart__legend-item--dimmed' : ''}${
                  isSelected ? ' radial-chart__legend-item--selected' : ''
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                onClick={() => handleSegmentSelect(index)}
                aria-pressed={onSegmentSelect ? isSelected : undefined}
              >
                <span className="radial-chart__legend-label">
                  <span
                    className="radial-chart__legend-swatch"
                    style={{ backgroundColor: segment.color }}
                    aria-hidden="true"
                  />
                  <span>{segment.label}</span>
                </span>
                <span>{currencyFormatter.format(segment.value)}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
