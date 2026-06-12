const SIGNAL_META = {
  keystroke_fast:    { label:"Bot-like typing speed",       sev:"high",     icon:"⌨" },
  keystroke_normal:  { label:"Normal keystroke pattern",    sev:"safe",     icon:"⌨" },
  swipe_anomaly:     { label:"Swipe velocity anomaly",      sev:"high",     icon:"↔" },
  swipe_normal:      { label:"Normal swipe pattern",        sev:"safe",     icon:"↔" },
  new_device:        { label:"Unrecognised device",         sev:"critical", icon:"📱" },
  new_location:      { label:"New geographic location",     sev:"high",     icon:"📍" },
  vpn_detected:      { label:"VPN / proxy detected",        sev:"high",     icon:"🔒" },
  idle_long:         { label:"Extended idle period",        sev:"medium",   icon:"⏱" },
  transaction_large: { label:"High-value transaction",      sev:"medium",   icon:"₹" },
  transaction_normal:{ label:"Normal transaction amount",   sev:"safe",     icon:"₹" },
  multiple_failures: { label:"Repeated auth failures",      sev:"critical", icon:"🔑" },
};

const SEV = {
  critical:{ cls:"bg-red-500/10 text-red-400 border-red-500/30",   bar:"bg-red-500",    label:"CRITICAL" },
  high:    { cls:"bg-amber-500/10 text-amber-400 border-amber-500/30", bar:"bg-amber-500", label:"HIGH" },
  medium:  { cls:"bg-yellow-500/10 text-yellow-400 border-yellow-500/30", bar:"bg-yellow-500", label:"MEDIUM" },
  safe:    { cls:"bg-emerald-500/10 text-emerald-400 border-emerald-500/30", bar:"bg-emerald-500", label:"SAFE" },
};

export default function ExplainabilityPanel({ events = [], trustScore = 85 }) {
  const score = Math.round(trustScore);

  const dec = score >= 60
    ? { label:"Session allowed — no step-up required.", color:"text-emerald-400", bg:"bg-emerald-500/10", border:"border-emerald-500/30", badge:"ALLOW" }
    : score >= 40
    ? { label:"Trust below threshold — OTP verification required before sensitive operations.", color:"text-amber-400", bg:"bg-amber-500/10", border:"border-amber-500/30", badge:"OTP REQUIRED" }
    : { label:"Trust critically low — session frozen pending fraud team review.", color:"text-red-400", bg:"bg-red-500/10", border:"border-red-500/30", badge:"FREEZE" };

  const recent = [...events].reverse().slice(0, 5);
  const deductions = recent.filter(e => e.score_delta < 0);

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-slate-500 tracking-widest">EXPLAINABILITY ENGINE</p>
          <p className="text-sm text-slate-300 font-medium mt-0.5">Why this decision was made</p>
        </div>
        <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${dec.bg} ${dec.border} ${dec.color}`}>
          {dec.badge}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Risk factors */}
        <div>
          <p className="text-xs font-mono text-slate-500 tracking-widest mb-3">DETECTED RISK FACTORS</p>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-600">No signals recorded yet. Trigger signals to populate.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((ev, i) => {
                const meta = SIGNAL_META[ev.event_type] || { label:ev.event_type, sev:"medium", icon:"●" };
                const sev  = SEV[meta.sev];
                return (
                  <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3 border-l-2"
                    style={{ borderLeftColor: sev.cls.includes("red")?"#EF4444":sev.cls.includes("amber")?"#F59E0B":sev.cls.includes("emerald")?"#10B981":"#EAB308" }}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{meta.icon}</span>
                      <div>
                        <p className="text-sm text-white font-medium">{meta.label}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{new Date(ev.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${sev.cls}`}>{sev.label}</span>
                      <span className={`text-sm font-bold font-mono ${ev.score_delta < 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {ev.score_delta > 0 ? "+" : ""}{ev.score_delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Deduction bars */}
        {deductions.length > 0 && (
          <div>
            <p className="text-xs font-mono text-slate-500 tracking-widest mb-3">SCORE DEDUCTIONS</p>
            <div className="flex flex-col gap-2.5">
              {deductions.map((ev, i) => {
                const meta = SIGNAL_META[ev.event_type] || { label:ev.event_type };
                const pct  = Math.min(100, Math.abs(ev.score_delta) * 5);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <p className="text-xs text-slate-400 w-44 truncate shrink-0">{meta.label}</p>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full transition-all" style={{ width:`${pct}%` }}/>
                    </div>
                    <span className="text-xs font-mono text-red-400 font-semibold w-8 text-right shrink-0">{ev.score_delta}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Decision rationale */}
        <div className={`rounded-xl px-5 py-4 border ${dec.bg} ${dec.border}`}>
          <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">DECISION RATIONALE</p>
          <p className={`text-sm font-medium leading-relaxed ${dec.color}`}>
            Score {score}/100 — {dec.label}
          </p>
        </div>
      </div>
    </div>
  );
}