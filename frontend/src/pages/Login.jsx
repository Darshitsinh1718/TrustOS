// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, sessionAPI } from '../api'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await authAPI.login(form)
      localStorage.setItem('token', res.data.access_token)
      await sessionAPI.start()
      navigate('/dashboard')
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl w-96 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-2">TrustOS</h1>
        <p className="text-gray-400 text-sm mb-6">Continuous Identity Trust Engine</p>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-indigo-500"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-indigo-500"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}