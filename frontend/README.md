# Frontend

React + Vite + Tailwind dashboard for the Digital Twin.

## Running locally

```bash
npm install
VITE_WS_URL=ws://localhost:8000/ws npm run dev
```

Open http://localhost:5173

## Components

| Component | Purpose |
|-----------|---------|
| `HealthGauge.jsx` | SVG health gauge + sensor snapshot |
| `FaultAlerts.jsx` | Live fault alert list with severity colours |
| `RULChart.jsx` | Multi-sensor Recharts line chart |
| `MissionReplay.jsx` | Time-range picker → scrubable replay |
| `hooks/useWebSocket.js` | WS connection with auto-reconnect + ring buffer |

## Environment Variables

| Var | Default | Description |
|-----|---------|-------------|
| `VITE_WS_URL` | `ws://localhost:8000/ws` | Backend WebSocket URL |
| `VITE_API_URL` | `http://localhost:8000` | Backend REST URL |

**Owner**: Front
