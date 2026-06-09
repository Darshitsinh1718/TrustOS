// src/components/TrustScoreCard.jsx
export default function TrustScoreCard({ score, status, intervention }) {
  const color = score >= 60 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'
  const ring = score >= 60 ? 'border-green-500' : score >= 40 ? 'border-yellow-500' : 'border-red-500'
  const label = score >= 60 ? 'LOW RISK' : score >= 40 ? 'MEDIUM RISK' : 'HIGH RISK'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-2">
      <div className={`w-32 h-32 rounded-full border-4 ${ring} flex flex-col items-center justify-center`}>
        <span className={`text-4xl font-bold ${color}`}>{Math.round(score)}</span>
        <span className="text-gray-400 text-xs">/ 100</span>
      </div>
      <span className={`text-sm font-semibold ${color}`}>{label}</span>
      <span className="text-gray-500 text-xs">Session: {status}</span>
      {intervention === 'challenge' && (
        <span className="mt-2 px-3 py-1 bg-yellow-900 text-yellow-300 text-xs rounded-full">OTP Required</span>
      )}
      {intervention === 'freeze' && (
        <span className="mt-2 px-3 py-1 bg-red-900 text-red-300 text-xs rounded-full">Session Frozen</span>
      )}
    </div>
  )
}