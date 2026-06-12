import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sessionAPI } from "../api";
import AppShell           from "../components/AppShell";
import TrustScoreCard     from "../components/TrustScoreCard";
import ExplainabilityPanel from "../components/ExplainabilityPanel";
import RiskTimeline       from "../components/RiskTimeline";

const SIGNALS = [
  { key:"keystroke_normal",  label:"Normal keystroke",    risk:"safe"   },
  { key:"swipe_normal",      label:"Normal swipe",        risk:"safe"   },
  { key:"keystroke_fast",    label:"Bot-like typing",     risk:"high"   },
  { key:"swipe_anomaly",     label:"Swipe anomaly",       risk:"high"   },
  { key:"new_device",        label:"New device",          risk:"critical" },
  { key:"new_location",      label:"New location",        risk:"high"   },
  { key:"vpn_detected",      label:"VPN detected",        risk:"high"   },
  { key:"idle_long",         label:"Long idle",           risk:"medium" },
];

const RISK_BTN = {
  safe:    "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
  medium:  "bg-amber-500/10   border-amber-500/30   text-amber-400   hover:bg-amber-500/20",
  high:    "bg-red-500/10     border-red-500/30     text-red-400     hover:bg-red-500/20",
  critical:"bg-red-600/15     border-red-600/40     text-red-300     hover:bg-red-600/25",
};

export default function UserDashboard() {
  const [session,    setSession]    = useState(null);
  const [events,     setEvents]     = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([sessionAPI.current(), sessionAPI.events()]);
      setSession(s.data);
      setEvents(e.data);
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => { refresh(); }, [refresh]);

  const sendSignal = async (key) => {
    setLoading(true);
    try {
      const res = await sessionAPI.signal(key);
      setLastResult(res.data);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const score        = session?.trust_score ?? 85;
  const intervention = score >= 60 ? "allow" : score >= 40 ? "challenge" : "freeze";

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Session Monitor</h1>
            <p className="text-slate-400 text-sm mt-1">Continuous identity trust — live session view</p>
          </div>
          <button onClick={() => navigate("/transaction")}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-[0_0_16px_rgba(34,211,238,.2)]">
            + New Transaction
          </button>
        </div>

        {/* Frozen banner */}
        {session?.status === "frozen" && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4">
            <span className="w-2 h-2 rounded-full bg-red-400 dot-pulse inline-block shrink-0"/>
            <div>
              <p className="text-sm font-semibold">Session frozen — high-risk activity detected</p>
              <p className="text-xs text-red-400/70 mt-0.5">Contact the admin to unfreeze this session.</p>
            </div>
          </div>
        )}

        {/* Top row: score + signals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Trust score card */}
          <TrustScoreCard score={score} status={session?.status ?? "active"} intervention={intervention}/>

          {/* Signal simulator */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6">
            <p className="text-xs font-mono text-slate-500 tracking-widest mb-1">BEHAVIOUR SIGNAL SIMULATOR</p>
            <p className="text-sm text-slate-300 font-medium mb-4">
              Trigger events to change the trust score in real time
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {SIGNALS.map(sig => (
                <button key={sig.key}
                  onClick={() => sendSignal(sig.key)}
                  disabled={loading}
                  className={`border rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${RISK_BTN[sig.risk]}`}>
                  {sig.label}
                </button>
              ))}
            </div>

            {/* Last signal feedback */}
            {lastResult ? (
              <div className="bg-slate-800/60 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 border border-slate-700/60">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-mono mb-1">LAST SIGNAL</p>
                  <p className="text-sm text-white font-medium">{lastResult.reason}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-0.5">Delta</p>
                    <p className={`text-lg font-bold font-mono ${lastResult.delta < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {lastResult.delta > 0 ? "+" : ""}{lastResult.delta}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-0.5">New Score</p>
                    <p className="text-lg font-bold font-mono text-white">{Math.round(lastResult.trust_score)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-0.5">Decision</p>
                    <p className={`text-sm font-bold font-mono ${
                      lastResult.intervention === "allow" ? "text-emerald-400"
                      : lastResult.intervention === "challenge" ? "text-amber-400"
                      : "text-red-400"
                    }`}>
                      {lastResult.intervention?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/40 rounded-xl px-5 py-4 text-sm text-slate-600 border border-slate-700/40 border-dashed text-center">
                Trigger a signal above to see real-time score changes
              </div>
            )}
          </div>
        </div>

        {/* Explainability panel */}
        <div className="mb-5">
          <ExplainabilityPanel events={events} trustScore={score}/>
        </div>

        {/* Timeline */}
        <RiskTimeline events={events}/>
      </div>
    </AppShell>
  );
}