import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

const SIGNAL_SHORT = {
  keystroke_fast:"BOT KS", keystroke_normal:"KS ✓",
  swipe_anomaly:"SWIPE ✕", swipe_normal:"SWIPE ✓",
  new_device:"NEW DEV", new_location:"NEW LOC",
  vpn_detected:"VPN", idle_long:"IDLE",
  transaction_large:"LRG TXN", transaction_normal:"TXN ✓",
  multiple_failures:"AUTH FAIL",
};

function dotColor(score) {
  return score >= 60 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";
}

function CustomDot(props) {
  const { cx, cy, payload } = props;
  const c = dotColor(payload.score);
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill={c} stroke="#060B14" strokeWidth={2}/>
      <circle cx={cx} cy={cy} r={8} fill="none" stroke={c} strokeWidth={1} opacity={0.35}/>
    </g>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const c = dotColor(d.score);
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl text-xs font-mono min-w-[180px]">
      <p className="text-slate-500 tracking-widest mb-2">EVENT DETAIL</p>
      <p className="text-2xl font-bold mb-1" style={{ color:c }}>{d.score}</p>
      <p className="font-semibold mb-1" style={{ color:c }}>{d.short || d.event_type}</p>
      <p className="text-slate-400 leading-relaxed">{d.reason}</p>
      <p className="text-slate-600 mt-2">{d.time}</p>
      {d.delta !== 0 && (
        <p className={`font-bold mt-1 ${d.delta < 0 ? "text-red-400" : "text-emerald-400"}`}>
          {d.delta > 0 ? "+" : ""}{d.delta} pts
        </p>
      )}
    </div>
  );
}

export default function RiskTimeline({ events = [] }) {
  const data = events.map((e, i) => ({
    index:      i + 1,
    score:      Math.round(e.new_score),
    event_type: e.event_type,
    short:      SIGNAL_SHORT[e.event_type] || e.event_type,
    reason:     e.reason,
    delta:      e.score_delta,
    time:       new Date(e.timestamp).toLocaleTimeString(),
  }));

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-slate-500 tracking-widest">FRAUD INVESTIGATION TIMELINE</p>
          <p className="text-sm text-slate-300 font-medium mt-0.5">Trust score trace — current session</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          {[["Safe","text-emerald-400"],["Caution","text-amber-400"],["Critical","text-red-400"]].map(([l,c]) => (
            <span key={l} className={`flex items-center gap-1.5 ${c}`}>
              <span className="w-2 h-2 rounded-full bg-current"/>
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 pt-5 pb-3">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
            No events yet — trigger signals to populate the timeline.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top:8, right:8, left:-20, bottom:8 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#1E293B"/>
              <ReferenceLine y={60} stroke="#10B981" strokeWidth={1} strokeDasharray="5 4"
                label={{ value:"SAFE", fill:"#10B981", fontSize:9, position:"insideTopRight" }}/>
              <ReferenceLine y={40} stroke="#F59E0B" strokeWidth={1} strokeDasharray="5 4"
                label={{ value:"OTP", fill:"#F59E0B", fontSize:9, position:"insideTopRight" }}/>
              <XAxis dataKey="short"
                tick={{ fill:"#475569", fontSize:9, fontFamily:"JetBrains Mono,monospace" }}
                tickLine={false} axisLine={{ stroke:"#1E293B" }}/>
              <YAxis domain={[0,100]}
                tick={{ fill:"#475569", fontSize:10, fontFamily:"JetBrains Mono,monospace" }}
                tickLine={false} axisLine={false} tickCount={6}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotoneX" dataKey="score"
                stroke="#22D3EE" strokeWidth={2}
                dot={<CustomDot/>} activeDot={false}/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Event chips */}
      {data.length > 0 && (
        <div className="px-6 pb-5 pt-1 flex flex-wrap gap-2 border-t border-slate-800">
          {data.map((d, i) => (
            <span key={i} className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md border ${
              d.delta < 0 ? "bg-red-500/5 border-red-500/20 text-red-400"
              : d.delta > 0 ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : "bg-slate-800 border-slate-700 text-slate-400"
            }`}>
              {d.short}
              <span className="font-bold">{d.delta > 0 ? "+" : ""}{d.delta}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}