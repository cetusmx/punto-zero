import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import VolunteerLayout from './layouts/VolunteerLayout'
import AdminLayout from './layouts/AdminLayout'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/*" element={<VolunteerLayout />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
