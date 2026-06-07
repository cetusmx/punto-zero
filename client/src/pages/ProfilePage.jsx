import { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, TextField, Button, Alert, MenuItem, Divider } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({})
  const [links, setLinks] = useState({ avisos: null, abierto: null })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        gender: user.gender || '',
        age: user.age || '',
        esquema: user.esquema || '',
        residuo: user.residuo || '',
        frecuencia: user.frecuencia || '',
        status: user.status || 'Alta',
      })
    }
    api.get('/users/whatsapp-links').then(({ data }) => setLinks(data)).catch(() => {})
  }, [user])

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSave = async () => {
    setError('')
    setSaved(false)
    setLoading(true)
    try {
      await api.put('/users/profile', form)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const statusLabel = { Alta: 'Alta', Pausa: 'Pausa', Baja: 'Baja' }

  return (
    <Box pb={2}>
      <Typography variant="h5" gutterBottom>Mi Perfil</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Perfil actualizado</Alert>}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Información personal</Typography>
          <TextField fullWidth label="Nombre" margin="dense" value={form.name} onChange={handleChange('name')} />
          <TextField fullWidth label="Email" margin="dense" value={form.email} onChange={handleChange('email')} helperText="Solo para contacto" />
          <TextField fullWidth label="Teléfono" margin="dense" value={user?.phone || ''} disabled />
          <TextField fullWidth label="Género" select margin="dense" value={form.gender} onChange={handleChange('gender')}>
            <MenuItem value="Hombre">Hombre</MenuItem>
            <MenuItem value="Mujer">Mujer</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
            <MenuItem value="">Prefiero no decirlo</MenuItem>
          </TextField>
          <TextField fullWidth label="Edad" type="number" margin="dense" value={form.age} onChange={handleChange('age')} />
          <TextField fullWidth label="Esquema" margin="dense" value={form.esquema} onChange={handleChange('esquema')} />
          <TextField fullWidth label="Residuo" margin="dense" value={form.residuo} onChange={handleChange('residuo')} />
          <TextField fullWidth label="Frecuencia" margin="dense" value={form.frecuencia} onChange={handleChange('frecuencia')} />
          <Button variant="contained" onClick={handleSave} disabled={loading} sx={{ mt: 2 }}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Estatus</Typography>
          <TextField fullWidth label="Estatus" select margin="dense" value={form.status} onChange={handleChange('status')}>
            {Object.entries(statusLabel).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
          </TextField>
          <Typography variant="caption" color="text.secondary">
            {form.status === 'Alta' ? 'Activo en el programa' : form.status === 'Pausa' ? 'Temporalmente inactivo' : 'Baja del programa'}
          </Typography>
        </CardContent>
      </Card>

      {(links.avisos || links.abierto) && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Grupos de WhatsApp</Typography>
            {links.avisos && (
              <Button fullWidth variant="outlined" href={links.avisos} target="_blank" sx={{ mb: 1 }}>
                Grupo de Avisos
              </Button>
            )}
            {links.abierto && (
              <Button fullWidth variant="outlined" href={links.abierto} target="_blank">
                Grupo Abierto
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Button fullWidth variant="text" color="error" onClick={logout}>
        Cerrar sesión
      </Button>
    </Box>
  )
}
