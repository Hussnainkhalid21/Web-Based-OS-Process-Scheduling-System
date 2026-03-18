import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useIpcAll, useIpcSend } from "@/hooks/use-api";
import { Send, MessageSquare, ArrowRight } from "lucide-react";

export default function IPC() {
  const { data: allMessages } = useIpcAll();
  const sendMut = useIpcSend();
  const [fromPid, setFromPid] = useState("");
  const [toPid, setToPid] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPid || !toPid || !message) return;
    sendMut.mutate(
      { fromPid: parseInt(fromPid), toPid: parseInt(toPid), message },
      { onSuccess: () => setMessage("") }
    );
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold">Inter-Process Communication</h1>
          <p className="text-[#94A3B8] mt-1">Message passing system between simulated processes.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-5 lg:col-span-1">
            <h3 className="text-[15px] font-semibold flex items-center gap-2 mb-1"><Send className="h-4 w-4 text-[#94A3B8]" /> Send Message</h3>
            <p className="text-xs text-[#64748b] mb-4">Dispatch a payload to another process.</p>
            <form onSubmit={handleSend} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="field-label">From PID</label><input type="number" required className="inp font-mono" placeholder="1" value={fromPid} onChange={(e) => setFromPid(e.target.value)} /></div>
                <div><label className="field-label">To PID</label><input type="number" required className="inp font-mono" placeholder="2" value={toPid} onChange={(e) => setToPid(e.target.value)} /></div>
              </div>
              <div>
                <label className="field-label">Message Payload</label>
                <textarea required className="inp font-mono resize-none" style={{ minHeight: 100 }} placeholder='{ data: "Sync complete" }' value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <button type="submit" className="btn-glass w-full" disabled={sendMut.isPending}>
                {sendMut.isPending ? "Sending..." : "Dispatch Message"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[15px] font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-[#94A3B8]" /> Process Message Queues</h3>
            {!allMessages?.queue?.length ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                <MessageSquare className="h-10 w-10 mx-auto text-[#94A3B8] opacity-40 mb-3" />
                <p className="text-[#94A3B8]">No messages currently in any process queue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allMessages.queue.map((entry: any) => (
                  <div key={entry.pid} className="card overflow-hidden border-t-2 border-t-white/20">
                    <div className="bg-black/20 px-4 py-3 border-b border-white/[0.05] flex justify-between items-center">
                      <span className="font-mono font-semibold text-sm">Process {entry.pid}</span>
                      <span className="bg-white/10 text-white px-2 py-0.5 rounded-md text-xs font-bold border border-white/[0.05]">{entry.count} msgs</span>
                    </div>
                    <div className="max-h-[260px] overflow-y-auto divide-y divide-white/[0.04]">
                      {entry.messages.map((msg: any, i: number) => (
                        <div key={i} className="p-4 hover:bg-white/[0.03] transition-colors">
                          <div className="flex justify-between text-xs text-[#94A3B8] mb-2">
                            <span className="font-semibold text-white">From P{msg.from}</span>
                            <span className="font-mono text-[10px]">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="bg-black/40 border border-white/[0.05] rounded-lg p-3 text-sm font-mono break-all text-[#94A3B8]">{msg.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
