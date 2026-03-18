<div align="center">

# 🖥️ OS Process Schedulling System

**A full-stack web application that simulates core Operating System concepts — built for university OS lab coursework.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express_4-000000?style=for-the-badge&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

<br/>

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Project Structure](#-project-structure) · [License](#%EF%B8%8F-license)

</div>



## ✨ Features

### 📊 System Dashboard
Real-time overview of simulation metrics — CPU utilization, average waiting time, turnaround time, and throughput — all at a glance.

### ⚙️ Process Manager
Create, monitor, and delete processes with configurable burst time and priority. View live status (Pending → Running → Completed / Terminated) in a sortable table.

### 🔄 CPU Scheduling — Round Robin + Priority Aging
Run a hybrid Round-Robin scheduler with a configurable time quantum. Includes automatic **priority aging** to prevent starvation. Results are visualized as an animated **Gantt chart timeline**.

### 💬 Inter-Process Communication (IPC)
Message-passing system between simulated processes. Send payloads from one PID to another and inspect per-process message queues in real time.

### 🔒 Deadlock Detection & Recovery — Banker's Algorithm
Configure allocation matrices, max-need matrices, and available resource vectors. Detect deadlocks using the **Banker's Algorithm** and trigger forced recovery (victim selection by highest allocation).

### 📈 Analytics
Animated bar charts for burst/wait/turnaround distribution per process, global average metrics, and a detailed per-process ledger with all scheduling timestamps.

---

## 🛠️ Tech Stack

| Layer        | Technology                                                                 |
|:-------------|:---------------------------------------------------------------------------|
| **Language** | TypeScript (frontend + backend)                                            |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Framer Motion, Recharts, Lucide Icons   |
| **Backend**  | Node.js, Express 4, Zod (validation)                                       |
| **State**    | In-memory store (no database required)                                     |
| **Routing**  | Wouter (lightweight client-side), Express Router (server-side)             |
| **Data**     | TanStack React Query v5 (caching, mutations, auto-refetch)                 |
| **Monorepo** | pnpm Workspaces                                                           |
| **Tooling**  | tsx (dev runner), PostCSS, Autoprefixer                                    |

---

## 🚀 Getting Started

### Prerequisites

| Tool       | Version   | Install                          |
|:-----------|:----------|:---------------------------------|
| **Node.js** | 18+       | [nodejs.org](https://nodejs.org) |
| **pnpm**   | 8+        | `npm install -g pnpm`           |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/os-simulation-dashboard.git
cd os-simulation-dashboard

# 2. Install all dependencies (frontend + backend)
pnpm install

# 3. Start the development servers
pnpm dev
```

This launches both servers concurrently:

| Service   | URL                        |
|:----------|:---------------------------|
| Frontend  | http://localhost:5173      |
| API       | http://localhost:3001      |

> The Vite dev server automatically proxies `/api` requests to the Express backend — no CORS setup needed in development.

### Individual Commands

```bash
pnpm dev:api    # Start only the backend
pnpm dev:ui     # Start only the frontend
pnpm build      # Production build (all packages)
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Processes

| Method   | Endpoint                | Body                                  | Description              |
|:---------|:------------------------|:--------------------------------------|:-------------------------|
| `GET`    | `/processes`            | —                                     | List all processes       |
| `POST`   | `/processes`            | `{ burstTime: number, priority: number }` | Create a new process |
| `PATCH`  | `/processes/:pid`       | `{ burstTime?, priority? }`           | Update a process         |
| `DELETE` | `/processes/:pid`       | —                                     | Delete a process         |
| `POST`   | `/processes/reset`      | —                                     | Reset all state          |

### Scheduler

| Method   | Endpoint                | Body                        | Description               |
|:---------|:------------------------|:----------------------------|:--------------------------|
| `POST`   | `/scheduler/run`        | `{ timeQuantum: number }`   | Run Round-Robin scheduler |
| `POST`   | `/scheduler/reset`      | —                           | Reset scheduler state     |
| `GET`    | `/scheduler/last`       | —                           | Get last scheduler result |

### IPC (Inter-Process Communication)

| Method   | Endpoint                | Body                                             | Description           |
|:---------|:------------------------|:-------------------------------------------------|:----------------------|
| `POST`   | `/ipc/send`             | `{ fromPid: number, toPid: number, message: string }` | Send a message   |
| `GET`    | `/ipc/receive/:pid`     | —                                                | Get messages for PID  |
| `GET`    | `/ipc/all`              | —                                                | Get all message queues|

### Deadlock

| Method   | Endpoint                | Body                                                      | Description         |
|:---------|:------------------------|:----------------------------------------------------------|:--------------------|
| `POST`   | `/deadlock/detect`      | `{ allocation: number[][], maxNeed: number[][], available: number[] }` | Detect deadlocks |
| `POST`   | `/deadlock/recover`     | `{ allocation: number[][], maxNeed: number[][], available: number[] }` | Force recovery   |

### Analytics

| Method   | Endpoint      | Description                  |
|:---------|:--------------|:-----------------------------|
| `GET`    | `/analytics`  | Get all performance metrics  |

---

## 📁 Project Structure

```
os-simulation-dashboard/
│
├── package.json                  # Root workspace config + scripts
├── pnpm-workspace.yaml           # Workspace package definitions
├── .gitignore                    # Git ignore rules
├── README.md                     # You are here
│
└── artifacts/
    ├── api-server/               # ── Express Backend (port 3001)
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts          #   Server bootstrap
    │       ├── routes/index.ts   #   All REST endpoints
    │       └── lib/store.ts      #   In-memory state + simulation logic
    │                             #   (scheduling, IPC, deadlock, analytics)
    │
    └── os-dashboard/             # ── React Frontend (port 5173)
        ├── package.json
        ├── vite.config.ts        #   Vite config + API proxy
        ├── tailwind.config.js    #   Tailwind theme
        ├── tsconfig.json
        ├── index.html
        └── src/
            ├── main.tsx          #   Entry point
            ├── App.tsx           #   Client-side routing (Wouter)
            ├── index.css         #   Global styles + glass-morphism theme
            ├── components/
            │   └── layout.tsx    #   Sidebar navigation + responsive shell
            ├── hooks/
            │   └── use-api.ts    #   TanStack Query hooks for all endpoints
            ├── lib/
            │   └── utils.ts      #   Utility functions (cn, clsx)
            └── pages/
                ├── Dashboard.tsx       # System overview cards
                ├── ProcessManager.tsx  # CRUD table + modal
                ├── Scheduler.tsx       # Gantt chart + controls
                ├── IPC.tsx             # Message send + queue viewer
                ├── Deadlock.tsx        # Matrix inputs + detection
                └── Analytics.tsx       # Charts + ledger
```

---

## 🧪 OS Concepts Demonstrated

| Concept                     | Implementation                                                        |
|:----------------------------|:----------------------------------------------------------------------|
| Process Lifecycle           | Create → Ready → Running → Completed / Terminated                     |
| CPU Scheduling              | Round-Robin with configurable time quantum                            |
| Priority Aging              | Waiting processes get boosted priority to prevent starvation          |
| Inter-Process Communication | Asynchronous message passing via per-process queues                   |
| Deadlock Detection          | Banker's Algorithm (Safety Algorithm)                                 |
| Deadlock Recovery           | Victim selection by highest resource allocation + resource preemption |
| Performance Metrics         | CPU utilization, throughput, avg waiting & turnaround time            |

---

## 🐛 Troubleshooting

| Problem                        | Solution                                                                                     |
|:-------------------------------|:---------------------------------------------------------------------------------------------|
| `Use pnpm instead` error       | Run `npm install -g pnpm` first                                                             |
| Port 5173 or 3001 already in use | Kill the occupying process, or change ports in `vite.config.ts` / `api-server/src/index.ts` |
| `ELIFECYCLE` errors            | Delete `node_modules` + `pnpm-lock.yaml`, then re-run `pnpm install`                        |
| API calls fail in browser      | Make sure both servers are running via `pnpm dev` (not just the frontend)                    |

---

## ⚠️ License

**© 2026 \<Hussnain Khalid\>. All rights reserved.**

This source code is provided for **viewing and educational reference purposes only**. No permission is granted to use, copy, modify, merge, publish, distribute, sublicense, or create derivative works from this software, in whole or in part, without explicit written permission from the author.

---

<div align="center">


</div>
