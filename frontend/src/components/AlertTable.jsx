const TYPE_META = {
  SESSION_FROZEN:      { label:"Session Frozen",       sev:"CRITICAL", color:"red",   icon:"🔴", factors:["Trust score collapse","Anomalous behaviour pattern"] },
  TRANSACTION_BLOCKED: { label:"Transaction Blocked",   sev:"HIGH",     color:"amber", icon:"🟠", factors:["High-value transfer","Risk threshold exceeded"] },
};
const DEFAULT_META = { label:"Fraud Alert", sev:"MEDIUM", color:"yellow", icon:"🟡", factors:["Suspicious activity detected"] };

const SEV_CLS = {
  red:    "bg-red-500/10 text-red-400 border-red-500/30",
  amber:  "bg-amber-500/10 text-amber-400 border-amber-500/30",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};
const BORDER_CLS = { red:"border-l-red-500", amber:"border-l-amber-500", yellow:"border-l-yellow-500" };

function parseFactors(msg = "") {
  const f = [];
  if (msg.includes("frozen"))   f.push("Trust score collapse");
  if (msg.includes("device"))   f.push("New device detected");
  if (msg.includes("VPN"))      f.push("VPN / proxy active");
  if (msg.includes("velocity")) f.push("Velocity anomaly");
  if (msg.includes("location")) f.push("Location anomaly");
  if (msg.includes("blocked"))  f.push("Risk threshold exceeded");
  if (msg.includes("₹") || msg.includes("Transaction")) f.push("High-value transaction");
  return f.length ? f : ["Suspicious activity detected"];
}

function timeAgo(ts) {
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  return `${Math.floor(d/3600)}h ago`;
}

export default function AlertTable({ alerts = [], onResolve }) {
  const open = alerts.filter(a => !a.resolved).length;

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-slate-500 tracking-widest">FRAUD ALERT CENTRE</p>
          <p className="text-sm text-slate-300 font-medium mt-0.5">Real-time fraud event monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          {open > 0 && (
            <span className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 dot-pulse inline-block"/>
              {open} OPEN
            </span>
          )}
          <span className="text-xs text-slate-500">{alerts.length} total</span>
        </div>
      </div>

      {/* Alert cards */}
      <div className="p-4 flex flex-col gap-3">
        {alerts.length === 0 && (
          <div className="flex items-center justify-center py-12 text-slate-600 text-sm">
            No alerts. System operating normally.
          </div>
        )}

        {alerts.map(alert => {
          const meta    = TYPE_META[alert.alert_type] || DEFAULT_META;
          const factors = parseFactors(alert.message);
          const dim     = alert.resolved;

          return (
            <div key={alert.id}
              className={`border border-slate-700/60 border-l-4 ${BORDER_CLS[meta.color]} rounded-xl p-5 transition-opacity ${dim ? "opacity-40" : ""}`}>
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meta.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{meta.label}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      ALERT #{String(alert.id).padStart(4,"0")} · SESSION #{alert.session_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${SEV_CLS[meta.color]}`}>
                    {meta.sev}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                    dim ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}>
                    {dim ? "RESOLVED" : "OPEN"}
                  </span>
                </div>
              </div>

              {/* Risk factor chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {factors.map((f, i) => (
                  <span key={i} className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-0.5 rounded-md">
                    {f}
                  </span>
                ))}
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-slate-500">User ID</p>
                    <p className="text-sm font-mono text-slate-300">UID-{alert.user_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Time</p>
                    <p className="text-sm font-mono text-slate-300">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                      <span className="text-slate-500 ml-2">({timeAgo(alert.timestamp)})</span>
                    </p>
                  </div>
                </div>

                {!dim && onResolve && (
                  <button onClick={() => onResolve(alert.id)}
                    className="text-xs font-mono text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-1.5 rounded-lg transition-colors">
                    Mark resolved
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}