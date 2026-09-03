/**
 * App.jsx — Digital Twin Dashboard
 * ==================================
 * Main layout wiring all four dashboard components together.
 * Live data flows in via the useWebSocket hook.
 */

import React, { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import HealthGauge   from './components/HealthGauge'
import FaultAlerts   from './components/FaultAlerts'
import RULChart      from './components/RULChart'
import MissionReplay from './components/MissionReplay'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const { telemetry, telemetryHistory, alerts, connected } = useWebSocket()

  // Health index — polled from REST every 10 s as fallback
  const [healthIndex, setHealthIndex] = useState({ score: 100, status: 'nominal' })

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/alerts/health-index`)
        if (res.ok) setHealthIndex(await res.json())
      } catch { /* backend not ready yet */ }
    }
    poll()
    const id = setInterval(poll, 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-3"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          {/* DRDO-ish logo placeholder */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
               style={{ background: '#1d4ed8', color: '#fff' }}>DT</div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-slate-100">
              SIH26054 — UAV Engine Digital Twin
            </h1>
            <p className="text-[10px] text-slate-500">MALE UAV Aero Piston Engine Monitor · DRDO</p>
          </div>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: connected ? '#10b981' : '#ef4444' }}
          />
          <span className="text-xs text-slate-400">
            {connected ? 'Live' : 'Disconnected'}
          </span>
          {telemetry?.fault_label && (
            <span className="ml-3 px-2 py-0.5 rounded text-xs font-semibold bg-red-900 text-red-300">
              ⚠ {telemetry.fault_label}
            </span>
          )}
        </div>
      </header>

      {/* ── Dashboard Grid ──────────────────────────────────────────────── */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Left column: Health gauge */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <HealthGauge
            telemetry={telemetry}
            score={healthIndex.score}
            status={healthIndex.status}
          />
        </div>

        {/* Centre column: Sensor chart */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <RULChart history={telemetryHistory} />
        </div>

        {/* Bottom row: Alerts + Mission Replay */}
        <div className="md:col-span-1">
          <FaultAlerts alerts={alerts} />
        </div>

        <div className="md:col-span-2">
          <MissionReplay />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="text-center text-[10px] text-slate-600 py-2">
        SIH 2026 · Team SIH26054 · Build {new Date().toISOString().slice(0, 10)}
      </footer>
    </div>
  )
}
