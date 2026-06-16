import { useState, useEffect } from "react";
import { adminAPI } from "../api";
import AppShell        from "../components/AppShell";
import AlertTable      from "../components/AlertTable";
import MLStatsBar      from "../components/MLStatsBar";
import AnomalyEventTable from "../components/AnomalyEventTable";
import AnomalyTimeline from "../components/AnomalyTimeline";
import TopRiskyUsers   from "../components/TopRiskyUsers";

function StatCard({ label, value, sub, color = "text-cyan-400" }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl px-6 py-5">
      <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">{label}</p>
      <p className={`text-4xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [alerts,      setAlerts]      = useState([]);
  const [sessions,    setSessions]    = useState([]);
  const [anomalies,   setAnomalies]   = useState([]);
  const [timeline,    setTimeline]    = useState([]);
  const [riskyUsers,  setRiskyUsers]  = useState([]);
  const [mlStats,     setMlStats]     = useState({});
  const [activeTab,   setActiveTab]   = useState("overview");

  const load = async () => {
    const [a, s, an, tl, ru, ms] = await Promise.all([
      adminAPI.alerts(),
      adminAPI.sessions(),
      adminAPI.anomalyEvents(),
      adminAPI.anomalyTimeline(),
      adminAPI.topRiskyUsers(),
      adminAPI.mlStats(),
    ]);
    setAlerts(a.data);
    setSessions(s.data);
    setAnomalies(an.data);
    setTimeline(tl.data);
    setRiskyUsers(ru.data);
    setMlStats(ms.data);
  };

  useEffect(() => { load(); }, []);

  const resolve  = async (id) => { await adminAPI.resolve(id);  load(); };
  const unfreeze = async (id) => { await adminAPI.unfreeze(id); load(); };

  const frozen     = sessions.filter(s => s.status === "frozen");
  const openAlerts = alerts.filter(a => !a.resolved).length;
  const avgScore   = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.trust_score, 0) / sessions.length)
    : 0;

  const TABS = [
    { key:"overview",  label:"Overview"   },
    { key:"ml",        label:"ML Intelligence" },
    { key:"alerts",    label:"Alerts"     },
    { key:"sessions",  label:"Sessions"   },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Fraud Operations Centre</h1>
            <p className="text-slate-400 text-sm mt-1">ML-powered anomaly detection · Real-time monitoring</p>
          </div>
          <button onClick={load}
            className="text-sm border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors font-mono">
            ↻ Refresh
          </button>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="TOTAL SESSIONS"   value={sessions.length}  sub={`${sessions.filter(s=>s.status==="active").length} active`}/>
          <StatCard label="OPEN ALERTS"      value={openAlerts}       color={openAlerts > 0 ? "text-red-400":"text-emerald-400"} sub="require action"/>
          <StatCard label="FROZEN SESSIONS"  value={frozen.length}    color={frozen.length > 0 ? "text-amber-400":"text-emerald-400"} sub="pending review"/>
          <StatCard label="AVG TRUST SCORE"  value={avgScore}         color={avgScore>=75?"text-emerald-400":avgScore>=45?"text-amber-400":"text-red-400"}/>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/60 border border-slate-700/60 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === t.key
                  ? "bg-cyan-500 text-slate-900 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
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

        {/* ── ML Intelligence tab ── */}
        {activeTab === "ml" && (
          <div className="flex flex-col gap-6">
            <MLStatsBar stats={mlStats}/>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <AnomalyTimeline data={timeline}/>
              <TopRiskyUsers users={riskyUsers}/>
            </div>
            <AnomalyEventTable events={anomalies}/>
          </div>
        )}

        {/* ── Alerts tab ── */}
        {activeTab === "alerts" && (
          <AlertTable alerts={alerts} onResolve={resolve}/>
        )}

        {/* ── Sessions tab ── */}
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
                        <td className="px-6 py-4">
                          <span className={`font-mono font-bold ${clr}`}>{sc}</span>
                          <span className="text-slate-500 text-xs">/100</span>
                        </td>
                        <td className="px-6 py-4"><span className={`text-xs font-mono font-semibold ${clr}`}>{lbl}</span></td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                            s.status==="active"?"bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            :s.status==="frozen"?"bg-red-500/10 text-red-400 border-red-500/30"
                            :"bg-slate-800 text-slate-400 border-slate-700"
                          }`}>{s.status.toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                          {new Date(s.created_at).toLocaleString()}
                        </td>
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