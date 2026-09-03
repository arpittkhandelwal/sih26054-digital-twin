/**
 * FaultAlerts.jsx
 * ===============
 * Scrollable list of recent fault alerts received via WebSocket.
 *
 * Props:
 *   alerts — array of alert objects { timestamp, fault_type, confidence, rul_hours, shap_top_features }
 *
 * TODO (Front): add dismiss / acknowledge button per alert.
 * TODO (Front): link each alert to the mission replay time point.
 */

import React from 'react'

const SEVERITY_COLOR = (conf) => {
  if (conf >= 0.85) return '#ef4444'
  if (conf >= 0.6)  return '#f59e0b'
  return '#3b82f6'
}

function AlertBadge({ faultType, confidence, rulHours, shapFeatures, timestamp }) {
  const color = SEVERITY_COLOR(confidence)
  const time = new Date(timestamp).toLocaleTimeString()

  return (
    <div
      className="rounded-xl p-3 mb-2"
      style={{ background: `${color}11`, border: `1px solid ${color}44` }}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color }}>
          {faultType.replace('_', ' ').toUpperCase()}
        </span>
        <span className="text-xs text-slate-500">{time}</span>
      </div>
      <div className="mt-1 text-xs text-slate-400 flex gap-3">
        <span>Conf: <b className="text-slate-200">{(confidence * 100).toFixed(1)}%</b></span>
        {rulHours != null && (
          <span>RUL: <b className="text-slate-200">{rulHours}h</b></span>
        )}
      </div>
      {shapFeatures?.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {shapFeatures.map((f) => (
            <span
              key={f}
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: '#1f2937', color: '#94a3b8' }}
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FaultAlerts({ alerts = [] }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', maxHeight: '360px' }}>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
        Active Fault Alerts
        {alerts.length > 0 && (
          <span className="ml-2 px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px]">
            {alerts.length}
          </span>
        )}
      </h2>

      <div className="overflow-y-auto flex-1 pr-1">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center mt-8">No active alerts — engine nominal</p>
        ) : (
          alerts.map((a, i) => (
            <AlertBadge
              key={i}
              faultType={a.fault_type}
              confidence={a.confidence}
              rulHours={a.rul_hours}
              shapFeatures={a.shap_top_features}
              timestamp={a.timestamp}
            />
          ))
        )}
      </div>
    </div>
  )
}
