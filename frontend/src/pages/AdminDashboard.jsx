// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { adminAPI } from '../api'
import AlertTable from '../components/AlertTable'

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([])
  const [sessions, setSessions] = useState([])

  const load = async () => {
    const [a, s] = await Promise.all([adminAPI.alerts(), adminAPI.sessions()])
    setAlerts(a.data)
    setSessions(s.data)
  }

  useEffect(() => { load() }, [])

  const resolve = async (id) => {
    await adminAPI.resolve(id)
    load()
  }

  const unfreeze = async (id) => {
    await adminAPI.unfreeze(id)
    load()
  }

  const frozen = sessions.filter((s) => s.status === 'frozen')
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.trust_score, 0) / sessions.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-white text-xl font-bold mb-6">TrustOS — Admin Dashboard</h1>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            ['Total Sessions', sessions.length, 'text-indigo-400'],
            ['Frozen Sessions', frozen.length, 'text-red-400'],
            ['Avg Trust Score', avgScore, avgScore >= 60 ? 'text-green-400' : 'text-yellow-400'],
          ].map(([label, value, color]) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-500 text-xs mb-1">{label}</div>
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {frozen.length > 0 && (
          <div className="bg-gray-900 border border-red-900 rounded-2xl p-4 mb-6">
            <h3 className="text-red-400 font-semibold mb-3 text-sm">Frozen Sessions</h3>
            <div className="space-y-2">
              {frozen.map((s) => (
                <div key={s.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Session #{s.id} — User {s.user_id} — Score: {Math.round(s.trust_score)}</span>
                  <button onClick={() => unfreeze(s.id)} className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1 rounded">
                    Unfreeze
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <AlertTable alerts={alerts} onResolve={resolve} />
      </div>
    </div>
  )
}