// src/pages/Transaction.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { transactionAPI } from '../api'

export default function Transaction() {
  const [form, setForm] = useState({ amount: '', beneficiary: '' })
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await transactionAPI.create({ amount: parseFloat(form.amount), beneficiary: form.beneficiary })
      setResult(res.data)
    } catch (err) {
      setResult({ status: 'error', error: err.response?.data?.detail })
    }
  }

  const statusStyle = {
    approved: 'bg-green-900 text-green-300',
    challenged: 'bg-yellow-900 text-yellow-300',
    blocked: 'bg-red-900 text-red-300',
    error: 'bg-red-900 text-red-300',
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 text-sm mb-4">← Back</button>
        <h2 className="text-white text-xl font-bold mb-6">New Transaction</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm">Amount (₹)</label>
            <input
              type="number"
              className="w-full mt-1 bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-indigo-500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">Beneficiary Account</label>
            <input
              className="w-full mt-1 bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-indigo-500"
              value={form.beneficiary}
              onChange={(e) => setForm({ ...form, beneficiary: e.target.value })}
              required
            />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition">
            Submit Transaction
          </button>
        </form>
        {result && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${statusStyle[result.status] || 'bg-gray-800 text-gray-300'}`}>
            <div className="font-semibold uppercase mb-1">{result.status}</div>
            {result.risk_level && <div>Risk level: {result.risk_level}</div>}
            {result.error && <div>{result.error}</div>}
            {result.status === 'challenged' && (
              <div className="mt-2 font-medium">⚠️ OTP verification required before funds transfer</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}