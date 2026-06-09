// src/components/RiskTimeline.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

export default function RiskTimeline({ events }) {
  const data = events.map((e, i) => ({
    name: i + 1,
    score: Math.round(e.new_score),
    reason: e.reason,
  }))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4">Trust Score Timeline</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} stroke="#6B7280" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#9CA3AF' }}
            formatter={(value, _, props) => [value, props.payload.reason]}
          />
          <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Safe', fill: '#22c55e', fontSize: 11 }} />
          <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'OTP', fill: '#f59e0b', fontSize: 11 }} />
          <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}