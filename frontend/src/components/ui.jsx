import { minutesToLabel, percentageLabel, withAlpha } from "../lib/api";

export function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 shadow-lg shadow-amber-950/20">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-teal-400 text-sm font-black text-slate-950">
          CT
        </div>
      </div>
      {!compact && (
        <div>
          <div className="text-lg font-black tracking-tight text-white">CourseTrack</div>
          <div className="text-xs uppercase tracking-[0.26em] text-slate-400">
            learn • measure • improve
          </div>
        </div>
      )}
    </div>
  );
}

export function MetricCard({ item }) {
  return (
    <div className="metric-chip">
      <div className="text-sm text-slate-400">{item.label}</div>
      <div className="mt-3 text-3xl font-black text-white">{item.value}</div>
      <div className="mt-2 text-sm text-slate-500">{item.hint}</div>
    </div>
  );
}

export function ActivityChart({ title, subtitle, points }) {
  const maxValue = Math.max(...points.map((point) => point.minutes || 0), 1);

  return (
    <div className="surface-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Activity</div>
          <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
          <p className="mt-1 max-w-md text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          Last 7 days
        </div>
      </div>

      <div className="mt-8 grid min-h-[250px] grid-cols-7 items-end gap-3">
        {points.map((point) => {
          const height = `${Math.max((point.minutes / maxValue) * 100, 8)}%`;
          return (
            <div key={point.label} className="chart-column">
              <div className="flex min-h-[200px] w-full items-end rounded-[28px] border border-white/6 bg-slate-950/55 px-2 py-3">
                <div className="chart-column-fill" style={{ height }} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {point.label}
              </div>
              <div className="text-sm font-semibold text-slate-200">
                {minutesToLabel(point.minutes)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressRing({ value, accent = "#14b8a6" }) {
  const size = 164;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-black text-white">{percentageLabel(value)}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">
          completed
        </div>
      </div>
    </div>
  );
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function InsightCard({ title, value, description }) {
  return (
    <div className="surface-card p-5">
      <div className="eyebrow">{title}</div>
      <div className="mt-3 text-xl font-black text-white">{value}</div>
      <p className="mt-3 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="glass-panel px-6 py-10 text-center">
      <h3 className="text-2xl font-black text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function CourseBadge({ text, accent }) {
  return (
    <span
      className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]"
      style={{
        background: withAlpha(accent, "1a"),
        color: accent,
        borderColor: withAlpha(accent, "40"),
      }}
    >
      {text}
    </span>
  );
}
