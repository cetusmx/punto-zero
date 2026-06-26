import { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, MenuItem, FormControl, FormLabel,
  RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup, CircularProgress,
  Alert, Card, CardContent, Grid, Divider, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Stack, List, ListItem, Badge
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import SaveIcon from '@mui/icons-material/Save'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../lib/api'

const GENDERS = ['Hombre', 'Mujer', 'Otro', 'Prefiero no decir']
const AGE_RANGES = ['<20', '20-29', '30-39', '40-49', '50-59', '60+', 'OTRA']
const SCHEMES = ['Puntos de Acopio', 'Ruta en casa']
const RESIDUE_TYPES = ['Crudos', 'Heces y guisados']
const FREQUENCIES = ['Semanal', 'Quincenal']
const STATUS_OPTIONS = ['Alta', 'Pausa', 'Baja']

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const { notifications, fetchNotifications } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  const [links, setLinks] = useState({ whatsapp_avisos_url: '', whatsapp_abierto_url: '' })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState('')
  const [expandedNotifId, setExpandedNotifId] = useState(null)

  const isMandatory = !user?.gender

  const [form, setForm] = useState({
    gender: user?.gender || '',
    age: user?.age || '',
    esquema: user?.esquema || 'Puntos de Acopio',
    residuo: user?.residuo ? user.residuo.split(', ') : [],
    frecuencia: user?.frecuencia || 'Semanal',
    status: user?.status || 'Alta',
  })

  useEffect(() => {
    fetchNotifications()
    // eslint-disable-next-line
  }, [])

  async function fetchLinks() {
    if (user?.status !== 'Alta') return
    try {
      const { data } = await api.get('/config')
      
      const makeValidUrl = (url) => {
        if (!url) return '';
        let urlStr = url.trim();
        if (!/^https?:\/\//i.test(urlStr)) {
          urlStr = 'https://' + urlStr;
        }
        try {
          new URL(urlStr);
          return urlStr;
        } catch {
          return '';
        }
      };

      setLinks({
        whatsapp_avisos_url: makeValidUrl(data.data.whatsapp_avisos_url),
        whatsapp_abierto_url: makeValidUrl(data.data.whatsapp_abierto_url)
      })
    } catch (err) {
      console.error('Error fetching links', err)
    }
  }

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      setForm({
        gender: user.gender || '',
        age: user.age || '',
        esquema: user.esquema || 'Puntos de Acopio',
        residuo: user.residuo ? user.residuo.split(', ') : [],
        frecuencia: user.frecuencia || 'Semanal',
        status: user.status || 'Alta',
      })
    }
    fetchLinks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'status' && (value === 'Pausa' || value === 'Baja') && user.status === 'Alta') {
      setPendingStatus(value)
      setConfirmOpen(true)
      return
    }
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleConfirmStatus() {
    setConfirmOpen(false)
    setLoading(true)
    try {
      const { data } = await api.post('/auth/status', { status: pendingStatus })
      updateUser(data.user)
      setForm(prev => ({ ...prev, status: data.user.status }))
      setSuccess('Estatus actualizado y calendarizaciones canceladas.')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al cambiar estatus.')
    } finally {
      setLoading(false)
    }
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


      {user?.status === 'Alta' && (
        <Card elevation={0} sx={{ 
          borderRadius: '24px', 
          border: '1px solid',
          borderColor: 'primary.light',
          bgcolor: 'primary.50',
          mb: 4
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WhatsAppIcon color="success" /> Grupos de la Comunidad
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                color="success"
                href={links.whatsapp_avisos_url}
                target="_blank"
                sx={{ borderRadius: '12px', textTransform: 'none' }}
                disabled={!links.whatsapp_avisos_url}
              >
                Grupo de Avisos
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="success"
                href={links.whatsapp_abierto_url}
                target="_blank"
                sx={{ borderRadius: '12px', textTransform: 'none' }}
                disabled={!links.whatsapp_abierto_url}
              >
                Grupo Abierto
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

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
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Información de Cuenta</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField fullWidth label="Nombre" value={user?.name || ''} disabled sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      label="Estatus"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
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

      {!isMandatory && notifications && notifications.length > 0 && (
        <Card elevation={0} sx={{
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          mb: 4,
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon color="primary" /> Últimas notificaciones
            </Typography>
            <Button
              component={RouterLink}
              to="/notificaciones"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Ver todas
            </Button>
          </Box>
          <List disablePadding>
            {notifications.slice(0, 3).map((notif, index) => {
              const isExpanded = expandedNotifId === notif.id
              return (
                <Box key={notif.id}>
                  <ListItem 
                    button 
                    onClick={() => setExpandedNotifId(isExpanded ? null : notif.id)}
                    sx={{ bgcolor: notif.read ? 'transparent' : 'primary.50', py: 2 }}
                  >
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                      <Badge color="error" variant="dot" invisible={notif.read} sx={{ mr: 2, mt: 1 }}>
                        <NotificationsIcon fontSize="small" color={notif.read ? "disabled" : "primary"} />
                      </Badge>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notif.read ? 600 : 700 }}>
                          {notif.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 0.5, 
                            display: isExpanded ? 'block' : '-webkit-box', 
                            WebkitLineClamp: isExpanded ? 'unset' : 2, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden' 
                          }}
                        >
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < Math.min(notifications.length - 1, 2) && <Divider />}
                </Box>
              )
            })}
          </List>
        </Card>
      )}

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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar cambio de estatus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Este cambio cancelará <strong>TODAS</strong> tus calendarizaciones futuras. ¿Estás seguro de que deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmStatus} color="error" autoFocus>
            Confirmar y Cancelar Turnos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
