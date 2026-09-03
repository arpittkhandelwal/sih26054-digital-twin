/**
 * useWebSocket.js
 * ===============
 * Custom hook that connects to the backend WebSocket and exposes
 * live `telemetry` and `alerts` state to components.
 *
 * Messages received are JSON objects shaped as:
 *   { type: "telemetry", data: { ... } }
 *   { type: "alert",     data: { ... } }
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'
const RECONNECT_DELAY_MS = 3000
const MAX_HISTORY = 120   // keep last 2 min of telemetry for charts

export function useWebSocket() {
  const [telemetry, setTelemetry] = useState(null)
  const [telemetryHistory, setTelemetryHistory] = useState([])
  const [alerts, setAlerts] = useState([])
  const [connected, setConnected] = useState(false)

  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      console.info('[WS] Connected to', WS_URL)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)

        if (msg.type === 'telemetry') {
          setTelemetry(msg.data)
          setTelemetryHistory((prev) => {
            const next = [...prev, { ...msg.data, _t: Date.now() }]
            return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
          })
        }

        if (msg.type === 'alert') {
          setAlerts((prev) => [msg.data, ...prev].slice(0, 50))
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      setConnected(false)
      console.warn('[WS] Disconnected — retrying in', RECONNECT_DELAY_MS, 'ms')
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS)
    }

    ws.onerror = (err) => {
      console.error('[WS] Error:', err)
      ws.close()
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { telemetry, telemetryHistory, alerts, connected }
}
