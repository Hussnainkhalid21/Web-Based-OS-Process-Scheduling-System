import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api";

async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Processes
export function useProcesses() {
  return useQuery({
    queryKey: ["processes"],
    queryFn: () => fetcher<any[]>("/processes"),
  });
}

export function useCreateProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { burstTime: number; priority: number }) =>
      fetcher("/processes", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["processes"] }),
  });
}

export function useDeleteProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pid: number) =>
      fetcher(`/processes/${pid}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["processes"] }),
  });
}

export function useResetAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fetcher("/processes/reset", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

// Scheduler
export function useRunScheduler() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (timeQuantum: number) =>
      fetcher<any>("/scheduler/run", {
        method: "POST",
        body: JSON.stringify({ timeQuantum }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processes"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useResetScheduler() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fetcher("/scheduler/reset", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processes"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// IPC
export function useIpcAll() {
  return useQuery({
    queryKey: ["ipc"],
    queryFn: () => fetcher<any>("/ipc/all"),
  });
}

export function useIpcSend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { fromPid: number; toPid: number; message: string }) =>
      fetcher("/ipc/send", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ipc"] }),
  });
}

// Deadlock
export function useDetectDeadlock() {
  return useMutation({
    mutationFn: (data: {
      allocation: number[][];
      maxNeed: number[][];
      available: number[];
    }) =>
      fetcher<any>("/deadlock/detect", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useRecoverDeadlock() {
  return useMutation({
    mutationFn: (data: {
      allocation: number[][];
      maxNeed: number[][];
      available: number[];
    }) =>
      fetcher<any>("/deadlock/recover", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

// Analytics
export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetcher<any>("/analytics"),
  });
}
