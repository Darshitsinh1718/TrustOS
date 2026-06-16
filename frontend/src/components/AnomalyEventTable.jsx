function scoreColor(s) {
  return s >= 0.7 ? "text-red-400" : s >= 0.5 ? "text-amber-400" : "text-emerald-400";
}
function scoreBg(s) {
  return s >= 0.7
    ? "bg-red-500/10 border-red-500/30 text-red-400"
    : s >= 0.5
    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
}

function timeAgo(ts) {
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60)   return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  return `${Math.floor(d/3600)}h ago`;
}

const COLS = ["ID","User","Hour","Amount","Typing","Mouse","Dev","Loc","Score","Anomaly","Penalty","Trust After","Time"];

export default function AnomalyEventTable({ events = [] }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-slate-500 tracking-widest">ML ANOMALY EVENTS</p>
          <p className="text-sm text-slate-300 font-medium mt-0.5">Isolation Forest inference log</p>
        </div>
        <span className="text-xs text-slate-500">{events.length} records</span>
      </div>

      {events.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-slate-600 text-sm">
          No anomaly events yet. Trigger an ML signal to populate.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                {COLS.map(c => (
                  <th key={c} className="px-4 py-3 text-left font-mono text-slate-500 tracking-wider whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400">#{e.id}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">UID-{e.user_id}</td>
                  <td className="px-4 py-3 font-mono text-white">{e.login_hour}:00</td>
                  <td className="px-4 py-3 font-mono text-slate-300">₹{e.transaction_amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{e.typing_speed}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{e.mouse_speed}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${e.device_known ? "text-emerald-400":"text-red-400"}`}>
                      {e.device_known ? "✓":"✕"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${e.location_known ? "text-emerald-400":"text-red-400"}`}>
                      {e.location_known ? "✓":"✕"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold text-sm ${scoreColor(e.anomaly_score)}`}>
                      {e.anomaly_score?.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      e.is_anomaly
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}>
                      {e.is_anomaly ? "ANOMALY" : "NORMAL"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-red-400 font-semibold">−{e.risk_penalty}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${
                      e.trust_score_after >= 75 ? "text-emerald-400"
                      : e.trust_score_after >= 45 ? "text-amber-400"
                      : "text-red-400"
                    }`}>
                      {e.trust_score_after?.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                    {timeAgo(e.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}