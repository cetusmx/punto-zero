import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Box, Paper, BottomNavigation, BottomNavigationAction, AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material'
import BadgeCenter from '../components/notifications/BadgeCenter'
import SettingsIcon from '@mui/icons-material/Settings'
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
import NotificationsPage from '../pages/NotificationsPage'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const tabs = [
  { label: 'Inicio', icon: <HomeIcon />, path: '/' },
  { label: 'Agenda', icon: <CalendarMonthIcon />, path: '/agenda' },
  { label: 'Mis Turnos', icon: <EventNoteIcon />, path: '/mis-turnos' },
  { label: 'Certificados', icon: <BadgeIcon />, path: '/certificados' },
  { label: 'Perfil', icon: <PersonIcon />, path: '/perfil' },
]

export default function VolunteerLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  return (
    <Box sx={{ pb: 7, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box component="img" src={logo} alt="Punto Zero" sx={{ height: { xs: 40, sm: 48 }, objectFit: 'contain' }} />
          </Box>
          <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
            Hola, {user?.name?.split(' ')[0] || 'Voluntario'}
          </Typography>
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <Tooltip title="Panel de Administración">
              <IconButton color="inherit" onClick={() => navigate('/admin')}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
          <BadgeCenter />
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2, flex: 1 }}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="mis-turnos" element={<MySchedulesPage />} />
          <Route path="certificados" element={<CertificatesPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="notificaciones" element={<NotificationsPage />} />
        </Routes>
      </Box>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation showLabels>
          {tabs.map((tab) => (
            <BottomNavigationAction
              key={tab.path}
              label={tab.label}
              icon={tab.icon}
              component={NavLink}
              to={tab.path}
              sx={{
                minWidth: 'auto',
                px: { xs: 0, sm: 2 },
                '& .MuiBottomNavigationAction-label': {
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' }
                }
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
