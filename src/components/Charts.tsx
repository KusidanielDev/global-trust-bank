"use client";
import { useMemo, useState, useId } from "react";

type Point = { name: string; value: number };

// ---------- helpers ----------
const toFinite = (n: unknown, fallback = 0): number => {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
};
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// ---------- SpendingPie ----------
export function SpendingPie({ data }: { data: Point[] }) {
  // sanitize data
  const safe = useMemo(
    () =>
      (data ?? [])
        .map((d) => ({
          name: String(d?.name ?? "Other"),
          value: Math.max(0, toFinite(d?.value)),
        }))
        .filter((d) => toFinite(d.value) > 0)
        .sort((a, b) => b.value - a.value), // Sort by descending value
    [data]
  );

  const total = useMemo(
    () => safe.reduce((s, d) => s + toFinite(d.value), 0),
    [safe]
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isTouched, setIsTouched] = useState(false);
  const pieShadowId = useId().replace(/:/g, "");

  // early return for no data / zero total
  if (!safe.length || total <= 0) {
    return (
      <div className="w-full relative">
        <svg
          viewBox="0 0 200 200"
          className="mx-auto block"
          style={{ maxWidth: 260 }}
          role="img"
          aria-label="No spending data available"
        >
          <rect x="0" y="0" width="200" height="200" fill="#f8fafc" rx="12" />
          <circle cx="100" cy="100" r="60" fill="#e2e8f0" />
          <text
            x="100"
            y="100"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-500"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            No data available
          </text>
        </svg>
      </div>
    );
  }

  // Professional color palette with better contrast
  const COLORS = [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#10b981", // emerald-500
    "#f97316", // orange-500
    "#ef4444", // red-500
    "#22c55e", // green-500
    "#f59e0b", // amber-500
    "#06b6d4", // cyan-500
    "#6366f1", // indigo-500
  ];

  const radius = 80;
  const cx = 100;
  const cy = 100;
  const donutHoleRadius = 48;

  let cumulative = 0;
  function arcPath(value: number) {
    const val = Math.max(0, toFinite(value));
    const start = (cumulative / total) * 2 * Math.PI;
    cumulative += val;
    const end = (cumulative / total) * 2 * Math.PI;

    const sweep = end - start;
    if (!Number.isFinite(sweep)) return "";

    const largeArc = sweep > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(start),
      y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end),
      y2 = cy + radius * Math.sin(end);

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  cumulative = 0;

  return (
    <div className="w-full relative">
      <svg
        viewBox="0 0 200 200"
        className="mx-auto block"
        style={{ maxWidth: 260 }}
        role="img"
        aria-label="Spending breakdown by category"
      >
        <defs>
          <filter id={pieShadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor="rgba(0,0,0,0.2)"
            />
          </filter>
          <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="rgba(0,0,0,0.1)"
            />
          </filter>
        </defs>
        <title>Spending breakdown by category</title>

        {/* Background circle for better visual hierarchy */}
        <circle cx={cx} cy={cy} r={radius} fill="#f8fafc" />

        {/* Segments */}
        {safe.map((d, i) => {
          const path = arcPath(d.value);
          if (!path) return null;

          const isActive = activeIndex === i;
          const percentage = clamp01((d.value / total) * 100);

          return (
            <g
              key={i}
              transform={isActive ? "scale(1.05) translate(-5,-5)" : undefined}
              filter={isActive ? `url(#${pieShadowId})` : undefined}
            >
              <path
                d={path}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={isActive ? 1 : 0.9}
                stroke="#fff"
                strokeWidth={isActive ? 2 : 1.5}
                style={{
                  transformOrigin: "100px 100px",
                  transition: "transform 0.2s ease, fill-opacity 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={() => {
                  setActiveIndex(i);
                  setIsTouched(true);
                }}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => setIsTouched(true)}
                aria-label={`${d.name}: ${percentage.toFixed(1)}% of spending`}
              >
                <title>{`${d.name}: ${percentage.toFixed(1)}% (${formatCurrency(
                  d.value
                )})`}</title>
              </path>
            </g>
          );
        })}

        {/* Donut hole with subtle shadow */}
        <circle
          cx={cx}
          cy={cy}
          r={donutHoleRadius}
          fill="#fff"
          filter="url(#donutShadow)"
        />

        {/* Center text with better typography */}
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-800"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          {formatCurrency(total)}
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-500"
          style={{ fontSize: 10, fontWeight: 500 }}
        >
          Total
        </text>

        {/* Active segment label */}
        {isTouched && activeIndex !== null && (
          <g transform={`translate(${cx},${cy - donutHoleRadius - 20})`}>
            <rect
              x="-40"
              y="-12"
              width="80"
              height="24"
              rx="4"
              fill="#fff"
              stroke="#e2e8f0"
              className="drop-shadow-sm"
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-800"
              style={{ fontSize: 10, fontWeight: 600 }}
            >
              {safe[activeIndex].name}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ---------- BalanceArea ----------
export function BalanceArea({ data }: { data: Point[] }) {
  // sanitize values
  const safe = useMemo(
    () =>
      (data ?? [])
        .map((d) => ({
          name: String(d?.name ?? ""),
          value: toFinite(d?.value),
        }))
        .map((d, i, arr) => {
          // Only show every nth label if there are many points
          const showLabel =
            arr.length <= 12 || i % Math.ceil(arr.length / 6) === 0;
          return { ...d, showLabel };
        }),
    [data]
  );

  const w = 320;
  const h = 160;
  const pad = 20;
  const axisPad = 8;

  // Generate unique IDs for gradients and filters
  const areaGradientId = useId().replace(/:/g, "");
  const lineGradientId = useId().replace(/:/g, "");
  const pointGlowId = useId().replace(/:/g, "");

  if (safe.length === 0) {
    return (
      <div className="w-full h-40 bg-white rounded-lg shadow-sm flex items-center justify-center">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
          <rect x="0" y="0" width={w} height={h} fill="#f8fafc" rx="12" />
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-500"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            No data available
          </text>
        </svg>
      </div>
    );
  }

  const vals = safe.map((d) => d.value);
  const max = Math.max(...vals, 1);
  const min = Math.min(0, ...vals); // Always include 0 for balance charts
  const range = Math.max(max - min, 1);

  const pts = safe.map((d, i) => {
    const x = pad + (i * (w - 2 * pad)) / Math.max(1, safe.length - 1);
    const y = h - pad - ((toFinite(d.value) - min) * (h - 2 * pad)) / range;
    const yClamped = Number.isFinite(y)
      ? Math.min(h - pad, Math.max(pad, y))
      : h - pad;
    return {
      x,
      y: yClamped,
      value: d.value,
      name: d.name,
      showLabel: d.showLabel,
    };
  });

  const dPath = pts
    .map((p, i) => (i ? `L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`))
    .join(" ");
  const areaPath = `${dPath} L ${pts[pts.length - 1].x} ${h - pad} L ${
    pts[0].x
  } ${h - pad} Z`;

  // Generate Y-axis labels
  const yAxisSteps = 4;
  const yAxisValues = Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
    return min + (range * (yAxisSteps - i)) / yAxisSteps;
  });

  return (
    <div className="w-full h-40 bg-white rounded-lg shadow-sm overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={lineGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <filter id={pointGlowId}>
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="3"
              floodColor="#3b82f6"
              floodOpacity="0.4"
            />
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={w} height={h} fill="#f8fafc" rx="12" />

        {/* Y-axis grid lines and labels */}
        {yAxisValues.map((value, i) => {
          const y = pad + ((h - 2 * pad) * i) / yAxisSteps;
          return (
            <g key={`y-${i}`}>
              <line
                x1={pad}
                y1={y}
                x2={w - pad}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="2 2"
              />
              <text
                x={pad - axisPad}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-500"
                style={{ fontSize: 9 }}
              >
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={pad}
          y1={h - pad}
          x2={w - pad}
          y2={h - pad}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* X-axis labels */}
        {pts.map((p, i) => {
          if (!p.showLabel) return null;
          return (
            <text
              key={`x-${i}`}
              x={p.x}
              y={h - pad + axisPad + 10}
              textAnchor="middle"
              className="fill-slate-500"
              style={{ fontSize: 9 }}
            >
              {p.name}
            </text>
          );
        })}

        {/* Area chart */}
        <path d={areaPath} fill={`url(#${areaGradientId})`} />
        <path
          d={dPath}
          stroke={`url(#${lineGradientId})`}
          fill="none"
          strokeWidth="2"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === pts.length - 1 ? 4 : 0} // Only show circle for last point
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth="1.5"
              filter={i === pts.length - 1 ? `url(#${pointGlowId})` : undefined}
            />
            {i === pts.length - 1 && (
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="fill-slate-800"
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {formatCurrency(p.value)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// CashflowArea with different styling
export function CashflowArea({ data }: { data: Point[] }) {
  // sanitize values
  const safe = useMemo(
    () =>
      (data ?? [])
        .map((d) => ({
          name: String(d?.name ?? ""),
          value: toFinite(d?.value),
        }))
        .map((d, i, arr) => {
          const showLabel =
            arr.length <= 12 || i % Math.ceil(arr.length / 6) === 0;
          return { ...d, showLabel };
        }),
    [data]
  );

  const w = 320;
  const h = 160;
  const pad = 20;
  const axisPad = 8;

  // Generate unique IDs for gradients and filters
  const areaGradientId = useId().replace(/:/g, "");
  const lineGradientId = useId().replace(/:/g, "");
  const pointGlowId = useId().replace(/:/g, "");

  if (safe.length === 0) {
    return (
      <div className="w-full h-40 bg-white rounded-lg shadow-sm flex items-center justify-center">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
          <rect x="0" y="0" width={w} height={h} fill="#f8fafc" rx="12" />
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-500"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            No data available
          </text>
        </svg>
      </div>
    );
  }

  const vals = safe.map((d) => d.value);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = Math.max(max - min, 1);

  const pts = safe.map((d, i) => {
    const x = pad + (i * (w - 2 * pad)) / Math.max(1, safe.length - 1);
    const y = h - pad - ((toFinite(d.value) - min) * (h - 2 * pad)) / range;
    const yClamped = Number.isFinite(y)
      ? Math.min(h - pad, Math.max(pad, y))
      : h - pad;
    return {
      x,
      y: yClamped,
      value: d.value,
      name: d.name,
      showLabel: d.showLabel,
    };
  });

  const dPath = pts
    .map((p, i) => (i ? `L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`))
    .join(" ");
  const areaPath = `${dPath} L ${pts[pts.length - 1].x} ${h - pad} L ${
    pts[0].x
  } ${h - pad} Z`;

  // Generate Y-axis labels
  const yAxisSteps = 4;
  const yAxisValues = Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
    return min + (range * (yAxisSteps - i)) / yAxisSteps;
  });

  return (
    <div className="w-full h-40 bg-white rounded-lg shadow-sm overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={lineGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id={pointGlowId}>
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="3"
              floodColor="#10b981"
              floodOpacity="0.4"
            />
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={w} height={h} fill="#f8fafc" rx="12" />

        {/* Y-axis grid lines and labels */}
        {yAxisValues.map((value, i) => {
          const y = pad + ((h - 2 * pad) * i) / yAxisSteps;
          return (
            <g key={`y-${i}`}>
              <line
                x1={pad}
                y1={y}
                x2={w - pad}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="2 2"
              />
              <text
                x={pad - axisPad}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-500"
                style={{ fontSize: 9 }}
              >
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={pad}
          y1={h - pad}
          x2={w - pad}
          y2={h - pad}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* X-axis labels */}
        {pts.map((p, i) => {
          if (!p.showLabel) return null;
          return (
            <text
              key={`x-${i}`}
              x={p.x}
              y={h - pad + axisPad + 10}
              textAnchor="middle"
              className="fill-slate-500"
              style={{ fontSize: 9 }}
            >
              {p.name}
            </text>
          );
        })}

        {/* Zero baseline for cashflow */}
        {min < 0 && (
          <line
            x1={pad}
            y1={h - pad - ((0 - min) * (h - 2 * pad)) / range}
            x2={w - pad}
            y2={h - pad - ((0 - min) * (h - 2 * pad)) / range}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4 2"
            opacity="0.6"
          />
        )}

        {/* Area chart */}
        <path d={areaPath} fill={`url(#${areaGradientId})`} />
        <path
          d={dPath}
          stroke={`url(#${lineGradientId})`}
          fill="none"
          strokeWidth="2"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === pts.length - 1 ? 4 : 0}
              fill={p.value >= 0 ? "#10b981" : "#ef4444"}
              stroke="#fff"
              strokeWidth="1.5"
              filter={i === pts.length - 1 ? `url(#${pointGlowId})` : undefined}
            />
            {i === pts.length - 1 && (
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className={p.value >= 0 ? "fill-emerald-800" : "fill-red-800"}
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {formatCurrency(p.value)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
