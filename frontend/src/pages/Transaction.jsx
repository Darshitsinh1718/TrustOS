import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { transactionAPI } from "../api";
import AppShell from "../components/AppShell";

const STATUS = {
  approved: { label:"Approved",           color:"text-emerald-400", bg:"bg-emerald-500/10", border:"border-emerald-500/30", icon:"✓" },
  challenged:{ label:"OTP Required",       color:"text-amber-400",   bg:"bg-amber-500/10",   border:"border-amber-500/30",   icon:"⚠" },
  blocked:  { label:"Blocked — High Risk", color:"text-red-400",     bg:"bg-red-500/10",     border:"border-red-500/30",     icon:"✕" },
  error:    { label:"Error",               color:"text-red-400",     bg:"bg-red-500/10",     border:"border-red-500/30",     icon:"!" },
};

export default function Transaction() {
  const [form,    setForm]    = useState({ amount:"", beneficiary:"" });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await transactionAPI.create({ amount:parseFloat(form.amount), beneficiary:form.beneficiary });
      setResult(res.data);
    } catch (err) {
      setResult({ status:"error", error:err.response?.data?.detail || "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-12">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">New Transaction</h1>
          <p className="text-slate-400 text-sm mt-1">Each transaction is evaluated against your current trust score.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-8">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (₹)</label>
              <input
                type="number" min="1"
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3.5 border border-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 placeholder-slate-600 text-sm transition"
                placeholder="e.g. 50000"
                value={form.amount}
                onChange={e => setForm({ ...form, amount:e.target.value })}
                required
              />
              <p className="text-xs text-slate-500 mt-1.5">Amounts above ₹80,000 are flagged as high-risk.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Beneficiary Account</label>
              <input
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3.5 border border-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 placeholder-slate-600 text-sm transition"
                placeholder="Account number or UPI ID"
                value={form.beneficiary}
                onChange={e => setForm({ ...form, beneficiary:e.target.value })}
                required
              />
            </div>

            <button type="submit" disabled={loading}
              className="mt-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-900 font-bold py-3.5 rounded-xl text-sm transition-colors shadow-[0_0_16px_rgba(34,211,238,.2)]">
              {loading ? "Processing…" : "Submit Transaction →"}
            </button>
          </form>

          {/* Result */}
          {result && (() => {
            const s = STATUS[result.status] || STATUS.error;
            return (
              <div className={`mt-6 rounded-xl px-5 py-5 border ${s.bg} ${s.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-2xl font-bold font-mono ${s.color}`}>{s.icon}</span>
                  <div>
                    <p className={`text-base font-bold ${s.color}`}>{s.label}</p>
                    {result.risk_level && (
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Risk level: {result.risk_level.toUpperCase()}</p>
                    )}
                  </div>
                </div>
                {result.status === "challenged" && (
                  <p className="text-sm text-amber-300 bg-amber-500/10 rounded-lg px-4 py-3 mt-2">
                    Trust score requires verification. An OTP will be sent to your registered number before funds are released.
                  </p>
                )}
                {result.status === "blocked" && (
                  <p className="text-sm text-red-300 bg-red-500/10 rounded-lg px-4 py-3 mt-2">
                    Transaction blocked due to high fraud risk. A fraud alert has been raised. Contact your branch to review.
                  </p>
                )}
                {result.error && (
                  <p className="text-sm text-red-300">{result.error}</p>
                )}
              </div>
            );
          })()}
        </div>

        {/* Risk guide */}
        <div className="mt-6 bg-slate-900/40 border border-slate-800 rounded-xl p-5">
          <p className="text-xs font-mono text-slate-500 tracking-widest mb-3">TRANSACTION RISK GUIDE</p>
          <div className="flex flex-col gap-2">
            {[
              { range:"Score 60–100", decision:"Approved automatically",  color:"text-emerald-400" },
              { range:"Score 40–59",  decision:"OTP step-up required",    color:"text-amber-400" },
              { range:"Score 0–39",   decision:"Blocked — fraud risk",    color:"text-red-400" },
            ].map(r => (
              <div key={r.range} className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-mono">{r.range}</span>
                <span className={`font-medium ${r.color}`}>{r.decision}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}