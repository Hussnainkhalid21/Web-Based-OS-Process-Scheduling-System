# OS Simulation Dashboard

Full-stack web application for a university OS lab project — dark themed, glass-morphism UI, all simulation logic on the backend with in-memory state.

## Prerequisites

- **Node.js 18+** (v20 or v22 LTS recommended) → https://nodejs.org
- **pnpm** → `npm install -g pnpm`

## Quick Start

```bash
# Install all dependencies
pnpm install

# Start both backend + frontend
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Features

1. **Dashboard** — Live metrics: CPU utilization, wait time, turnaround, throughput
2. **Process Manager** — Add/delete processes with burst time and priority
3. **CPU Scheduling** — Round Robin + Priority Aging with Gantt chart timeline
4. **IPC Panel** — Message queues between processes
5. **Deadlock Analysis** — Banker's Algorithm detection + forced recovery
6. **Analytics** — Bar charts, global averages, detailed process ledger

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite 6 + Tailwind CSS 3 + Framer Motion |
| Backend | Node.js + Express 4 + TypeScript |
| State | In-memory (no database) |
| Monorepo | pnpm workspaces |
| Routing | Wouter (lightweight) |
| Data | TanStack React Query |

## Project Structure

```
os-simulation-dashboard/
├── package.json                  # Root workspace
├── pnpm-workspace.yaml           # Clean — no platform overrides
├── artifacts/
│   ├── api-server/               # Express API (port 3001)
│   │   └── src/
│   │       ├── index.ts          # Server entry
│   │       ├── lib/store.ts      # ALL simulation logic
│   │       └── routes/index.ts   # ALL API routes
│   └── os-dashboard/             # React frontend (port 5173)
│       └── src/
│           ├── App.tsx           # Wouter routing
│           ├── pages/            # 6 pages
│           ├── hooks/use-api.ts  # All API hooks
│           └── components/       # Layout + sidebar
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/processes | List all |
| POST | /api/processes | Create (burstTime, priority) |
| DELETE | /api/processes/:pid | Delete |
| POST | /api/processes/reset | Reset everything |
| POST | /api/scheduler/run | Run scheduling (timeQuantum) |
| POST | /api/scheduler/reset | Reset scheduler state |
| GET | /api/ipc/all | All message queues |
| POST | /api/ipc/send | Send (fromPid, toPid, message) |
| POST | /api/deadlock/detect | Banker's detection |
| POST | /api/deadlock/recover | Forced recovery |
| GET | /api/analytics | Performance metrics |

## Troubleshooting

**"Use pnpm instead" error** → Run `npm install -g pnpm` first

**Port in use** → Kill the process or change ports in vite.config.ts / api-server/src/index.ts

**ELIFECYCLE** → This project has NO platform-specific overrides. If you still see this, delete `node_modules` + `pnpm-lock.yaml` and run `pnpm install` again.
