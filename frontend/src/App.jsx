import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authAPI } from './api'

import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard'
import Transaction from './pages/Transaction'
import AdminDashboard from './pages/AdminDashboard'

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await authAPI.me()
        setIsAdmin(res.data.role === 'admin')
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B14] flex items-center justify-center text-white">
        Checking access...
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/transaction"
          element={
            <PrivateRoute>
              <Transaction />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}