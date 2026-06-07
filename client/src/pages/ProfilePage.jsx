import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box>
      <Typography variant="h4">Perfil</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Gestiona tu información personal</Typography>

      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        fullWidth
        sx={{ borderRadius: 3, py: 1.5 }}
      >
        Cerrar sesión
      </Button>
    </Box>
  )
}
