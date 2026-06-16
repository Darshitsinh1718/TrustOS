import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono shadow-xl max-w-xs">
      <p className="text-slate-500 mb-2">EVENT</p>
      <p className="text-amber-400 font-bold mb-1">Score: {d?.anomaly_score?.toFixed(3)}</p>
      <p className="text-cyan-400 mb-1">Trust: {d?.trust_score?.toFixed(1)}</p>
      <p className="text-slate-300 leading-relaxed">{d?.reason}</p>
    </div>
  );
}

export default function AnomalyTimeline({ data = [] }) {
  const chartData = data.map((d, i) => ({
    index:          i + 1,
    anomaly_score:  parseFloat((d.anomaly_score * 100).toFixed(1)),
    trust_score:    parseFloat(d.trust_score?.toFixed(1)),
    reason:         d.reason,
    user_id:        d.user_id,
  }));

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <p className="text-xs font-mono text-slate-500 tracking-widest">ANOMALY TIMELINE</p>
        <p className="text-sm text-slate-300 font-medium mt-0.5">Anomaly score vs trust score — all sessions</p>
      </div>

      <div className="p-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
            No data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top:8, right:8, left:-20, bottom:8 }}>
              <defs>
                <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22D3EE" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#1E293B"/>
              <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="5 4"
                label={{ value:"CAUTION", fill:"#F59E0B", fontSize:9, position:"insideTopRight" }}/>
              <XAxis dataKey="index"
                tick={{ fill:"#475569", fontSize:9, fontFamily:"monospace" }}
                tickLine={false} axisLine={{ stroke:"#1E293B" }}/>
              <YAxis
                tick={{ fill:"#475569", fontSize:10, fontFamily:"monospace" }}
                tickLine={false} axisLine={false} tickCount={6}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{ fontSize:11, color:"#94A3B8", paddingTop:12 }}/>
              <Area type="monotone" dataKey="anomaly_score" name="Anomaly %"
                stroke="#EF4444" strokeWidth={2} fill="url(#anomGrad)"/>
              <Area type="monotone" dataKey="trust_score"   name="Trust Score"
                stroke="#22D3EE" strokeWidth={2} fill="url(#trustGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}