// import { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { sessionAPI } from "../api";
// import AppShell            from "../components/AppShell";
// import TrustScoreCard      from "../components/TrustScoreCard";
// import ExplainabilityPanel from "../components/ExplainabilityPanel";
// import RiskTimeline        from "../components/RiskTimeline";
// import MLSignalPanel       from "../components/MLSignalPanel";

// const SIGNALS = [
//   { key:"keystroke_normal", label:"Normal keystroke", risk:"safe"     },
//   { key:"swipe_normal",     label:"Normal swipe",     risk:"safe"     },
//   { key:"keystroke_fast",   label:"Bot-like typing",  risk:"high"     },
//   { key:"swipe_anomaly",    label:"Swipe anomaly",    risk:"high"     },
//   { key:"new_device",       label:"New device",       risk:"critical" },
//   { key:"new_location",     label:"New location",     risk:"high"     },
//   { key:"vpn_detected",     label:"VPN detected",     risk:"high"     },
//   { key:"idle_long",        label:"Long idle",        risk:"medium"   },
// ];

// const RISK_BTN = {
//   safe:    "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
//   medium:  "bg-amber-500/10   border-amber-500/30   text-amber-400   hover:bg-amber-500/20",
//   high:    "bg-red-500/10     border-red-500/30     text-red-400     hover:bg-red-500/20",
//   critical:"bg-red-600/15     border-red-600/40     text-red-300     hover:bg-red-600/25",
// };

// export default function UserDashboard() {
//   const [session,    setSession]    = useState(null);
//   const [events,     setEvents]     = useState([]);
//   const [lastResult, setLastResult] = useState(null);
//   const [mlResult,   setMlResult]   = useState(null);
//   const [loading,    setLoading]    = useState(false);
//   const navigate = useNavigate();

//   const refresh = useCallback(async () => {
//     try {
//       const [s, e] = await Promise.all([sessionAPI.current(), sessionAPI.events()]);
//       setSession(s.data);
//       setEvents(e.data);
//     } catch {
//       localStorage.removeItem("token");
//       navigate("/login");
//     }
//   }, [navigate]);

//   useEffect(() => { refresh(); }, [refresh]);

//   const sendSignal = async (key) => {
//     setLoading(true);
//     try {
//       const res = await sessionAPI.signal(key);
//       setLastResult(res.data);
//       await refresh();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMLResult = async (result) => {
//     setMlResult(result);
//     await refresh();
//   };

//   const score        = session?.trust_score ?? 85;
//   const intervention = score >= 75 ? "allow" : score >= 45 ? "challenge" : "freeze";

//   return (
//     <AppShell>
//       <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-white">Session Monitor</h1>
//             <p className="text-slate-400 text-sm mt-1">Rule-based + ML continuous identity trust</p>
//           </div>
//           <button onClick={() => navigate("/transaction")}
//             className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
//             + New Transaction
//           </button>
//         </div>

//         {/* Frozen banner */}
//         {session?.status === "frozen" && (
//           <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4">
//             <span className="w-2 h-2 rounded-full bg-red-400 dot-pulse inline-block shrink-0"/>
//             <div>
//               <p className="text-sm font-semibold">Session frozen — high-risk activity detected</p>
//               <p className="text-xs text-red-400/70 mt-0.5">Contact admin to unfreeze.</p>
//             </div>
//           </div>
//         )}

//         {/* ML result banner */}
//         {mlResult && (
//           <div className={`flex flex-wrap items-center gap-4 rounded-xl px-5 py-4 border ${
//             mlResult.decision?.includes("ALLOW")
//               ? "bg-emerald-500/10 border-emerald-500/30"
//               : mlResult.decision?.includes("OTP")
//               ? "bg-amber-500/10 border-amber-500/30"
//               : "bg-red-500/10 border-red-500/30"
//           }`}>
//             <div>
//               <p className="text-xs text-slate-500 font-mono">ML DECISION</p>
//               <p className={`text-base font-bold font-mono ${
//                 mlResult.decision?.includes("ALLOW") ? "text-emerald-400"
//                 : mlResult.decision?.includes("OTP") ? "text-amber-400"
//                 : "text-red-400"
//               }`}>{mlResult.decision}</p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500 font-mono">ANOMALY SCORE</p>
//               <p className="text-base font-bold font-mono text-white">
//                 {(mlResult.anomaly_score * 100).toFixed(1)}%
//               </p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500 font-mono">PENALTY APPLIED</p>
//               <p className="text-base font-bold font-mono text-red-400">−{mlResult.risk_penalty} pts</p>
//             </div>
//             <p className="text-sm text-slate-300 flex-1">{mlResult.reason}</p>
//           </div>
//         )}

//         {/* Score + rule signals */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//           <TrustScoreCard score={score} status={session?.status ?? "active"} intervention={intervention}/>

//           <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6">
//             <p className="text-xs font-mono text-slate-500 tracking-widest mb-1">RULE-BASED SIGNALS</p>
//             <p className="text-sm text-slate-300 font-medium mb-4">Trigger manual behaviour events</p>
//             <div className="flex flex-wrap gap-2 mb-4">
//               {SIGNALS.map(sig => (
//                 <button key={sig.key} onClick={() => sendSignal(sig.key)} disabled={loading}
//                   className={`border rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${RISK_BTN[sig.risk]}`}>
//                   {sig.label}
//                 </button>
//               ))}
//             </div>

//             {lastResult ? (
//               <div className="bg-slate-800/60 rounded-xl px-5 py-4 flex flex-wrap gap-4 items-center border border-slate-700/60">
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs text-slate-500 font-mono">LAST SIGNAL</p>
//                   <p className="text-sm text-white font-medium mt-0.5 truncate">{lastResult.reason}</p>
//                 </div>
//                 {[
//                   { label:"Delta", value: `${lastResult.delta > 0 ? "+" : ""}${lastResult.delta}`, color: lastResult.delta < 0 ? "text-red-400" : "text-emerald-400" },
//                   { label:"Score", value: Math.round(lastResult.trust_score), color:"text-white" },
//                   { label:"Action", value: lastResult.intervention?.toUpperCase(), color: lastResult.intervention === "allow" ? "text-emerald-400" : lastResult.intervention === "challenge" ? "text-amber-400" : "text-red-400" },
//                 ].map(s => (
//                   <div key={s.label} className="text-center">
//                     <p className="text-xs text-slate-500">{s.label}</p>
//                     <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="bg-slate-800/40 rounded-xl px-5 py-4 text-sm text-slate-600 border border-slate-700/40 border-dashed text-center">
//                 Trigger a signal above to see real-time score changes
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ML signal panel */}
//         <MLSignalPanel onResult={handleMLResult}/>

//         {/* Explainability + timeline */}
//         <ExplainabilityPanel events={events} trustScore={score}/>
//         <RiskTimeline events={events}/>
//       </div>
//     </AppShell>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sessionAPI } from "../api";
import AppShell                  from "../components/AppShell";
import TrustScoreCard            from "../components/TrustScoreCard";
import ExplainabilityPanel       from "../components/ExplainabilityPanel";
import RiskTimeline              from "../components/RiskTimeline";
import FraudIntelligencePanel    from "../components/FraudIntelligencePanel";

const SIGNALS = [
  { key:"keystroke_normal", label:"Normal keystroke", risk:"safe"     },
  { key:"swipe_normal",     label:"Normal swipe",     risk:"safe"     },
  { key:"keystroke_fast",   label:"Bot-like typing",  risk:"high"     },
  { key:"swipe_anomaly",    label:"Swipe anomaly",    risk:"high"     },
  { key:"new_device",       label:"New device",       risk:"critical" },
  { key:"new_location",     label:"New location",     risk:"high"     },
  { key:"vpn_detected",     label:"VPN detected",     risk:"high"     },
  { key:"idle_long",        label:"Long idle",        risk:"medium"   },
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
  const [lastFraud,  setLastFraud]  = useState(null);
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

  useEffect(() => {
    refresh();
    // Pick up the last fraud-check result if Transaction.jsx stored one
    const stored = sessionStorage.getItem("lastFraudResult");
    if (stored) setLastFraud(JSON.parse(stored));
  }, [refresh]);

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
  const intervention = score >= 75 ? "allow" : score >= 45 ? "challenge" : "freeze";

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Session Monitor</h1>
            <p className="text-slate-400 text-sm mt-1">Rule-based trust score + IEEE-CIS transaction fraud model</p>
          </div>
          <button onClick={() => navigate("/transaction")}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
            + New Transaction
          </button>
        </div>

        {/* Frozen banner */}
        {session?.status === "frozen" && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4">
            <span className="w-2 h-2 rounded-full bg-red-400 dot-pulse inline-block shrink-0"/>
            <div>
              <p className="text-sm font-semibold">Session frozen — high-risk activity detected</p>
              <p className="text-xs text-red-400/70 mt-0.5">Contact admin to unfreeze.</p>
            </div>
          </div>
        )}

        {/* Score + rule signals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <TrustScoreCard score={score} status={session?.status ?? "active"} intervention={intervention}/>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6">
            <p className="text-xs font-mono text-slate-500 tracking-widest mb-1">RULE-BASED SIGNALS</p>
            <p className="text-sm text-slate-300 font-medium mb-4">Trigger manual behaviour events</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SIGNALS.map(sig => (
                <button key={sig.key} onClick={() => sendSignal(sig.key)} disabled={loading}
                  className={`border rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${RISK_BTN[sig.risk]}`}>
                  {sig.label}
                </button>
              ))}
            </div>

            {lastResult ? (
              <div className="bg-slate-800/60 rounded-xl px-5 py-4 flex flex-wrap gap-4 items-center border border-slate-700/60">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-mono">LAST SIGNAL</p>
                  <p className="text-sm text-white font-medium mt-0.5 truncate">{lastResult.reason}</p>
                </div>
                {[
                  { label:"Delta",  value: `${lastResult.delta > 0 ? "+" : ""}${lastResult.delta}`, color: lastResult.delta < 0 ? "text-red-400" : "text-emerald-400" },
                  { label:"Score",  value: Math.round(lastResult.trust_score), color:"text-white" },
                  { label:"Action", value: lastResult.intervention?.toUpperCase(), color: lastResult.intervention === "allow" ? "text-emerald-400" : lastResult.intervention === "challenge" ? "text-amber-400" : "text-red-400" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/40 rounded-xl px-5 py-4 text-sm text-slate-600 border border-slate-700/40 border-dashed text-center">
                Trigger a signal above to see real-time score changes
              </div>
            )}
          </div>
        </div>

        {/* IEEE-CIS Transaction Fraud Intelligence */}
        <FraudIntelligencePanel lastResult={lastFraud}/>

        {/* Explainability + timeline */}
        <ExplainabilityPanel events={events} trustScore={score}/>
        <RiskTimeline events={events}/>
      </div>
    </AppShell>
  );
}