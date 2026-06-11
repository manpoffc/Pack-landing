/**
 * DailyBars — pure server component.
 * Renders a 30-bar inline bar chart showing daily redemption counts.
 * No charting library — uses flex + inline styles for bar heights.
 */

type DayRow = { day: string; redemptions: number };

interface DailyBarsProps {
  rows: DayRow[];
}

export default function DailyBars({ rows }: DailyBarsProps) {
  const max = Math.max(...rows.map((r) => r.redemptions), 0);

  return (
    <div
      className="flex items-end gap-[2px]"
      style={{ height: '48px' }}
      aria-label="30-day redemption chart"
    >
      {rows.map((row) => {
        // When max is 0 all bars show a 2px faint baseline.
        const heightPct = max > 0 ? (row.redemptions / max) * 100 : 0;
        const heightPx = Math.max(2, Math.round((heightPct / 100) * 48));

        return (
          <div
            key={row.day}
            title={`${row.day}: ${row.redemptions} redemption${row.redemptions === 1 ? '' : 's'}`}
            className="flex-1 rounded-sm"
            style={{
              height: `${heightPx}px`,
              backgroundColor: heightPx <= 2 ? '#E6D7BC' : '#E08856', // sand baseline vs tangerine
            }}
          />
        );
      })}
    </div>
  );
}
