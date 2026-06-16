export default function TopRiskyUsers({ users = [] }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <p className="text-xs font-mono text-slate-500 tracking-widest">TOP RISKY USERS</p>
        <p className="text-sm text-slate-300 font-medium mt-0.5">Ranked by avg anomaly score</p>
      </div>

      {users.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-slate-600 text-sm">No data.</div>
      ) : (
        <div className="p-4 flex flex-col gap-2">
          {users.map((u, i) => (
            <div key={u.user_id}
              className="flex items-center gap-4 bg-slate-800/50 border border-slate-700/60 rounded-xl px-5 py-3">
              <span className="text-slate-500 font-mono text-sm w-6 shrink-0">#{i+1}</span>
              <div className="flex-1">
                <p className="text-sm font-mono text-white">UID-{u.user_id}</p>
                <p className="text-xs text-slate-500 mt-0.5">{u.event_count} anomaly events</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold font-mono ${
                  u.avg_score >= 0.7 ? "text-red-400"
                  : u.avg_score >= 0.5 ? "text-amber-400"
                  : "text-yellow-400"
                }`}>
                  {(u.avg_score * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">avg anomaly</p>
              </div>
              <div className="text-right w-20">
                <p className={`text-sm font-mono font-bold ${
                  u.min_trust >= 75 ? "text-emerald-400"
                  : u.min_trust >= 45 ? "text-amber-400"
                  : "text-red-400"
                }`}>
                  {u.min_trust}/100
                </p>
                <p className="text-xs text-slate-500">min trust</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}