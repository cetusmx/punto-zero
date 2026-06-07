import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, MenuItem, FormControl, FormLabel,
  RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup, CircularProgress,
  Alert, Card, CardContent, Grid, Divider
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import SaveIcon from '@mui/icons-material/Save'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const GENDERS = ['Hombre', 'Mujer', 'Otro', 'Prefiero no decir']
const AGE_RANGES = ['<20', '20-29', '30-39', '40-49', '50-59', '60+', 'OTRA']
const SCHEMES = ['Puntos de Acopio', 'Ruta en casa']
const RESIDUE_TYPES = ['Crudos', 'Heces y guisados']
const FREQUENCIES = ['Semanal', 'Quincenal']

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const isMandatory = !user?.gender

  const [form, setForm] = useState({
    gender: user?.gender || '',
    age: user?.age || '',
    esquema: user?.esquema || 'Puntos de Acopio',
    residuo: user?.residuo ? user.residuo.split(', ') : [],
    frecuencia: user?.frecuencia || 'Semanal',
  })

  useEffect(() => {
    if (user) {
      setForm({
        gender: user.gender || '',
        age: user.age || '',
        esquema: user.esquema || 'Puntos de Acopio',
        residuo: user.residuo ? user.residuo.split(', ') : [],
        frecuencia: user.frecuencia || 'Semanal',
      })
    }
  }, [user])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleResidueChange(type) {
    setForm(prev => {
      const current = prev.residuo
      const next = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type]
      return { ...prev, residuo: next }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...form,
        residuo: form.residuo.join(', ')
      }
      const { data } = await api.put('/auth/profile', payload)
      updateUser(data.user)
      setSuccess('Perfil actualizado correctamente.')
      if (isMandatory) {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al actualizar el perfil.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = form.gender && form.age && form.esquema && form.residuo.length > 0 && form.frecuencia

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
        {isMandatory ? 'Completa tu perfil' : 'Mi Perfil'}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {isMandatory 
          ? 'Necesitamos algunos datos adicionales para comenzar.' 
          : 'Gestiona tu información personal y de participación.'}
      </Typography>

      <Card elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        mb: 4
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Información Básica</Typography>
                <TextField fullWidth label="Nombre" value={user?.name || ''} disabled sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Teléfono" value={user?.phone || ''} disabled />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Correo" value={user?.email || ''} disabled />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Datos Demográficos</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Género"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                    >
                      {GENDERS.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Rango de Edad"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      required
                    >
                      {AGE_RANGES.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Participación</Typography>
                
                <FormControl component="fieldset" sx={{ mb: 2, display: 'block' }}>
                  <FormLabel component="legend">Esquema</FormLabel>
                  <RadioGroup row name="esquema" value={form.esquema} onChange={handleChange}>
                    {SCHEMES.map(option => (
                      <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                    ))}
                  </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" sx={{ mb: 2, display: 'block' }}>
                  <FormLabel component="legend">Tipo de Residuo</FormLabel>
                  <FormGroup row>
                    {RESIDUE_TYPES.map(type => (
                      <FormControlLabel
                        key={type}
                        control={
                          <Checkbox 
                            checked={form.residuo.includes(type)} 
                            onChange={() => handleResidueChange(type)} 
                          />
                        }
                        label={type}
                      />
                    ))}
                  </FormGroup>
                </FormControl>

                <FormControl component="fieldset" sx={{ display: 'block' }}>
                  <FormLabel component="legend">Frecuencia</FormLabel>
                  <RadioGroup row name="frecuencia" value={form.frecuencia} onChange={handleChange}>
                    {FREQUENCIES.map(option => (
                      <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !isFormValid}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600 }}
                >
                  {isMandatory ? 'Finalizar Registro' : 'Guardar Cambios'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {!isMandatory && (
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          fullWidth
          sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600 }}
        >
          Cerrar sesión
        </Button>
      )}
    </Box>
  )
}
