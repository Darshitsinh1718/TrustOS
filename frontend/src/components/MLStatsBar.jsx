export default function MLStatsBar({ stats = {} }) {
  const items = [
    { label:"Total ML Events",    value: stats.total_events    ?? 0,                            color:"text-cyan-400" },
    { label:"Anomalies Flagged",  value: stats.flagged_anomalies ?? 0,                          color:"text-red-400" },
    { label:"Flag Rate",          value: `${((stats.flag_rate ?? 0) * 100).toFixed(1)}%`,       color:"text-amber-400" },
    { label:"Avg Anomaly Score",  value: `${((stats.avg_anomaly_score ?? 0) * 100).toFixed(1)}%`, color:"text-slate-300" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.label} className="bg-slate-900/60 border border-slate-700/60 rounded-2xl px-6 py-5">
          <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">{item.label.toUpperCase()}</p>
          <p className={`text-3xl font-bold font-mono ${item.color}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}