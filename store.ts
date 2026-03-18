// ═══════════════════════════════════════════════════════════════
// In-memory state store — all OS simulation logic
// ═══════════════════════════════════════════════════════════════

export interface Process {
  pid: number;
  burstTime: number;
  remainingTime: number;
  priority: number;
  completionTime: number;
  startTime: number;
  waitingTime: number;
  turnaroundTime: number;
  started: boolean;
  finished: boolean;
  terminated: boolean;
}

export interface SchedulerStep {
  pid: number;
  timeRun: number;
  timeElapsed: number;
  completed: boolean;
}

export interface IpcMessage {
  from: number;
  message: string;
  timestamp: string;
}

export interface DeadlockDetectResult {
  deadlockDetected: boolean;
  safeSequence: number[] | null;
  message: string;
}

export interface RecoveryStep {
  victim: number;
  reason: string;
  resourcesReleased: number[];
}

// ─── State ───
let nextPid = 1;
let processList: Process[] = [];
let schedulerRan = false;
let lastSchedulerResult: {
  steps: SchedulerStep[];
  totalTime: number;
  timeQuantum: number;
  processes: Process[];
} | null = null;
const ipcQueue: Map<number, IpcMessage[]> = new Map();

// ─── Process CRUD ───
export function getProcessList(): Process[] {
  return processList;
}

export function addProcess(burstTime: number, priority: number): Process {
  const proc: Process = {
    pid: nextPid++,
    burstTime,
    remainingTime: burstTime,
    priority,
    completionTime: 0,
    startTime: -1,
    waitingTime: 0,
    turnaroundTime: 0,
    started: false,
    finished: false,
    terminated: false,
  };
  processList.push(proc);
  return proc;
}

export function updateProcess(
  pid: number,
  burstTime?: number,
  priority?: number
): Process | null {
  const proc = processList.find((p) => p.pid === pid);
  if (!proc) return null;
  if (burstTime !== undefined) {
    proc.burstTime = burstTime;
    proc.remainingTime = burstTime;
  }
  if (priority !== undefined) {
    proc.priority = priority;
  }
  return proc;
}

export function removeProcess(pid: number): boolean {
  const idx = processList.findIndex((p) => p.pid === pid);
  if (idx === -1) return false;
  processList.splice(idx, 1);
  return true;
}

export function resetAll(): void {
  processList = [];
  nextPid = 1;
  schedulerRan = false;
  lastSchedulerResult = null;
  ipcQueue.clear();
}

export function resetSchedulerState(): void {
  processList = processList.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
    completionTime: 0,
    startTime: -1,
    waitingTime: 0,
    turnaroundTime: 0,
    started: false,
    finished: false,
    terminated: false,
  }));
  schedulerRan = false;
  lastSchedulerResult = null;
}

// ─── CPU Scheduling (Round Robin + Priority Aging) ───
export function runHybridScheduling(timeQuantum: number) {
  const procs: Process[] = processList
    .filter((p) => !p.terminated)
    .map((p) => ({
      ...p,
      remainingTime: p.burstTime,
      started: false,
      finished: false,
      completionTime: 0,
      startTime: -1,
      waitingTime: 0,
      turnaroundTime: 0,
    }));

  const steps: SchedulerStep[] = [];
  let timeElapsed = 0;
  let maxIter = 10000;

  while (maxIter-- > 0) {
    let allFinished = true;
    for (const proc of procs) {
      if (!proc.finished && !proc.terminated) {
        allFinished = false;
        if (!proc.started) {
          proc.started = true;
          proc.startTime = timeElapsed;
        }
        const timeToRun = Math.min(proc.remainingTime, timeQuantum);
        proc.remainingTime -= timeToRun;
        timeElapsed += timeToRun;
        const completed = proc.remainingTime <= 0;
        steps.push({
          pid: proc.pid,
          timeRun: timeToRun,
          timeElapsed,
          completed,
        });
        if (completed) {
          proc.finished = true;
          proc.completionTime = timeElapsed;
          proc.turnaroundTime = proc.completionTime;
          proc.waitingTime = proc.turnaroundTime - proc.burstTime;
        } else {
          // Priority aging — boost waiting processes
          proc.priority = Math.max(0, proc.priority - 1);
        }
      }
    }
    if (allFinished) break;
  }

  // Write back to global list
  for (const proc of procs) {
    const real = processList.find((p) => p.pid === proc.pid);
    if (real) Object.assign(real, proc);
  }

  schedulerRan = true;
  lastSchedulerResult = {
    steps,
    totalTime: timeElapsed,
    timeQuantum,
    processes: procs,
  };

  return { steps, processes: procs, totalTime: timeElapsed };
}

export function getSchedulerRan(): boolean {
  return schedulerRan;
}

export function getLastSchedulerResult() {
  return lastSchedulerResult;
}

// ─── IPC ───
export function ipcSend(
  fromPid: number,
  toPid: number,
  message: string
): void {
  if (!ipcQueue.has(toPid)) ipcQueue.set(toPid, []);
  ipcQueue.get(toPid)!.push({
    from: fromPid,
    message,
    timestamp: new Date().toISOString(),
  });
}

export function ipcReceive(pid: number): IpcMessage[] {
  return ipcQueue.get(pid) || [];
}

export function ipcGetAll(): {
  pid: number;
  count: number;
  messages: IpcMessage[];
}[] {
  const result: { pid: number; count: number; messages: IpcMessage[] }[] = [];
  for (const [pid, messages] of ipcQueue.entries()) {
    result.push({ pid, count: messages.length, messages });
  }
  return result;
}

// ─── Deadlock (Banker's Algorithm) ───
export function detectDeadlock(
  allocation: number[][],
  maxNeed: number[][],
  available: number[]
): DeadlockDetectResult {
  const n = allocation.length;
  const m = available.length;
  const work = [...available];
  const finish = Array(n).fill(false);
  const safeSequence: number[] = [];

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      if (finish[i]) continue;
      const need = maxNeed[i].map((v, j) => v - allocation[i][j]);
      if (need.every((v, j) => v <= work[j])) {
        for (let j = 0; j < m; j++) work[j] += allocation[i][j];
        finish[i] = true;
        safeSequence.push(i);
        changed = true;
      }
    }
  }

  const deadlocked = finish
    .map((f, i) => (!f ? i : -1))
    .filter((i) => i >= 0);

  if (deadlocked.length === 0) {
    return {
      deadlockDetected: false,
      safeSequence,
      message: `Safe sequence found: ${safeSequence.map((i) => `P${i}`).join(" → ")}`,
    };
  }

  return {
    deadlockDetected: true,
    safeSequence: null,
    message: `Deadlock involving processes: ${deadlocked.map((i) => `P${i}`).join(", ")}`,
  };
}

export function recoverDeadlock(
  allocation: number[][],
  maxNeed: number[][],
  available: number[]
): { steps: RecoveryStep[]; finalState: DeadlockDetectResult } {
  const alloc = allocation.map((r) => [...r]);
  const avail = [...available];
  const steps: RecoveryStep[] = [];
  const terminated = new Set<number>();

  let maxIter = 50;
  let result = detectDeadlock(alloc, maxNeed, avail);

  while (result.deadlockDetected && maxIter-- > 0) {
    // Find victim: process with highest total allocation
    let victim = -1;
    let maxAlloc = -1;
    for (let i = 0; i < alloc.length; i++) {
      if (terminated.has(i)) continue;
      const total = alloc[i].reduce((s, v) => s + v, 0);
      if (total > maxAlloc) {
        maxAlloc = total;
        victim = i;
      }
    }
    if (victim === -1) break;

    const released = [...alloc[victim]];
    for (let j = 0; j < avail.length; j++) avail[j] += alloc[victim][j];
    alloc[victim] = alloc[victim].map(() => 0);
    terminated.add(victim);

    steps.push({
      victim,
      reason: `Highest allocation (${maxAlloc} total units)`,
      resourcesReleased: released,
    });

    result = detectDeadlock(alloc, maxNeed, avail);
  }

  return { steps, finalState: result };
}

// ─── Analytics ───
export function getAnalytics() {
  const total = processList.length;
  const completed = processList.filter((p) => p.finished);
  const terminated = processList.filter((p) => p.terminated);
  const n = completed.length;

  const totalBurst = completed.reduce((s, p) => s + p.burstTime, 0);
  const maxC = n ? Math.max(...completed.map((p) => p.completionTime)) : 0;

  return {
    totalProcesses: total,
    completedProcesses: n,
    terminatedProcesses: terminated.length,
    averageWaitingTime: n
      ? completed.reduce((s, p) => s + p.waitingTime, 0) / n
      : 0,
    averageTurnaroundTime: n
      ? completed.reduce((s, p) => s + p.turnaroundTime, 0) / n
      : 0,
    cpuUtilization: maxC > 0 ? (totalBurst / maxC) * 100 : 0,
    throughput: maxC > 0 ? n / maxC : 0,
    processSummary: processList.map((p) => ({
      pid: p.pid,
      burstTime: p.burstTime,
      priority: p.priority,
      startTime: p.startTime,
      completionTime: p.completionTime,
      waitingTime: p.waitingTime,
      turnaroundTime: p.turnaroundTime,
      started: p.started,
      finished: p.finished,
      terminated: p.terminated,
    })),
  };
}
