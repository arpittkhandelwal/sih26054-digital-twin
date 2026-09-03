/**
 * HealthGauge.jsx
 * ===============
 * Circular health gauge showing the engine health index (0–100).
 *
 * Props:
 *   telemetry  — latest telemetry object (used for raw value display)
 *   score      — health score 0–100 (from /api/alerts/health-index or derived)
 *   status     — "nominal" | "degraded" | "critical"
 *
 * TODO (Front): replace the SVG arc with a proper gauge library or
 * animated Recharts RadialBarChart when polishing the UI.
 */

import React from 'react'

const STATUS_COLORS = {
  nominal:  '#10b981',
  degraded: '#f59e0b',
  critical: '#ef4444',
}

export default function HealthGauge({ telemetry, score = 100, status = 'nominal' }) {
  const color = STATUS_COLORS[status] ?? '#3b82f6'

  // SVG arc math for a simple half-circle gauge
  const pct = Math.max(0, Math.min(100, score)) / 100
  const r = 60
  const cx = 80
  const cy = 80
  const startAngle = -Math.PI
  const endAngle = 0
  const angle = startAngle + pct * (endAngle - startAngle)
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(angle)
  const y2 = cy + r * Math.sin(angle)
  const largeArc = pct > 0.5 ? 1 : 0

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">Engine Health</h2>

      <div className="flex flex-col items-center">
        <svg width="160" height="90" viewBox="0 0 160 90">
          {/* Background arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#1f2937"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Foreground arc */}
          {pct > 0 && (
            <path
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
            />
          )}
          {/* Score text */}
          <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize="22" fontWeight="700">
            {Math.round(score)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="10">
            / 100
          </text>
        </svg>

        <span
          className="mt-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
          style={{ background: `${color}22`, color }}
        >
          {status}
        </span>
      </div>

      {/* Raw sensor snapshot */}
      {telemetry && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>RPM</span>       <span className="text-slate-200 text-right">{telemetry.rpm?.toFixed(0)}</span>
          <span>EGT</span>       <span className="text-slate-200 text-right">{telemetry.egt?.toFixed(1)} °C</span>
          <span>CHT</span>       <span className="text-slate-200 text-right">{telemetry.cht?.toFixed(1)} °C</span>
          <span>Oil P</span>     <span className="text-slate-200 text-right">{telemetry.oil_pressure?.toFixed(2)} bar</span>
          <span>Fuel Flow</span> <span className="text-slate-200 text-right">{telemetry.fuel_flow?.toFixed(1)} L/h</span>
          <span>Vibration</span> <span className="text-slate-200 text-right">{telemetry.vibration?.toFixed(3)} g</span>
        </div>
      )}
    </div>
  )
}
