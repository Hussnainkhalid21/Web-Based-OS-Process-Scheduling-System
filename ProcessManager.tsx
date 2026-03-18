import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useProcesses, useCreateProcess, useDeleteProcess } from "@/hooks/use-api";
import { Plus, Trash2, Cpu, Hash, Clock, AlertTriangle, PlayCircle, X } from "lucide-react";

export default function ProcessManager() {
  const { data: processes, isLoading } = useProcesses();
  const createMut = useCreateProcess();
  const deleteMut = useDeleteProcess();
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState("5");
  const [pri, setPri] = useState("0");

  const handleCreate = () => {
    createMut.mutate({ burstTime: parseInt(burst) || 1, priority: parseInt(pri) || 0 }, {
      onSuccess: () => { setOpen(false); setBurst("5"); setPri("0"); },
    });
  };

  const badge = (p: any) => {
    if (p.terminated) return <span className="badge badge-red">Terminated</span>;
    if (p.finished) return <span className="badge badge-green">Completed</span>;
    if (p.started) return <span className="badge badge-blue">Running</span>;
    return <span className="badge badge-slate">Pending</span>;
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Process Manager</h1>
            <p className="text-[#94A3B8] mt-1">Add, monitor, and control system processes.</p>
          </div>
          <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Process</button>
        </div>

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111827] border border-white/[0.08] rounded-2xl p-6 w-[min(400px,90vw)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Create New Process</h3>
                <button onClick={() => setOpen(false)} className="text-[#94A3B8] hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-[#94A3B8] text-sm mb-5">Add a new process to the system ready queue.</p>
              <div className="space-y-4">
                <div><label className="field-label">Burst Time (ms)</label><input type="number" min="1" className="inp font-mono text-lg" value={burst} onChange={(e) => setBurst(e.target.value)} /></div>
                <div><label className="field-label">Priority</label><input type="number" min="0" className="inp font-mono text-lg" value={pri} onChange={(e) => setPri(e.target.value)} /></div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreate} disabled={createMut.isPending}>{createMut.isPending ? "Creating..." : "Create Process"}</button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#94A3B8] uppercase bg-black/20 border-b border-white/[0.05]">
                <tr>
                  <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> PID</div></th>
                  <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Burst</div></th>
                  <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-2"><Cpu className="h-3.5 w-3.5" /> Remaining</div></th>
                  <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5" /> Priority</div></th>
                  <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-2"><PlayCircle className="h-3.5 w-3.5" /> Status</div></th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-[#94A3B8]">Loading...</td></tr>
                ) : !processes?.length ? (
                  <tr><td colSpan={6} className="text-center py-12 text-[#94A3B8]">
                    <Cpu className="h-10 w-10 mx-auto opacity-20 mb-3" />
                    <p>No processes found in the queue.</p>
                    <button className="btn-ghost mt-3 text-xs" onClick={() => setOpen(true)}>Create One</button>
                  </td></tr>
                ) : processes.map((p: any) => (
                  <tr key={p.pid} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold">P{p.pid}</td>
                    <td className="px-6 py-4 text-[#94A3B8]">{p.burstTime}ms</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#94A3B8]">{p.remainingTime}ms</span>
                        <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.04]">
                          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(p.remainingTime / p.burstTime) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#94A3B8]">{p.priority}</td>
                    <td className="px-6 py-4">{badge(p)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteMut.mutate(p.pid)} className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
