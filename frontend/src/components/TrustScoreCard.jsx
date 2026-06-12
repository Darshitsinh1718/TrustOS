export default function TrustScoreCard({ score = 85, status = "active", intervention = "allow" }) {
  const s = Math.round(score);

  const tier = s >= 70
    ? { label:"TRUSTED",      color:"#10B981", bg:"bg-emerald-500/10", border:"border-emerald-500/30", ring:"#10B981" }
    : s >= 40
    ? { label:"SUSPICIOUS",   color:"#F59E0B", bg:"bg-amber-500/10",   border:"border-amber-500/30",   ring:"#F59E0B" }
    : { label:"CRITICAL RISK",color:"#EF4444", bg:"bg-red-500/10",      border:"border-red-500/30",     ring:"#EF4444" };

  const dec = intervention === "allow"
    ? { label:"ALLOW",          color:"text-emerald-400", bg:"bg-emerald-500/10", border:"border-emerald-500/30" }
    : intervention === "challenge"
    ? { label:"OTP REQUIRED",   color:"text-amber-400",   bg:"bg-amber-500/10",   border:"border-amber-500/30"   }
    : { label:"SESSION FROZEN", color:"text-red-400",     bg:"bg-red-500/10",     border:"border-red-500/30"     };

  const R = 56, C = 2 * Math.PI * R;
  const dash = C - (s / 100) * C;

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-slate-500 tracking-widest">TRUST SCORE</p>
          <p className="text-xs text-slate-500 mt-0.5">Current session</p>
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${tier.bg} border ${tier.border}`}
          style={{ color: tier.color }}>
          {tier.label}
        </span>
      </div>

      {/* Ring + stats */}
      <div className="flex items-center gap-6">
        <div className="relative shrink-0 w-32 h-32">
          <svg width="128" height="128" viewBox="0 0 128 128" aria-label={`Trust score ${s} out of 100`}>
            <circle cx="64" cy="64" r={R} fill="none" stroke="#1E293B" strokeWidth="9"/>
            <circle cx="64" cy="64" r={R} fill="none" stroke={tier.ring} strokeWidth="9"
              strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dash}
              transform="rotate(-90 64 64)"
              style={{ transition:"stroke-dashoffset .6s ease,stroke .4s ease",
                       filter:`drop-shadow(0 0 6px ${tier.ring}55)` }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-mono leading-none" style={{ color:tier.ring }}>{s}</span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {[
            { label:"Risk Level", value:tier.label,     color:tier.color },
            { label:"Session",    value:status.toUpperCase(), color: status==="frozen"?"#EF4444":"#94A3B8" },
            { label:"Score Band", value:s>=70?"70–100":s>=40?"40–69":"0–39", color:"#94A3B8" },
          ].map(r => (
            <div key={r.label}>
              <p className="text-xs text-slate-500 mb-0.5">{r.label}</p>
              <p className="text-sm font-semibold font-mono" style={{ color:r.color }}>{r.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decision banner */}
      <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${dec.bg} border ${dec.border}`}>
        <span className="text-xs text-slate-400 font-mono">DECISION</span>
        <div className="flex items-center gap-2">
          {intervention !== "allow" && (
            <span className={`w-2 h-2 rounded-full dot-pulse inline-block ${
              intervention === "challenge" ? "bg-amber-400" : "bg-red-400"
            }`}/>
          )}
          <span className={`text-sm font-bold font-mono ${dec.color}`}>{dec.label}</span>
        </div>
      </div>
    </div>
  );
}