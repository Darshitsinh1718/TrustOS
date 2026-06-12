import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── Animated trust ring ─────────────────────────────────────── */
function LiveRing() {
  const [score, setScore] = useState(87);
  const dirRef = useRef(-1);
  useEffect(() => {
    const id = setInterval(() => {
      setScore(prev => {
        const next = prev + dirRef.current * (Math.random() * 2.5 + 0.5);
        if (next <= 36 || next >= 93) dirRef.current *= -1;
        return Math.max(34, Math.min(95, next));
      });
    }, 950);
    return () => clearInterval(id);
  }, []);

  const s    = Math.round(score);
  const R    = 68;
  const circ = 2 * Math.PI * R;
  const dash = circ - (s / 100) * circ;
  const clr  = s >= 60 ? "#10B981" : s >= 40 ? "#F59E0B" : "#EF4444";
  const lbl  = s >= 60 ? "TRUSTED"  : s >= 40 ? "SUSPICIOUS" : "CRITICAL";

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg width="176" height="176" viewBox="0 0 176 176" aria-label={`Trust score ${s}`}>
        <circle cx="88" cy="88" r={R} fill="none" stroke="#1E293B" strokeWidth="10"/>
        <circle cx="88" cy="88" r={R} fill="none" stroke={clr} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={dash}
          transform="rotate(-90 88 88)"
          style={{ transition:"stroke-dashoffset .8s ease,stroke .5s ease",
                   filter:`drop-shadow(0 0 8px ${clr}66)` }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-4xl font-bold font-mono leading-none" style={{ color: clr, transition:"color .5s" }}>{s}</span>
        <span className="text-xs text-slate-500 font-mono">/100</span>
        <span className="text-xs font-bold font-mono mt-1 tracking-widest" style={{ color: clr, transition:"color .5s" }}>{lbl}</span>
      </div>
    </div>
  );
}

/* ── Counter with IntersectionObserver ───────────────────────── */
function Counter({ target, prefix="", suffix="" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1600, 1);
        setVal(Math.round((1 - Math.pow(1-p,3)) * target));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ── Feature card ────────────────────────────────────────────── */
const FEATURES = [
  { icon:"◎", title:"Continuous Trust Scoring",     body:"Trust score updates on every interaction — keystroke, swipe, location, device — not just at login.", delay:"0ms" },
  { icon:"⬡", title:"Fraud Detection",              body:"ML models detect fraud in milliseconds using behavioral signals, with no manually-set thresholds.", delay:"80ms" },
  { icon:"◈", title:"Account Takeover Prevention",  body:"A stolen password is not enough. Behavioral biometrics catches attackers the moment they behave differently.", delay:"160ms" },
  { icon:"◧", title:"Insider Threat Detection",     body:"Bulk queries, off-hours access, and unusual data patterns trigger silent escalations before damage occurs.", delay:"240ms" },
];

const STATS = [
  { label:"Fraud Prevented Today",  value:2847,   prefix:"₹", suffix:"Cr" },
  { label:"Protected Accounts",     value:184920,  suffix:"+" },
  { label:"Active Sessions",        value:3241 },
  { label:"Avg Trust Score",        value:81,     suffix:"/100" },
];

const LOGS = [
  { msg:"Session #4821 — trust score dropped to 38",     sev:"red" },
  { msg:"New device detected — step-up auth triggered",  sev:"yellow" },
  { msg:"Transaction ₹84,000 to unknown beneficiary blocked", sev:"red" },
  { msg:"VPN / proxy detected on session #4820",         sev:"yellow" },
  { msg:"Session #4817 — trust restored after OTP",      sev:"green" },
  { msg:"Keystroke anomaly — bot-like input pattern",    sev:"yellow" },
];

const SEV = {
  red:    "text-red-400    border-red-500/40",
  yellow: "text-amber-400  border-amber-500/40",
  green:  "text-emerald-400 border-emerald-500/40",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p+1) % LOGS.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#060B14] text-slate-300 overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-[#060B14]/90 backdrop-blur border-b border-slate-800 flex items-center px-6 gap-4">
        <span className="flex items-center gap-2 mr-auto">
          <span className="w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm">◎</span>
          <span className="font-mono font-bold text-white text-sm tracking-wide">TrustOS</span>
          <span className="ml-1 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">v1.0</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse inline-block"/>
          3,241 sessions live
        </span>
        <button onClick={() => navigate("/login")}
          className="text-sm text-slate-300 border border-slate-700 hover:border-cyan-500/50 hover:text-white px-4 py-1.5 rounded-lg transition-colors font-medium">
          Login
        </button>
        <button onClick={() => navigate("/admin")}
          className="text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-4 py-1.5 rounded-lg transition-colors">
          Admin Dashboard
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-14 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="scanlines absolute inset-0 pointer-events-none opacity-50" />

        {/* Left */}
        <div className="relative z-10 flex-1 max-w-2xl">
          <div className="fade-up flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 dot-pulse inline-block"/>
            <span className="text-xs font-mono text-cyan-400 tracking-widest">SYSTEM ACTIVE</span>
          </div>

          <h1 className="fade-up text-6xl md:text-7xl font-extrabold leading-none tracking-tight mb-3"
            style={{ animationDelay:"80ms" }}>
            <span className="text-white">Trust</span><span className="text-cyan-400">OS</span>
          </h1>

          <p className="fade-up text-xl text-slate-400 font-medium mb-4"
            style={{ animationDelay:"140ms" }}>
            Continuous Identity Trust Platform for Banking
          </p>

          <p className="fade-up text-2xl md:text-3xl font-semibold text-white mb-10 leading-snug"
            style={{ animationDelay:"200ms" }}>
            "Trust Once?&nbsp;
            <span className="text-red-400 italic">Never.</span><br/>
            Trust&nbsp;<span className="text-cyan-400">Continuously.</span>"
          </p>

          <div className="fade-up flex flex-wrap gap-3" style={{ animationDelay:"280ms" }}>
            <button onClick={() => navigate("/login")}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,.3)] hover:shadow-[0_0_32px_rgba(34,211,238,.45)]">
              → Login
            </button>
            <button onClick={() => navigate("/admin")}
              className="border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Admin Dashboard
            </button>
            <button onClick={() => document.getElementById("architecture")?.scrollIntoView({ behavior:"smooth" })}
              className="border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 font-medium px-6 py-3 rounded-xl text-sm transition-colors">
              View Architecture ↓
            </button>
          </div>
        </div>

        {/* Right: live widget */}
        <div className="hidden lg:flex flex-col gap-4 w-80 ml-16 fade-up relative z-10" style={{ animationDelay:"320ms" }}>
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6">
            <p className="text-xs font-mono text-slate-500 tracking-widest text-center mb-4">LIVE TRUST MONITOR</p>
            <LiveRing />
            <p className="text-xs font-mono text-slate-500 text-center mt-3">SESSION #4821 · ACTIVE</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-700/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 dot-pulse inline-block"/>
              <span className="text-xs font-mono text-slate-500 tracking-widest">EVENT STREAM</span>
            </div>
            <div className="py-1">
              {LOGS.map((log, i) => (
                <div key={i} className={`flex gap-3 px-4 py-2.5 text-xs transition-all duration-300 border-l-2 ${
                  i === active ? `bg-slate-800/60 ${SEV[log.sev]}` : "border-transparent text-slate-600"
                }`}>
                  <span className="font-mono shrink-0">{i === active ? "→" : " "}</span>
                  <span className={i === active ? "" : ""}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i} className={`px-8 py-10 ${i < 3 ? "border-r border-slate-800" : ""}`}>
              <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">{s.label.toUpperCase()}</p>
              <p className="text-4xl font-bold font-mono text-cyan-400">
                <Counter target={s.value} prefix={s.prefix||""} suffix={s.suffix||""}/>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <p className="text-xs font-mono text-cyan-400 tracking-widest mb-3">CAPABILITY OVERVIEW</p>
        <h2 className="text-3xl font-bold text-white mb-10">Every threat vector, covered.</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="card-hover bg-slate-900/50 border border-slate-700/60 rounded-xl p-6 cursor-default"
              style={{ animationDelay: f.delay }}>
              <span className="block w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-lg flex items-center justify-center mb-4">
                {f.icon}
              </span>
              <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Architecture ── */}
      <section id="architecture" className="bg-slate-900/40 border-t border-slate-800 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-mono text-cyan-400 tracking-widest mb-3">TRUST ARCHITECTURE</p>
          <h2 className="text-3xl font-bold text-white mb-10">Three layers. No gaps.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n:"01", label:"Perimeter Auth",   color:"slate",   items:["OTP / MFA","Device fingerprint","KYC document check","Liveness detection"], note:"Blocks ~60% of threats" },
              { n:"02", label:"Risk-Based Auth",  color:"cyan",    items:["Behavioral biometrics","Session risk scoring","ML anomaly detection","Identity graph"], note:"Catches ~25% more" },
              { n:"03", label:"Continuous Trust", color:"emerald", items:["Zero-trust sessions","Continuous scoring","Insider monitoring","Explainable AI"], note:"Closes residual gaps" },
            ].map(l => (
              <div key={l.n} className={`bg-[#060B14] rounded-xl p-6 border-t-2 border border-slate-800 ${
                l.color === "cyan" ? "border-t-cyan-500" : l.color === "emerald" ? "border-t-emerald-500" : "border-t-slate-500"
              }`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`text-xs font-mono font-bold ${l.color==="cyan"?"text-cyan-400":l.color==="emerald"?"text-emerald-400":"text-slate-400"}`}>{l.n}</span>
                  <span className="text-white font-semibold">{l.label}</span>
                </div>
                {l.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-2 py-2 border-b border-slate-800/80 last:border-0">
                    <span className={`text-xs ${l.color==="cyan"?"text-cyan-500":l.color==="emerald"?"text-emerald-500":"text-slate-500"}`}>◆</span>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
                <p className={`mt-4 text-xs font-mono font-semibold ${l.color==="cyan"?"text-cyan-400":l.color==="emerald"?"text-emerald-400":"text-slate-400"}`}>{l.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center border-t border-slate-800">
        <p className="text-xs font-mono text-cyan-400 tracking-widest mb-4">READY TO DEPLOY</p>
        <h2 className="text-4xl font-bold text-white mb-4">Your session is waiting.</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Every second a session runs unmonitored is a second a fraudster has the advantage.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate("/login")}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-[0_0_24px_rgba(34,211,238,.35)]">
            → Start Session
          </button>
          <button onClick={() => navigate("/admin")}
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-colors">
            Open Admin Dashboard
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-5 px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-sm">◎</span>
          <span className="font-mono text-sm text-white font-bold">TrustOS</span>
          <span className="text-slate-600 text-sm">·</span>
          <span className="text-slate-500 text-xs">Bank of Baroda × IIT Gandhinagar Hackathon 2026</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse inline-block"/>
          <span className="font-mono text-xs text-slate-500">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </footer>
    </div>
  );
}