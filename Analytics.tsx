import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useAnalytics } from "@/hooks/use-api";

const COLORS = { burst: "#94A3B8", wait: "#475569", tat: "#cbd5e1" };

export default function Analytics() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading || !analytics) {
    return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" /></div></Layout>;
  }

  const procs = analytics.processSummary || [];
  const maxVal = Math.max(...procs.map((p: any) => Math.max(p.turnaroundTime, p.burstTime, p.waitingTime)), 1);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Analytics</h1>
          <p className="text-[#94A3B8] mt-1">Detailed performance metrics and historical data.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bar Chart */}
          <div className="card p-5">
            <h3 className="text-[15px] font-semibold mb-1">Process Time Distribution</h3>
            <p className="text-xs text-[#64748b] mb-4">Burst, wait, and turnaround times per process</p>
            <div className="h-[220px] flex items-end gap-3 pb-2">
              {procs.length === 0 ? (
                <div className="text-[#94A3B8] m-auto text-sm">No data — run the scheduler first.</div>
              ) : (
                procs.map((p: any) => (
                  <div key={p.pid} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-[2px] items-end" style={{ height: 180 }}>
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${(p.burstTime / maxVal) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 rounded-t-sm min-h-[2px]" style={{ background: COLORS.burst }}
                      />
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${(p.waitingTime / maxVal) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex-1 rounded-t-sm min-h-[2px]" style={{ background: COLORS.wait }}
                      />
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${(p.turnaroundTime / maxVal) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-1 rounded-t-sm min-h-[2px]" style={{ background: COLORS.tat }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-[#94A3B8]">P{p.pid}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-5 mt-3 pt-3 border-t border-white/[0.06]">
              {[{ label: "Burst", color: COLORS.burst }, { label: "Wait", color: COLORS.wait }, { label: "Turnaround", color: COLORS.tat }].map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-xs font-medium text-[#94A3B8]">
                  <div className="w-3 h-3 rounded" style={{ background: l.color }} /> {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Global Averages */}
          <div className="card p-6">
            <h3 className="text-[15px] font-semibold mb-5">Global Averages</h3>
            <div>
              <p className="field-label">Mean Waiting Time</p>
              <p className="text-[42px] font-light font-mono leading-tight">
                {analytics.averageWaitingTime.toFixed(2)}
                <span className="text-xl text-[#94A3B8] ml-2">ms</span>
              </p>
            </div>
            <div className="h-px w-full bg-white/[0.08] my-6" />
            <div>
              <p className="field-label">Mean Turnaround Time</p>
              <p className="text-[42px] font-light font-mono leading-tight">
                {analytics.averageTurnaroundTime.toFixed(2)}
                <span className="text-xl text-[#94A3B8] ml-2">ms</span>
              </p>
            </div>
            <div className="h-px w-full bg-white/[0.08] my-6" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="field-label">CPU Utilization</p>
                <p className="text-2xl font-bold font-mono">{analytics.cpuUtilization.toFixed(1)}%</p>
              </div>
              <div>
                <p className="field-label">Throughput</p>
                <p className="text-2xl font-bold font-mono">{analytics.throughput.toFixed(4)}/ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Ledger */}
        <div className="card overflow-hidden">
          <div className="card-header">Detailed Process Ledger</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#94A3B8] uppercase bg-black/20 border-y border-white/[0.05]">
                <tr>
                  <th className="px-6 py-3 font-semibold">PID</th>
                  <th className="px-6 py-3 font-semibold">Priority</th>
                  <th className="px-6 py-3 font-semibold">Burst</th>
                  <th className="px-6 py-3 font-semibold">Start</th>
                  <th className="px-6 py-3 font-semibold">Completion</th>
                  <th className="px-6 py-3 font-semibold">Wait Time</th>
                  <th className="px-6 py-3 font-semibold text-right">Turnaround</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {procs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-[#94A3B8]">No processes recorded.</td></tr>
                ) : (
                  procs.map((p: any) => (
                    <tr key={p.pid} className="hover:bg-white/[0.03] transition-colors font-mono">
                      <td className="px-6 py-3 font-bold">P{p.pid}</td>
                      <td className="px-6 py-3 text-[#94A3B8]">{p.priority}</td>
                      <td className="px-6 py-3 text-[#94A3B8]">{p.burstTime}</td>
                      <td className="px-6 py-3 text-[#94A3B8]">{p.started ? p.startTime : "—"}</td>
                      <td className="px-6 py-3 text-[#94A3B8]">{p.finished ? p.completionTime : "—"}</td>
                      <td className="px-6 py-3 font-semibold text-white/80">{p.waitingTime}</td>
                      <td className="px-6 py-3 font-semibold text-white/80 text-right">{p.turnaroundTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
