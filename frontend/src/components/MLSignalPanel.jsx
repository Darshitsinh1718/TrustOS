import { useState } from "react";
import { sessionAPI } from "../api";

const PRESETS = [
  {
    label:  "Normal Session",
    risk:   "safe",
    data:   { login_hour:10, transaction_amount:12000, typing_speed:55, mouse_speed:45, device_known:1, location_known:1 },
  },
  {
    label:  "Off-Hours Login",
    risk:   "medium",
    data:   { login_hour:3, transaction_amount:5000, typing_speed:50, mouse_speed:40, device_known:1, location_known:1 },
  },
  {
    label:  "Unknown Device",
    risk:   "high",
    data:   { login_hour:14, transaction_amount:8000, typing_speed:60, mouse_speed:50, device_known:0, location_known:0 },
  },
  {
    label:  "Large Transaction",
    risk:   "high",
    data:   { login_hour:2, transaction_amount:95000, typing_speed:120, mouse_speed:5, device_known:0, location_known:0 },
  },
];

const RISK_BTN = {
  safe:   "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
  medium: "bg-amber-500/10   border-amber-500/30   text-amber-400   hover:bg-amber-500/20",
  high:   "bg-red-500/10     border-red-500/30     text-red-400     hover:bg-red-500/20",
};

const FIELDS = [
  { key:"login_hour",          label:"Login Hour (0–23)",   type:"number", min:0,  max:23    },
  { key:"transaction_amount",  label:"Transaction (₹)",     type:"number", min:0              },
  { key:"typing_speed",        label:"Typing Speed (WPM)",  type:"number", min:0              },
  { key:"mouse_speed",         label:"Mouse Speed",         type:"number", min:0              },
  { key:"device_known",        label:"Device Known (0/1)",  type:"number", min:0,  max:1     },
  { key:"location_known",      label:"Location Known (0/1)",type:"number", min:0,  max:1     },
];

export default function MLSignalPanel({ onResult }) {
  const [form, setForm] = useState({
    login_hour:10, transaction_amount:5000,
    typing_speed:55, mouse_speed:45,
    device_known:1, location_known:1,
  });
  const [loading, setLoading] = useState(false);
  const [last,    setLast]    = useState(null);

  const submit = async (data = form) => {
    setLoading(true);
    try {
      const res = await sessionAPI.mlSignal(data);
      setLast(res.data);
      onResult?.(res.data);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (p) => {
    setForm(p.data);
    submit(p.data);
  };

  const decisionColor = (d = "") =>
    d.includes("ALLOW")  ? "text-emerald-400"
    : d.includes("OTP")  ? "text-amber-400"
    : "text-red-400";

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <p className="text-xs font-mono text-slate-500 tracking-widest">ML ANOMALY ENGINE</p>
        <p className="text-sm text-slate-300 font-medium mt-0.5">Isolation Forest · Real-time inference</p>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Presets */}
        <div>
          <p className="text-xs text-slate-500 font-mono tracking-widest mb-2">QUICK PRESETS</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => loadPreset(p)} disabled={loading}
                className={`border rounded-lg px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${RISK_BTN[p.risk]}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual inputs */}
        <div>
          <p className="text-xs text-slate-500 font-mono tracking-widest mb-3">MANUAL INPUTS</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  min={f.min} max={f.max}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2
                             text-sm text-white font-mono focus:outline-none focus:border-cyan-500
                             focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                />
              </div>
            ))}
          </div>
          <button onClick={() => submit()} disabled={loading}
            className="mt-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-900
                       font-bold px-6 py-2.5 rounded-lg text-sm transition-colors
                       shadow-[0_0_14px_rgba(34,211,238,.2)]">
            {loading ? "Running ML…" : "Run ML Analysis →"}
          </button>
        </div>

        {/* Result */}
        {last && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <p className="text-xs font-mono text-slate-500 tracking-widest mb-4">ML RESULT</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label:"Trust Score",    value:`${last.trust_score}/100`,          color: last.trust_score >= 75 ? "text-emerald-400" : last.trust_score >= 45 ? "text-amber-400" : "text-red-400" },
                { label:"Anomaly Score",  value:last.anomaly_score.toFixed(3),       color: last.anomaly_score > 0.6 ? "text-red-400" : "text-amber-400" },
                { label:"Risk Level",     value:last.risk_level,                     color: last.risk_level === "LOW" ? "text-emerald-400" : last.risk_level === "MEDIUM" ? "text-amber-400" : "text-red-400" },
                { label:"Penalty",        value:`−${last.risk_penalty} pts`,         color:"text-red-400" },
              ].map(s => (
                <div key={s.label} className="bg-slate-900/60 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Decision */}
            <div className={`flex items-center justify-between rounded-lg px-4 py-3 border ${
              last.decision.includes("ALLOW")
                ? "bg-emerald-500/10 border-emerald-500/30"
                : last.decision.includes("OTP")
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}>
              <span className="text-xs text-slate-400 font-mono">DECISION</span>
              <span className={`text-sm font-bold font-mono ${decisionColor(last.decision)}`}>
                {last.decision}
              </span>
            </div>

            {/* Reason */}
            <div className="mt-3 bg-slate-900/60 rounded-lg px-4 py-3">
              <p className="text-xs text-slate-500 font-mono mb-1">EXPLANATION</p>
              <p className="text-sm text-slate-300 leading-relaxed">{last.reason}</p>
            </div>

            {/* Anomaly bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Anomaly Score</span>
                <span className="font-mono">{(last.anomaly_score * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${last.anomaly_score * 100}%`,
                    background: last.anomaly_score > 0.6
                      ? "linear-gradient(90deg,#F59E0B,#EF4444)"
                      : "linear-gradient(90deg,#10B981,#22D3EE)",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
