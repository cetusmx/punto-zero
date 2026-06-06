import { Routes, Route, NavLink } from 'react-router-dom'
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EventNoteIcon from '@mui/icons-material/EventNote'
import BadgeIcon from '@mui/icons-material/Badge'
import PersonIcon from '@mui/icons-material/Person'
import HomePage from '../pages/HomePage'
import AgendaPage from '../pages/AgendaPage'
import MySchedulesPage from '../pages/MySchedulesPage'
import CertificatesPage from '../pages/CertificatesPage'
import ProfilePage from '../pages/ProfilePage'

const tabs = [
  { label: 'Inicio', icon: <HomeIcon />, path: '/' },
  { label: 'Agenda', icon: <CalendarMonthIcon />, path: '/agenda' },
  { label: 'Mis Turnos', icon: <EventNoteIcon />, path: '/mis-turnos' },
  { label: 'Certificados', icon: <BadgeIcon />, path: '/certificados' },
  { label: 'Perfil', icon: <PersonIcon />, path: '/perfil' },
]

export default function VolunteerLayout() {
  return (
    <Box sx={{ pb: 7, minHeight: '100vh' }}>
      <Box sx={{ p: 2, flex: 1 }}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="mis-turnos" element={<MySchedulesPage />} />
          <Route path="certificados" element={<CertificatesPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Routes>
      </Box>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation showLabels>
          {tabs.map((tab) => (
            <BottomNavigationAction
              key={tab.path}
              label={tab.label}
              icon={tab.icon}
              component={NavLink}
              to={tab.path}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
