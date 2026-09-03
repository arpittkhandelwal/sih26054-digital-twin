/**
 * RULChart.jsx
 * ============
 * Line chart of RUL estimates over time, plus a multi-sensor sparkline panel.
 *
 * Props:
 *   history — array of telemetry + RUL objects from the WebSocket ring buffer
 *
 * TODO (Front): add a second Y-axis for anomaly score overlay.
 * TODO (Front): shade the "critical" zone below 50 h RUL in red.
 */

import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const SENSOR_LINES = [
  { key: 'rpm',       color: '#3b82f6', name: 'RPM',       yAxis: 'right' },
  { key: 'egt',       color: '#f59e0b', name: 'EGT (°C)',  yAxis: 'left'  },
  { key: 'cht',       color: '#ef4444', name: 'CHT (°C)',  yAxis: 'left'  },
  { key: 'vibration', color: '#10b981', name: 'Vibration', yAxis: 'right' },
]

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function RULChart({ history = [] }) {
  const data = history.map((d) => ({
    ...d,
    time: formatTime(d.timestamp),
  }))

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
        Live Sensor Trends
      </h2>

      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
          Waiting for telemetry…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis yAxisId="left"  tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            {SENSOR_LINES.map(({ key, color, name, yAxis }) => (
              <Line
                key={key}
                yAxisId={yAxis}
                type="monotone"
                dataKey={key}
                stroke={color}
                dot={false}
                strokeWidth={1.5}
                name={name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* RUL placeholder — TODO: wire to ML service RUL output */}
      <div className="mt-4 flex items-center gap-3">
        <div className="text-xs text-slate-400">Remaining Useful Life (est.)</div>
        <div className="text-2xl font-bold text-blue-400">
          {history.length === 0 ? '—' : '∞'}
          <span className="text-sm font-normal text-slate-500 ml-1">h</span>
        </div>
        <div className="text-xs text-slate-500">(live once ML models are trained)</div>
      </div>
    </div>
  )
}
