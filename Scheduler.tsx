import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useProcesses, useRunScheduler, useResetScheduler } from "@/hooks/use-api";
import { Play, RotateCcw, Activity } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

export default function Scheduler() {
  const [quantum, setQuantum] = useState("3");
  const [result, setResult] = useState<any>(null);
  const { data: processes } = useProcesses();
  const runMut = useRunScheduler();
  const resetMut = useResetScheduler();

  const handleRun = () => {
    runMut.mutate(parseInt(quantum) || 3, { onSuccess: (data) => setResult(data) });
  };
  const handleReset = () => {
    resetMut.mutate(undefined, { onSuccess: () => setResult(null) });
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold">CPU Scheduling</h1>
          <p className="text-[#94A3B8] mt-1">Simulate Round-Robin CPU scheduling with priority aging.</p>
        </div>

        <div className="card p-5">
          <div className="flex flex-col sm:flex-row gap-5 items-end sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label className="field-label flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-white" /> Time Quantum (ms)</label>
              <input type="number" min="1" className="inp font-mono text-lg" value={quantum} onChange={(e) => setQuantum(e.target.value)} />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="btn-primary flex-1 sm:flex-none" onClick={handleRun} disabled={runMut.isPending || !processes?.length}>
                <Play className="h-4 w-4" /> {runMut.isPending ? "Running..." : "Run Simulation"}
              </button>
              <button className="btn-ghost flex-1 sm:flex-none" onClick={handleReset} disabled={resetMut.isPending}>
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="card">
              <div className="card-header">Gantt Chart Timeline</div>
              <p className="px-5 pt-1 text-xs text-[#64748b]">Execution order across {result.totalTime}ms</p>
              <div className="p-5 overflow-x-auto">
                <div className="relative pb-6">
                  <div className="flex h-14 w-max min-w-full rounded-lg overflow-hidden border border-white/[0.06] shadow-inner">
                    {result.steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center justify-center border-r border-black/20 relative group hover:brightness-110 transition-all"
                        style={{ backgroundColor: COLORS[step.pid % 6], flex: `${step.timeRun} 0 auto`, minWidth: Math.max(40, step.timeRun * 15) }}>
                        <span className="text-white font-bold font-mono text-sm">P{step.pid}</span>
                        <div className="absolute -bottom-5 right-0 text-[10px] font-mono text-[#94A3B8] translate-x-1/2">{step.timeElapsed}</div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 text-[10px] font-mono text-[#94A3B8]">0</div>
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  <h4 className="text-xs font-semibold w-full text-[#94A3B8] uppercase tracking-wider">Legend</h4>
                  {[...new Set(result.steps.map((s: any) => s.pid))].map((pid: any) => (
                    <div key={pid} className="flex items-center gap-2"><div className="w-4 h-4 rounded-md shadow-sm" style={{ backgroundColor: COLORS[pid % 6] }} /><span className="text-sm font-medium">Process {pid}</span></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Time", val: `${result.totalTime}`, unit: "ms" },
                { label: "Avg Wait Time", val: (result.processes.reduce((a: number, p: any) => a + p.waitingTime, 0) / result.processes.length).toFixed(1), unit: "ms" },
                { label: "Avg Turnaround", val: (result.processes.reduce((a: number, p: any) => a + p.turnaroundTime, 0) / result.processes.length).toFixed(1), unit: "ms" },
              ].map((m) => (
                <div key={m.label} className="card p-5 text-center">
                  <p className="text-sm font-medium text-[#94A3B8]">{m.label}</p>
                  <p className="text-3xl font-bold font-mono mt-2">{m.val} <span className="text-lg font-normal text-[#94A3B8]">{m.unit}</span></p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}
