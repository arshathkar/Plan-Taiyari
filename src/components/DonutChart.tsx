'use client';

import styles from './DonutChart.module.css';

interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  total: number;
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}

const COLORS = [
  'var(--chart-1, #6366f1)',
  'var(--chart-2, #06b6d4)',
  'var(--chart-3, #f59e0b)',
  'var(--chart-4, #10b981)',
  'var(--chart-5, #ef4444)',
  'var(--chart-6, #8b5cf6)',
  'var(--chart-7, #ec4899)',
  'var(--chart-8, #14b8a6)',
  'var(--chart-9, #f97316)',
  'var(--chart-10, #64748b)',
  'var(--chart-11, #a855f7)',
  'var(--chart-12, #0ea5e9)',
];

export function getChartColor(index: number): string {
  return COLORS[index % COLORS.length];
}

export default function DonutChart({
  slices,
  total,
  centerLabel = '',
  centerValue = '',
  size = 200,
}: DonutChartProps) {
  const radius = 80;
  const strokeWidth = 28;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const viewBox = `0 0 ${radius * 2} ${radius * 2}`;

  const computedSlices = slices.map((slice, idx) => {
    const pct = total > 0 ? slice.value / total : 0;
    const offset = circumference * (1 - pct);
    const prevPcts = slices.slice(0, idx).reduce((s, prev) => s + (total > 0 ? prev.value / total : 0), 0);
    const rotation = prevPcts * 360 - 90;
    return { ...slice, pct, offset, rotation };
  });

  return (
    <div className={styles.container}>
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        className={styles.svg}
        role="img"
        aria-label={`Budget donut chart. ${centerLabel}: ${centerValue}`}
      >
        {/* Background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="var(--glass-border)"
          strokeWidth={strokeWidth}
        />

        {/* Slices */}
        {computedSlices.map(slice => {
          if (slice.pct < 0.005) return null; // Skip tiny slices

          return (
            <circle
              key={slice.id}
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference}`}
              strokeDashoffset={slice.offset}
              transform={`rotate(${slice.rotation} ${radius} ${radius})`}
              className={styles.slice}
            >
              <title>{`${slice.label}: ₹${slice.value.toLocaleString('en-IN')} (${(slice.pct * 100).toFixed(1)}%)`}</title>
            </circle>
          );
        })}

        {/* Center text */}
        {centerLabel && (
          <>
            <text
              x={radius}
              y={radius - 6}
              textAnchor="middle"
              className={styles.centerLabel}
            >
              {centerLabel}
            </text>
            <text
              x={radius}
              y={radius + 14}
              textAnchor="middle"
              className={styles.centerValue}
            >
              {centerValue}
            </text>
          </>
        )}
      </svg>

      {/* Accessible table alternative */}
      <details className={styles.tableDetails}>
        <summary className={styles.tableSummary}>View as table</summary>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {slices.map((slice) => {
              const pct = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0';
              return (
                <tr key={slice.id}>
                  <td>
                    <span
                      className={styles.dot}
                      style={{ background: slice.color }}
                      aria-hidden="true"
                    />
                    {slice.label}
                  </td>
                  <td>₹{slice.value.toLocaleString('en-IN')}</td>
                  <td>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </div>
  );
}
