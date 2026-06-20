import { useState } from "react";
import AppShell from "../components/AppShell";
import { transactionAPI } from "../api";

const PRESETS = [
  {
    label: "Normal Transaction",
    risk: "safe",
    data: {
      demo_risk: "normal",
      amount: 5000,
      beneficiary: "9988776655@upi",
      card4: "visa",
      card6: "debit",
      ProductCD: "W",
      P_emaildomain: "gmail.com",
      R_emaildomain: "gmail.com",
      DeviceType: "mobile",
      DeviceInfo: "iOS Device",
    },
  },
  {
    label: "Large Transaction",
    risk: "medium",
    data: {
      demo_risk: "medium",
      amount: 85000,
      beneficiary: "4455667788@upi",
      card4: "mastercard",
      card6: "credit",
      ProductCD: "W",
      P_emaildomain: "yahoo.com",
      R_emaildomain: "yahoo.com",
      DeviceType: "mobile",
      DeviceInfo: "Samsung Device",
    },
  },
  {
    label: "Unknown Device Transaction",
    risk: "high",
    data: {
      demo_risk: "high",
      amount: 42000,
      beneficiary: "1122334455@upi",
      card4: "visa",
      card6: "debit",
      ProductCD: "C",
      P_emaildomain: "protonmail.com",
      R_emaildomain: "unknown",
      DeviceType: "unknown",
      DeviceInfo: "unknown",
    },
  },
  {
    label: "Suspicious Card/Profile Transaction",
    risk: "critical",
    data: {
      demo_risk: "critical",
      amount: 97000,
      beneficiary: "0099887766@upi",
      card4: "discover",
      card6: "credit",
      ProductCD: "C",
      P_emaildomain: "unknown",
      R_emaildomain: "unknown",
      DeviceType: "unknown",
      DeviceInfo: "unknown",
    },
  },
];

const PRESET_BTN = {
  safe: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  medium: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  high: "bg-red-500/10 border-red-500/30 text-red-400",
  critical: "bg-red-600/15 border-red-600/40 text-red-300",
};

const DECISION_STYLE = {
  ALLOW: {
    label: "Approved",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: "✓",
  },
  STEP_UP_OTP: {
    label: "OTP Required",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: "⚠",
  },
  FREEZE_AND_ALERT: {
    label: "Blocked — High Risk",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: "✕",
  },
};

export default function Transaction() {
  const [form, setForm] = useState(PRESETS[0].data);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPreset = (preset) => {
    setForm(preset.data);
    setResult(null);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        demo_risk: form.demo_risk,
        TransactionAmt: Number(form.amount),
        ProductCD: form.ProductCD,
        card4: form.card4,
        card6: form.card6,
        P_emaildomain: form.P_emaildomain,
        R_emaildomain: form.R_emaildomain,
        DeviceType: form.DeviceType,
        DeviceInfo: form.DeviceInfo,
      };

      const res = await transactionAPI.fraudCheck(payload);
      console.log("FRAUD RESPONSE:", res.data);

      setResult(res.data);
      sessionStorage.setItem("lastFraudResult", JSON.stringify(res.data));
    } catch (err) {
      console.log("TRANSACTION ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">New Transaction</h1>
          <p className="text-slate-400 text-sm mt-1">
            Evaluated in real time by the IEEE-CIS trained fraud detection model.
          </p>
        </div>

        <div className="mb-6">
          <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">
            DEMO PRESETS
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => loadPreset(p)}
                className={`border rounded-lg px-4 py-2 text-xs font-semibold ${PRESET_BTN[p.risk]}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-8">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3.5 border border-slate-700 focus:outline-none focus:border-cyan-500 text-sm"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Beneficiary Account
              </label>
              <input
                className="w-full bg-slate-800 text-white rounded-xl px-4 py-3.5 border border-slate-700 focus:outline-none focus:border-cyan-500 text-sm"
                value={form.beneficiary}
                onChange={(e) =>
                  setForm({ ...form, beneficiary: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
                value={form.card4}
                onChange={(e) => setForm({ ...form, card4: e.target.value })}
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="discover">Discover</option>
                <option value="american express">American Express</option>
              </select>

              <select
                className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
                value={form.card6}
                onChange={(e) => setForm({ ...form, card6: e.target.value })}
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
                value={form.DeviceType}
                onChange={(e) =>
                  setForm({ ...form, DeviceType: e.target.value })
                }
              >
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
                <option value="unknown">Unknown</option>
              </select>

              <select
                className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
                value={form.P_emaildomain}
                onChange={(e) =>
                  setForm({ ...form, P_emaildomain: e.target.value })
                }
              >
                <option value="gmail.com">gmail.com</option>
                <option value="yahoo.com">yahoo.com</option>
                <option value="protonmail.com">protonmail.com</option>
                <option value="unknown">unknown</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-900 font-bold py-3.5 rounded-xl text-sm"
            >
              {loading ? "Running fraud check…" : "Submit Transaction →"}
            </button>
          </form>

          {error && (
            <div className="mt-6 rounded-xl px-5 py-4 border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          {result && !error && (() => {
            const s = DECISION_STYLE[result.decision] || DECISION_STYLE.ALLOW;

            return (
              <div className={`mt-6 rounded-xl px-5 py-5 border ${s.bg} ${s.border}`}>
                <p className={`text-base font-bold ${s.color}`}>
                  {s.icon} {s.label}
                </p>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Fraud Probability</p>
                    <p className={`text-lg font-bold font-mono ${s.color}`}>
                      {((result.fraud_probability || 0) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Trust Impact</p>
                    <p className="text-lg font-bold font-mono text-red-400">
                      −{result.risk_penalty || 0}
                    </p>
                  </div>

                  <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Trust Score</p>
                    <p className="text-lg font-bold font-mono text-white">
                      {Math.round(result.trust_score || 100)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 bg-slate-900/40 rounded-lg px-4 py-3 mt-4">
                  {result.reason || "Transaction evaluated successfully."}
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </AppShell>
  );
}