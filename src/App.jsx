import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'

import LandingPage from './pages/LandingPage'
import RoomsPage from './pages/RoomsPage'
import RoomDetailPage from './pages/RoomDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRoomsPage from './pages/admin/AdminRoomsPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

import MemberDashboard from './pages/member/MemberDashboard'
import MemberBookingsPage from './pages/member/MemberBookingsPage'
import MemberSettingsPage from './pages/member/MemberSettingsPage'

import { useAuth } from './hooks/useAuth'

// --- Guards (กันเด้งตอน loading) ---
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6">กำลังตรวจสอบการเข้าสู่ระบบ...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6">กำลังตรวจสอบสิทธิ์...</div>
  if (!user) return <Navigate to="/login" replace />
  if ((user.role || '').toLowerCase() !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Not Found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* Member Routes (without Layout wrapper) */}
      <Route
        path="/member"
        element={
          <RequireAuth>
            <MemberDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/member/bookings"
        element={
          <RequireAuth>
            <MemberBookingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/member/settings"
        element={
          <RequireAuth>
            <MemberSettingsPage />
          </RequireAuth>
        }
      />

      {/* Admin Routes (without Layout wrapper) */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <RequireAdmin>
            <AdminRoomsPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <RequireAdmin>
            <AdminBookingsPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <AdminUsersPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RequireAdmin>
            <AdminSettingsPage />
          </RequireAdmin>
        }
      />
    </Routes>
  )
}
