import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useDetectDeadlock, useRecoverDeadlock } from "@/hooks/use-api";
import { ShieldAlert, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

export default function Deadlock() {
  const [np, setNp] = useState(3);
  const [nr, setNr] = useState(3);
  const [alloc, setAlloc] = useState<number[][]>(Array(3).fill(null).map(() => Array(3).fill(0)));
  const [maxN, setMaxN] = useState<number[][]>(Array(3).fill(null).map(() => Array(3).fill(0)));
  const [avail, setAvail] = useState<number[]>(Array(3).fill(0));
  const detectMut = useDetectDeadlock();
  const recoverMut = useRecoverDeadlock();

  const resize = () => {
    setAlloc(Array(np).fill(null).map(() => Array(nr).fill(0)));
    setMaxN(Array(np).fill(null).map(() => Array(nr).fill(0)));
    setAvail(Array(nr).fill(0));
  };

  const upM = (m: number[][], set: Function, r: number, c: number, v: string) => {
    const n = m.map((row) => [...row]); n[r][c] = parseInt(v) || 0; set(n);
  };

  const payload = { allocation: alloc, maxNeed: maxN, available: avail };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold">Deadlock Analysis</h1>
          <p className="text-[#94A3B8] mt-1">Banker's Algorithm for deadlock detection and recovery.</p>
        </div>

        <div className="card p-4 flex flex-wrap gap-5 items-end bg-black/20">
          <div><label className="field-label">Processes (N)</label><input type="number" min="1" max="10" value={np} onChange={(e) => setNp(parseInt(e.target.value) || 1)} className="inp font-mono w-20" /></div>
          <div><label className="field-label">Resources (M)</label><input type="number" min="1" max="10" value={nr} onChange={(e) => setNr(parseInt(e.target.value) || 1)} className="inp font-mono w-20" /></div>
          <button className="btn-glass" onClick={resize}>Apply Dimensions</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ title: "Allocation Matrix", desc: "Resources currently assigned", data: alloc, set: setAlloc },
            { title: "Max Need Matrix", desc: "Maximum resources required", data: maxN, set: setMaxN }].map((m) => (
            <div key={m.title} className="card p-5">
              <h3 className="text-[15px] font-semibold">{m.title}</h3>
              <p className="text-xs text-[#64748b] mb-3">{m.desc}</p>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-sm" style={{ borderSpacing: 6, borderCollapse: "separate" }}>
                  <thead><tr><th></th>{Array(nr).fill(0).map((_, i) => <th key={i} className="text-[#94A3B8] text-xs pb-1">R{i}</th>)}</tr></thead>
                  <tbody>{m.data.map((row, r) => (
                    <tr key={r}><td className="font-semibold pr-3">P{r}</td>
                      {row.map((v, c) => <td key={c}><input type="number" min="0" value={v} onChange={(e) => upM(m.data, m.set, r, c, e.target.value)}
                        className="w-12 text-center py-1 rounded border border-white/10 bg-black/40 text-white font-mono text-sm outline-none focus:border-white/20" /></td>)}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5">
          <h3 className="text-[15px] font-semibold">Available Resources</h3>
          <p className="text-xs text-[#64748b] mb-3">Free instances of each resource type</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {avail.map((v, i) => (
              <div key={i} className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/[0.05]">
                <span className="font-mono font-semibold text-[#94A3B8]">R{i}</span>
                <input type="number" min="0" value={v} onChange={(e) => { const a = [...avail]; a[i] = parseInt(e.target.value) || 0; setAvail(a); }}
                  className="w-16 text-center py-1.5 rounded-lg border border-white/10 bg-black/40 font-bold text-lg text-white font-mono outline-none focus:border-white/20" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 border-t border-white/[0.08] pt-5">
            <button className="btn-glass text-base h-11 px-6" onClick={() => detectMut.mutate(payload)} disabled={detectMut.isPending}>
              <ShieldAlert className="h-5 w-5" /> Detect Deadlock
            </button>
            <button className="btn-danger text-base h-11 px-6" onClick={() => recoverMut.mutate(payload)} disabled={recoverMut.isPending}>
              <RefreshCw className="h-5 w-5" /> Force Recovery
            </button>
          </div>
        </div>

        {detectMut.data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`p-5 rounded-2xl border flex items-start gap-4 ${detectMut.data.deadlockDetected ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              {detectMut.data.deadlockDetected
                ? <AlertTriangle className="h-7 w-7 text-red-400 shrink-0" />
                : <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />}
              <div>
                <h3 className={`text-xl font-bold ${detectMut.data.deadlockDetected ? "text-red-400" : "text-emerald-400"}`}>
                  {detectMut.data.deadlockDetected ? "Deadlock Detected!" : "System is Safe"}
                </h3>
                <p className={`mt-1 font-medium ${detectMut.data.deadlockDetected ? "text-red-300" : "text-emerald-300"}`}>
                  {detectMut.data.message}
                </p>
                {!detectMut.data.deadlockDetected && detectMut.data.safeSequence && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-emerald-400">Safe Sequence:</span>
                    {detectMut.data.safeSequence.map((pid: number, idx: number) => (
                      <span key={idx} className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20 font-mono font-bold text-emerald-400">P{pid}</span>
                        {idx < detectMut.data.safeSequence!.length - 1 && <span className="text-emerald-500/40">→</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {recoverMut.data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card border-orange-500/20 bg-orange-500/10">
              <div className="card-header text-orange-400 flex items-center gap-2"><RefreshCw className="h-5 w-5" /> Recovery Execution</div>
              <div className="p-5 space-y-3">
                {recoverMut.data.steps.map((step: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-black/20 rounded-xl border border-orange-500/10">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                    <div>
                      <h4 className="font-bold">Terminated Process P{step.victim}</h4>
                      <p className="text-sm text-[#94A3B8] mt-1">{step.reason}</p>
                      <div className="mt-2 text-xs font-mono text-[#94A3B8] bg-black/40 border border-white/[0.05] px-2 py-1 rounded inline-block">
                        Released: [{step.resourcesReleased.join(", ")}]
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <p className="font-bold text-emerald-400">Final: {recoverMut.data.finalState.message}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}
