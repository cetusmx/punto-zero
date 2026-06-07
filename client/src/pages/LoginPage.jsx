import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material'
import api from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      if (data.isFirstLogin) localStorage.setItem('isFirstLogin', 'true')
      navigate(data.isFirstLogin ? '/completar-perfil' : '/')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Iniciar Sesión</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Teléfono" margin="normal" required
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="5512345678"
            />
            <TextField
              fullWidth label="Contraseña" type="password" margin="normal" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              <Link to="/registro">Registrarme</Link> |{' '}
              <Link to="/recuperar">Olvidé mi contraseña</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
