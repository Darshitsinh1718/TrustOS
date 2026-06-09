// src/pages/UserDashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionAPI } from '../api'
import TrustScoreCard from '../components/TrustScoreCard'
import RiskTimeline from '../components/RiskTimeline'

const SIGNALS = [
  { key: 'keystroke_normal', label: 'Normal Keystroke', color: 'bg-green-800 hover:bg-green-700' },
  { key: 'keystroke_fast', label: 'Fast Keystroke (Bot)', color: 'bg-red-800 hover:bg-red-700' },
  { key: 'swipe_normal', label: 'Normal Swipe', color: 'bg-green-800 hover:bg-green-700' },
  { key: 'swipe_anomaly', label: 'Swipe Anomaly', color: 'bg-red-800 hover:bg-red-700' },
  { key: 'new_device', label: 'New Device', color: 'bg-red-900 hover:bg-red-800' },
  { key: 'new_location', label: 'New Location', color: 'bg-orange-900 hover:bg-orange-800' },
  { key: 'vpn_detected', label: 'VPN Detected', color: 'bg-orange-900 hover:bg-orange-800' },
]

export default function UserDashboard() {
  const [session, setSession] = useState(null)
  const [events, setEvents] = useState([])
  const [lastResult, setLastResult] = useState(null)
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([sessionAPI.current(), sessionAPI.events()])
      setSession(s.data)
      setEvents(e.data)
    } catch {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => { refresh() }, [refresh])

  const sendSignal = async (key) => {
    const res = await sessionAPI.signal(key)
    setLastResult(res.data)
    refresh()
  }

  const score = session?.trust_score ?? 85
  const intervention = score >= 60 ? 'allow' : score >= 40 ? 'challenge' : 'freeze'

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-xl font-bold">TrustOS — User Session</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate('/transaction')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
              New Transaction
            </button>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <TrustScoreCard score={score} status={session?.status} intervention={intervention} />
          <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3">Simulate Behavior Signals</h3>
            <p className="text-gray-500 text-xs mb-4">Click signals to change your trust score in real time</p>
            <div className="flex flex-wrap gap-2">
              {SIGNALS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => sendSignal(s.key)}
                  className={`${s.color} text-white text-xs px-3 py-2 rounded-lg transition`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {lastResult && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-300">
                <span className="font-medium">Last signal:</span> {lastResult.reason} &nbsp;
                <span className={lastResult.delta < 0 ? 'text-red-400' : 'text-green-400'}>
                  ({lastResult.delta > 0 ? '+' : ''}{lastResult.delta})
                </span>
              </div>
            )}
          </div>
        </div>

        <RiskTimeline events={events} />
      </div>
    </div>
  )
}