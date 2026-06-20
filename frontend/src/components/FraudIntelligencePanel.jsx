import { useState, useEffect } from "react";
import { transactionAPI } from "../api";

const DECISION_STYLE = {
  ALLOW:           { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  STEP_UP_OTP:     { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
  FREEZE_AND_ALERT:{ color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30"     },
};

export default function FraudIntelligencePanel({ lastResult }) {
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    transactionAPI.modelInfo().then(res => setModelInfo(res.data)).catch(() => {});
  }, []);

  const metrics = modelInfo?.metrics || {};
  const style   = lastResult ? (DECISION_STYLE[lastResult.decision] || DECISION_STYLE.ALLOW) : null;

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <p className="text-xs font-mono text-slate-500 tracking-widest">TRANSACTION FRAUD INTELLIGENCE</p>
        <p className="text-sm text-slate-300 font-medium mt-0.5">IEEE-CIS Random Forest · Real transaction fraud model</p>
      </div>

      <div className="p-6 flex flex-col gap-6">

        {/* Model card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"Model",    value: modelInfo?.model_name || "RandomForestClassifier" },
            { label:"Dataset",  value: modelInfo?.dataset_name || "IEEE-CIS Fraud Detection" },
            { label:"Features", value: modelInfo?.feature_count ?? "—" },
            { label:"ROC-AUC",  value: metrics.roc_auc ? metrics.roc_auc.toFixed(3) : "—" },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-sm font-bold font-mono text-cyan-400 truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Feature list */}
        <div>
          <p className="text-xs text-slate-500 font-mono tracking-widest mb-2">FEATURES USED</p>
          <div className="flex flex-wrap gap-1.5">
            {["Amount","Card type","Device","Address","Email domain","Product code"].map(f => (
              <span key={f} className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-md">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Last result */}
        {lastResult ? (
          <div className={`rounded-xl p-5 border ${style.bg} ${style.border}`}>
            <p className="text-xs font-mono text-slate-500 tracking-widest mb-3">LATEST FRAUD CHECK</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-500">Fraud Probability</p>
                <p className={`text-lg font-bold font-mono ${style.color}`}>
                  {(lastResult.fraud_probability * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Decision</p>
                <p className={`text-lg font-bold font-mono ${style.color}`}>{lastResult.decision}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Trust Score Impact</p>
                <p className="text-lg font-bold font-mono text-red-400">−{lastResult.risk_penalty} pts</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{lastResult.reason}</p>
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-700/40 border-dashed rounded-xl p-5 text-center text-sm text-slate-600">
            No transactions checked yet. Submit a transaction to see fraud intelligence results.
          </div>
        )}

        {/* Training metrics */}
        {metrics.accuracy !== undefined && (
          <div>
            <p className="text-xs text-slate-500 font-mono tracking-widest mb-2">MODEL TRAINING METRICS</p>
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
    </div>
  );
}