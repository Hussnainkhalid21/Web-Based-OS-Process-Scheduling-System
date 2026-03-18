import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useAnalytics } from "@/hooks/use-api";
import { Activity, Clock, Timer, CheckCircle, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" /></div></Layout>;
  }

  const stats = [
    { title: "CPU Utilization", value: `${(analytics?.cpuUtilization ?? 0).toFixed(1)}%`, desc: "Overall processing load", icon: Activity },
    { title: "Avg Waiting Time", value: `${(analytics?.averageWaitingTime ?? 0).toFixed(2)} ms`, desc: "Mean time in ready queue", icon: Clock },
    { title: "Avg Turnaround", value: `${(analytics?.averageTurnaroundTime ?? 0).toFixed(2)} ms`, desc: "Completion to submission time", icon: Timer },
    { title: "Throughput", value: `${(analytics?.throughput ?? 0).toFixed(2)} p/ms`, desc: "Processes completed per unit time", icon: CheckCircle },
  ];

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">System Dashboard</h1>
          <p className="text-[#94A3B8] mt-1">Real-time overview of the operating system simulation metrics.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <div className="card p-5 hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#94A3B8]">{s.title}</span>
                  <div className="p-2 rounded-xl bg-white/10"><s.icon className="h-4 w-4 text-white" /></div>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <p className="text-xs text-[#64748b] mt-1">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="card">
          <div className="card-header">Process Status Overview</div>
          <div className="p-5 flex gap-4 flex-wrap">
            {[
              { label: "Total Processes", val: analytics?.totalProcesses ?? 0, icon: Activity, color: "bg-blue-500/15 text-blue-400" },
              { label: "Completed", val: analytics?.completedProcesses ?? 0, icon: CheckCircle, color: "bg-emerald-500/15 text-emerald-400" },
              { label: "Terminated", val: analytics?.terminatedProcesses ?? 0, icon: AlertCircle, color: "bg-rose-500/15 text-rose-400" },
            ].map((item) => (
              <div key={item.label} className="flex-1 min-w-[140px] border border-white/[0.08] p-4 rounded-xl flex items-center gap-3">
                <div className={`p-3 rounded-full ${item.color}`}><item.icon size={20} /></div>
                <div><p className="text-sm text-[#94A3B8] font-medium">{item.label}</p><p className="text-2xl font-bold">{item.val}</p></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
