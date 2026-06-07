import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import VolunteerLayout from './layouts/VolunteerLayout'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import CompleteProfilePage from './pages/CompleteProfilePage'

function FirstLoginGuard({ children }) {
  const { isFirstLogin } = useAuth()
  if (isFirstLogin) return <Navigate to="/completar-perfil" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/recuperar" element={<ForgotPasswordPage />} />
          <Route path="/completar-perfil" element={
            <ProtectedRoute><CompleteProfilePage /></ProtectedRoute>
          } />
          <Route path="/*" element={
            <ProtectedRoute>
              <FirstLoginGuard>
                <VolunteerLayout />
              </FirstLoginGuard>
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
