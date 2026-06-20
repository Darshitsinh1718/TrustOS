// import { useState, useEffect } from "react";
// import { adminAPI } from "../api";
// import AppShell        from "../components/AppShell";
// import AlertTable      from "../components/AlertTable";
// import MLStatsBar      from "../components/MLStatsBar";
// import AnomalyEventTable from "../components/AnomalyEventTable";
// import AnomalyTimeline from "../components/AnomalyTimeline";
// import TopRiskyUsers   from "../components/TopRiskyUsers";

// function StatCard({ label, value, sub, color = "text-cyan-400" }) {
//   return (
//     <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl px-6 py-5">
//       <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">{label}</p>
//       <p className={`text-4xl font-bold font-mono ${color}`}>{value}</p>
//       {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
//     </div>
//   );
// }

// export default function AdminDashboard() {
//   const [alerts,      setAlerts]      = useState([]);
//   const [sessions,    setSessions]    = useState([]);
//   const [anomalies,   setAnomalies]   = useState([]);
//   const [timeline,    setTimeline]    = useState([]);
//   const [riskyUsers,  setRiskyUsers]  = useState([]);
//   const [mlStats,     setMlStats]     = useState({});
//   const [activeTab,   setActiveTab]   = useState("overview");

//   const load = async () => {
//     const [a, s, an, tl, ru, ms] = await Promise.all([
//       adminAPI.alerts(),
//       adminAPI.sessions(),
//       adminAPI.anomalyEvents(),
//       adminAPI.anomalyTimeline(),
//       adminAPI.topRiskyUsers(),
//       adminAPI.mlStats(),
//     ]);
//     setAlerts(a.data);
//     setSessions(s.data);
//     setAnomalies(an.data);
//     setTimeline(tl.data);
//     setRiskyUsers(ru.data);
//     setMlStats(ms.data);
//   };

//   useEffect(() => { load(); }, []);

//   const resolve  = async (id) => { await adminAPI.resolve(id);  load(); };
//   const unfreeze = async (id) => { await adminAPI.unfreeze(id); load(); };

//   const frozen     = sessions.filter(s => s.status === "frozen");
//   const openAlerts = alerts.filter(a => !a.resolved).length;
//   const avgScore   = sessions.length
//     ? Math.round(sessions.reduce((a, s) => a + s.trust_score, 0) / sessions.length)
//     : 0;

//   const TABS = [
//     { key:"overview",  label:"Overview"   },
//     { key:"ml",        label:"ML Intelligence" },
//     { key:"alerts",    label:"Alerts"     },
//     { key:"sessions",  label:"Sessions"   },
//   ];

//   return (
//     <AppShell>
//       <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-white">Fraud Operations Centre</h1>
//             <p className="text-slate-400 text-sm mt-1">ML-powered anomaly detection · Real-time monitoring</p>
//           </div>
//           <button onClick={load}
//             className="text-sm border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors font-mono">
//             ↻ Refresh
//           </button>
//         </div>

//         {/* Top stats */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           <StatCard label="TOTAL SESSIONS"   value={sessions.length}  sub={`${sessions.filter(s=>s.status==="active").length} active`}/>
//           <StatCard label="OPEN ALERTS"      value={openAlerts}       color={openAlerts > 0 ? "text-red-400":"text-emerald-400"} sub="require action"/>
//           <StatCard label="FROZEN SESSIONS"  value={frozen.length}    color={frozen.length > 0 ? "text-amber-400":"text-emerald-400"} sub="pending review"/>
//           <StatCard label="AVG TRUST SCORE"  value={avgScore}         color={avgScore>=75?"text-emerald-400":avgScore>=45?"text-amber-400":"text-red-400"}/>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-1 bg-slate-900/60 border border-slate-700/60 rounded-xl p-1 w-fit">
//           {TABS.map(t => (
//             <button key={t.key} onClick={() => setActiveTab(t.key)}
//               className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                 activeTab === t.key
//                   ? "bg-cyan-500 text-slate-900 font-bold"
//                   : "text-slate-400 hover:text-slate-200"
//               }`}>
//               {t.label}
//             </button>
//           ))}
//         </div>

//         {/* ── Overview tab ── */}
//         {activeTab === "overview" && (
//           <div className="flex flex-col gap-6">
//             {frozen.length > 0 && (
//               <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl overflow-hidden">
//                 <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
//                   <span className="w-2 h-2 rounded-full bg-amber-400 dot-pulse inline-block"/>
//                   <p className="text-sm font-semibold text-amber-400">Frozen Sessions</p>
//                 </div>
//                 <div className="p-4 flex flex-col gap-2">
//                   {frozen.map(s => (
//                     <div key={s.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/60 rounded-xl px-5 py-3">
//                       <div className="flex gap-6">
//                         <div><p className="text-xs text-slate-500">SESSION</p><p className="text-sm font-mono text-white">#{s.id}</p></div>
//                         <div><p className="text-xs text-slate-500">USER</p><p className="text-sm font-mono text-slate-300">UID-{s.user_id}</p></div>
//                         <div><p className="text-xs text-slate-500">TRUST</p><p className="text-sm font-mono font-bold text-red-400">{Math.round(s.trust_score)}/100</p></div>
//                       </div>
//                       <button onClick={() => unfreeze(s.id)}
//                         className="text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg transition-colors">
//                         Unfreeze
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//             <AlertTable alerts={alerts.slice(0,10)} onResolve={resolve}/>
//           </div>
//         )}

//         {/* ── ML Intelligence tab ── */}
//         {activeTab === "ml" && (
//           <div className="flex flex-col gap-6">
//             <MLStatsBar stats={mlStats}/>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//               <AnomalyTimeline data={timeline}/>
//               <TopRiskyUsers users={riskyUsers}/>
//             </div>
//             <AnomalyEventTable events={anomalies}/>
//           </div>
//         )}

//         {/* ── Alerts tab ── */}
//         {activeTab === "alerts" && (
//           <AlertTable alerts={alerts} onResolve={resolve}/>
//         )}

//         {/* ── Sessions tab ── */}
//         {activeTab === "sessions" && (
//           <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-800">
//               <p className="text-xs font-mono text-slate-500 tracking-widest">ALL SESSIONS</p>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-slate-800">
//                     {["Session","User","Trust Score","Risk","Status","Started"].map(h => (
//                       <th key={h} className="px-6 py-3 text-left text-xs font-mono text-slate-500 tracking-wider">{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {sessions.map(s => {
//                     const sc  = Math.round(s.trust_score);
//                     const clr = sc >= 75 ? "text-emerald-400" : sc >= 45 ? "text-amber-400" : "text-red-400";
//                     const lbl = sc >= 75 ? "Low" : sc >= 45 ? "Medium" : "High";
//                     return (
//                       <tr key={s.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
//                         <td className="px-6 py-4 font-mono text-white">#{s.id}</td>
//                         <td className="px-6 py-4 font-mono text-slate-300">UID-{s.user_id}</td>
//                         <td className="px-6 py-4">
//                           <span className={`font-mono font-bold ${clr}`}>{sc}</span>
//                           <span className="text-slate-500 text-xs">/100</span>
//                         </td>
//                         <td className="px-6 py-4"><span className={`text-xs font-mono font-semibold ${clr}`}>{lbl}</span></td>
//                         <td className="px-6 py-4">
//                           <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
//                             s.status==="active"?"bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
//                             :s.status==="frozen"?"bg-red-500/10 text-red-400 border-red-500/30"
//                             :"bg-slate-800 text-slate-400 border-slate-700"
//                           }`}>{s.status.toUpperCase()}</span>
//                         </td>
//                         <td className="px-6 py-4 text-slate-400 font-mono text-xs">
//                           {new Date(s.created_at).toLocaleString()}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//       </div>
//     </AppShell>
//   );
// }
import { useState, useEffect } from "react";
import { adminAPI } from "../api";
import AppShell   from "../components/AppShell";
import AlertTable from "../components/AlertTable";

function StatCard({ label, value, sub, color = "text-cyan-400" }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl px-6 py-5">
      <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">{label}</p>
      <p className={`text-4xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function parseFraudInfo(message = "") {
  const probMatch = message.match(/probability\s+([\d.]+)%/i);
  return {
    probability: probMatch ? parseFloat(probMatch[1]) : null,
    isMlAlert:   message.toLowerCase().includes("ieee-cis"),
  };
}

export default function AdminDashboard() {
  const [alerts,    setAlerts]    = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const load = async () => {
    const [a, s, m] = await Promise.all([
      adminAPI.alerts(),
      adminAPI.sessions(),
      adminAPI.modelInfo(),
    ]);
    setAlerts(a.data);
    setSessions(s.data);
    setModelInfo(m.data);
  };

  useEffect(() => { load(); }, []);

  const resolve  = async (id) => { await adminAPI.resolve(id);  load(); };
  const unfreeze = async (id) => { await adminAPI.unfreeze(id); load(); };

  const frozen      = sessions.filter(s => s.status === "frozen");
  const openAlerts  = alerts.filter(a => !a.resolved).length;
  const mlAlerts    = alerts.filter(a => a.alert_type === "ML_FRAUD_DETECTED");
  const avgScore    = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.trust_score, 0) / sessions.length)
    : 0;
  const metrics = modelInfo?.metrics || {};

  const TABS = [
    { key:"overview", label:"Overview"      },
    { key:"ml",       label:"Fraud Model"   },
    { key:"alerts",   label:"Alerts"        },
    { key:"sessions", label:"Sessions"      },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Fraud Operations Centre</h1>
            <p className="text-slate-400 text-sm mt-1">IEEE-CIS transaction fraud model · Real-time monitoring</p>
          </div>
          <button onClick={load}
            className="text-sm border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors font-mono">
            ↻ Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="TOTAL SESSIONS"  value={sessions.length} sub={`${sessions.filter(s=>s.status==="active").length} active`}/>
          <StatCard label="OPEN ALERTS"     value={openAlerts}      color={openAlerts > 0 ? "text-red-400":"text-emerald-400"} sub="require action"/>
          <StatCard label="ML FRAUD ALERTS" value={mlAlerts.length} color={mlAlerts.length > 0 ? "text-red-400":"text-emerald-400"} sub="from IEEE-CIS model"/>
          <StatCard label="AVG TRUST SCORE" value={avgScore}        color={avgScore>=75?"text-emerald-400":avgScore>=45?"text-amber-400":"text-red-400"}/>
        </div>

        <div className="flex gap-1 bg-slate-900/60 border border-slate-700/60 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === t.key ? "bg-cyan-500 text-slate-900 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            {frozen.length > 0 && (
              <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 dot-pulse inline-block"/>
                  <p className="text-sm font-semibold text-amber-400">Frozen Sessions</p>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {frozen.map(s => (
                    <div key={s.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/60 rounded-xl px-5 py-3">
                      <div className="flex gap-6">
                        <div><p className="text-xs text-slate-500">SESSION</p><p className="text-sm font-mono text-white">#{s.id}</p></div>
                        <div><p className="text-xs text-slate-500">USER</p><p className="text-sm font-mono text-slate-300">UID-{s.user_id}</p></div>
                        <div><p className="text-xs text-slate-500">TRUST</p><p className="text-sm font-mono font-bold text-red-400">{Math.round(s.trust_score)}/100</p></div>
                      </div>
                      <button onClick={() => unfreeze(s.id)}
                        className="text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg transition-colors">
                        Unfreeze
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <AlertTable alerts={alerts.slice(0,10)} onResolve={resolve}/>
          </div>
        )}

        {/* Fraud Model tab */}
        {activeTab === "ml" && (
          <div className="flex flex-col gap-6">

            {/* Model metadata card */}
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800">
                <p className="text-xs font-mono text-slate-500 tracking-widest">MODEL METADATA</p>
                <p className="text-sm text-slate-300 font-medium mt-0.5">IEEE-CIS trained fraud detection model</p>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label:"Model",     value: modelInfo?.model_name || "—" },
                  { label:"Dataset",   value: modelInfo?.dataset_name || "—" },
                  { label:"Features",  value: modelInfo?.feature_count ?? "—" },
                  { label:"Trained",   value: modelInfo?.trained_at ? new Date(modelInfo.trained_at).toLocaleDateString() : "—" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                    <p className="text-sm font-bold font-mono text-cyan-400 truncate">{s.value}</p>
                  </div>
                ))}
              </div>
              {metrics.accuracy !== undefined && (
                <div className="px-6 pb-6">
                  <p className="text-xs text-slate-500 font-mono tracking-widest mb-2">TRAINING METRICS</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      ["Accuracy", metrics.accuracy],
                      ["Precision", metrics.precision],
                      ["Recall", metrics.recall],
                      ["F1", metrics.f1_score],
                      ["ROC-AUC", metrics.roc_auc],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="text-sm font-bold font-mono text-white">{val?.toFixed(3) ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ML-generated alerts */}
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800">
                <p className="text-xs font-mono text-slate-500 tracking-widest">ML FRAUD ALERTS</p>
                <p className="text-sm text-slate-300 font-medium mt-0.5">Alerts raised by the IEEE-CIS model</p>
              </div>
              {mlAlerts.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
                  No ML fraud alerts yet.
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-2">
                  {mlAlerts.map(a => {
                    const info = parseFraudInfo(a.message);
                    return (
                      <div key={a.id} className="bg-slate-800/50 border border-red-500/20 border-l-4 border-l-red-500 rounded-xl px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-white">Alert #{String(a.id).padStart(4,"0")} · Session #{a.session_id}</p>
                          {info.probability !== null && (
                            <span className="text-xs font-mono font-bold bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-1 rounded-md">
                              {info.probability}% FRAUD
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300">{a.message}</p>
                        <p className="text-xs text-slate-500 font-mono mt-2">
                          {new Date(a.timestamp).toLocaleString()} · UID-{a.user_id}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts tab */}
        {activeTab === "alerts" && (
          <AlertTable alerts={alerts} onResolve={resolve}/>
        )}

        {/* Sessions tab */}
        {activeTab === "sessions" && (
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <p className="text-xs font-mono text-slate-500 tracking-widest">ALL SESSIONS</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["Session","User","Trust Score","Risk","Status","Started"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-mono text-slate-500 tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => {
                    const sc  = Math.round(s.trust_score);
                    const clr = sc >= 75 ? "text-emerald-400" : sc >= 45 ? "text-amber-400" : "text-red-400";
                    const lbl = sc >= 75 ? "Low" : sc >= 45 ? "Medium" : "High";
                    return (
                      <tr key={s.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-white">#{s.id}</td>
                        <td className="px-6 py-4 font-mono text-slate-300">UID-{s.user_id}</td>
                        <td className="px-6 py-4"><span className={`font-mono font-bold ${clr}`}>{sc}</span><span className="text-slate-500 text-xs">/100</span></td>
                        <td className="px-6 py-4"><span className={`text-xs font-mono font-semibold ${clr}`}>{lbl}</span></td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                            s.status==="active"?"bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            :s.status==="frozen"?"bg-red-500/10 text-red-400 border-red-500/30"
                            :"bg-slate-800 text-slate-400 border-slate-700"
                          }`}>{s.status.toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{new Date(s.created_at).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}