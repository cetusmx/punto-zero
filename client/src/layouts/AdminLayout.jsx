import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, AppBar, Typography, IconButton, Tooltip
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PeopleIcon from '@mui/icons-material/People'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import BadgeIcon from '@mui/icons-material/Badge'
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminPoints from '../pages/admin/AdminPoints'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminAgenda from '../pages/admin/AdminAgenda'
import AdminCertificates from '../pages/admin/AdminCertificates'
import AdminConfig from '../pages/admin/AdminConfig'
import AdminAdministrators from '../pages/admin/AdminAdministrators'
import { useAuth } from '../context/AuthContext'
import BadgeCenter from '../components/notifications/BadgeCenter'
import logo from '../assets/logo.png'

const DRAWER_WIDTH = 240

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { label: 'Puntos', icon: <LocationOnIcon />, path: '/admin/puntos' },
  { label: 'Usuarios', icon: <PeopleIcon />, path: '/admin/usuarios' },
  { label: 'Agenda', icon: <CalendarMonthIcon />, path: '/admin/agenda' },
  { label: 'Certificados', icon: <BadgeIcon />, path: '/admin/certificados' },
  { label: 'Configuración', icon: <SettingsIcon />, path: '/admin/config' },
]

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const currentMenuItems = [...menuItems]
  if (user?.role === 'superadmin') {
    currentMenuItems.push({ label: 'Administradores', icon: <SecurityIcon />, path: '/admin/administradores' })
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6">punto-zero</Typography>
      </Toolbar>
      <List>
        {currentMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={NavLink} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1.5 }}>
            <Box component="img" src={logo} alt="Punto Zero" sx={{ height: { xs: 40, sm: 48 }, objectFit: 'contain' }} />
            <Typography variant="h6" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700 }}>
              Admin Panel
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
            Hola, {user?.name?.split(' ')[0] || 'Admin'}
          </Typography>
          <Tooltip title="Volver a la App (Vista Voluntario)">
            <IconButton color="inherit" onClick={() => navigate('/')}>
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
          <BadgeCenter />
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="puntos" element={<AdminPoints />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="agenda" element={<AdminAgenda />} />
          <Route path="certificados" element={<AdminCertificates />} />
          <Route path="config" element={<AdminConfig />} />
          {user?.role === 'superadmin' && <Route path="administradores" element={<AdminAdministrators />} />}
        </Routes>
      </Box>
    </Box>
  )
}
