import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Alert, MenuItem } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const { fetchProfile } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', gender: '', age: '', esquema: '', residuo: '', frecuencia: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) { setError('El nombre es obligatorio'); return }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email inválido'); return }
    setError('')
    setLoading(true)
    try {
      await api.put('/users/profile', form)
      localStorage.removeItem('isFirstLogin')
      await fetchProfile()
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al guardar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Completa tu Perfil</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Es la primera vez que inicias sesión. Necesitamos estos datos para continuar.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Nombre *" margin="normal" required value={form.name} onChange={handleChange('name')} />
            <TextField fullWidth label="Email" type="email" margin="normal" value={form.email} onChange={handleChange('email')} helperText="Solo para contacto, no para autenticación" />
            <TextField fullWidth label="Género" select margin="normal" value={form.gender} onChange={handleChange('gender')}>
              <MenuItem value="Hombre">Hombre</MenuItem>
              <MenuItem value="Mujer">Mujer</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
              <MenuItem value="">Prefiero no decirlo</MenuItem>
            </TextField>
            <TextField fullWidth label="Edad" type="number" margin="normal" value={form.age} onChange={handleChange('age')} />
            <TextField fullWidth label="Esquema" margin="normal" value={form.esquema} onChange={handleChange('esquema')} />
            <TextField fullWidth label="Residuo" margin="normal" value={form.residuo} onChange={handleChange('residuo')} />
            <TextField fullWidth label="Frecuencia" margin="normal" value={form.frecuencia} onChange={handleChange('frecuencia')} />
            <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
              {loading ? 'Guardando...' : 'Guardar perfil'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
