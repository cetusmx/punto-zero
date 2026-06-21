import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Button, Alert, CircularProgress, Stack, TextField,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Switch, Tooltip, List, ListItem, ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import { format, isSaturday } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../../lib/api'

function PointFormDialog({ open, onClose, point, onSaved }) {
  const [formData, setFormData] = useState({
    name: '', colonia: '', address: '', lat: '', lng: '', horario: '', status: 'Activo'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (point) {
        setFormData({
          name: point.name,
          colonia: point.colonia,
          address: point.address || '',
          lat: point.lat || '',
          lng: point.lng || '',
          horario: point.horario || '',
          status: point.status
        })
      } else {
        setFormData({
          name: '', colonia: '', address: '', lat: '', lng: '', horario: '', status: 'Activo'
        })
      }
      setError('')
    }
  }, [open, point])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (point) {
        await api.put(`/admin/collection-points/${point.id}`, formData)
      } else {
        await api.post('/admin/collection-points', formData)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al guardar el punto de acopio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px' } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {point ? 'Editar Punto de Acopio' : 'Crear Punto de Acopio'}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Nombre" name="name" value={formData.name} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Colonia" name="colonia" value={formData.colonia} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Dirección (opcional)" name="address" value={formData.address} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" inputProps={{ step: "any" }} label="Latitud (opcional)" name="lat" value={formData.lat} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" inputProps={{ step: "any" }} label="Longitud (opcional)" name="lng" value={formData.lng} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Horario (opcional)" name="horario" value={formData.horario} onChange={handleChange} size="small" placeholder="Ej. 10:00 - 14:00" />
            </Grid>
            {point && (
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="Estado" name="status" value={formData.status} onChange={handleChange} size="small">
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ borderRadius: '8px', textTransform: 'none' }}>
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

function ExceptionsDialog({ open, onClose, point }) {
  const [exceptions, setExceptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (open && point) {
      fetchExceptions()
      setDateStr('')
      setReason('')
      setError('')
    }
  }, [open, point])

  const fetchExceptions = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/collection-points/${point.id}/exceptions`)
      setExceptions(data)
    } catch (err) {
      setError('Error al cargar excepciones.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddException = async () => {
    if (!dateStr) return
    const targetDate = new Date(`${dateStr}T12:00:00`)
    if (!isSaturday(targetDate)) {
      setError('La fecha seleccionada debe ser un sábado.')
      return
    }

    // Confirmation text about cancelling active turns
    if (!window.confirm('¿Estás seguro de inhabilitar este sábado? Las reservas activas para este día se cancelarán automáticamente y se notificará a los usuarios afectados.')) return

    setActionLoading(true)
    setError('')
    try {
      await api.post(`/admin/collection-points/${point.id}/exceptions`, {
        date: dateStr,
        reason
      })
      setDateStr('')
      setReason('')
      fetchExceptions()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al agregar excepción.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteException = async (date) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta excepción? El sábado volverá a estar disponible para reservas.')) return
    setActionLoading(true)
    setError('')
    try {
      // Use YYYY-MM-DD directly from the ISO string to avoid timezone drift
      const formattedDate = typeof date === 'string' && date.includes('T') ? date.split('T')[0] : format(new Date(date), 'yyyy-MM-dd')
      await api.delete(`/admin/collection-points/${point.id}/exceptions/${formattedDate}`)
      fetchExceptions()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al eliminar excepción.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Excepciones: {point?.name}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: '12px' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Agregar Excepción (Inhabilitar Sábado)</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField 
                fullWidth 
                type="date" 
                label="Fecha (sábado)" 
                InputLabelProps={{ shrink: true }}
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={7}>
              <TextField 
                fullWidth 
                label="Razón (opcional)" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="warning" 
                onClick={handleAddException} 
                disabled={actionLoading || !dateStr}
                fullWidth
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Inhabilitar Día
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Sábados Inhabilitados Próximos</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>
        ) : exceptions.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 3, fontStyle: 'italic' }}>
            No hay excepciones futuras registradas.
          </Typography>
        ) : (
          <List>
            {exceptions.map((exc) => (
              <ListItem key={exc.id} divider>
                <ListItemText 
                  primary={format(new Date(exc.saturdayDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  secondary={exc.reason || 'Sin razón especificada'} 
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteException(exc.saturdayDate)} disabled={actionLoading}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}

export default function AdminPoints() {
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form Modal
  const [formOpen, setFormOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState(null)

  // Exceptions Modal
  const [exceptionsOpen, setExceptionsOpen] = useState(false)
  const [exceptionsPoint, setExceptionsPoint] = useState(null)

  useEffect(() => {
    fetchPoints()
  }, [])

  const fetchPoints = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/admin/collection-points')
      setPoints(data)
    } catch (err) {
      setError('Error al cargar puntos de acopio.')
    } finally {
      setLoading(false)
    }
  }

  const openCreateForm = () => {
    setEditingPoint(null)
    setFormOpen(true)
  }

  const openEditForm = (point) => {
    setEditingPoint(point)
    setFormOpen(true)
  }

  const openExceptions = (point) => {
    setExceptionsPoint(point)
    setExceptionsOpen(true)
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Puntos de Acopio</Typography>
          <Typography color="text.secondary">Gestiona ubicaciones, horarios y disponibilidad sabatina</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={fetchPoints} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={openCreateForm}
            sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}
          >
            Crear Punto
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Nombre y Ubicación</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Horario</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}><CircularProgress size={32} /></TableCell></TableRow>
            ) : points.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}><Typography color="text.disabled">No hay puntos registrados.</Typography></TableCell></TableRow>
            ) : (
              points.map((point) => (
                <TableRow key={point.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{point.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{point.colonia} {point.address ? `- ${point.address}` : ''}</Typography>
                  </TableCell>
                  <TableCell>{point.horario || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={point.status} 
                      color={point.status === 'Activo' ? 'success' : 'default'} 
                      size="small" 
                      sx={{ fontWeight: 600, borderRadius: '8px' }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Excepciones y Feriados">
                        <IconButton size="small" color="warning" onClick={() => openExceptions(point)}>
                          <EventBusyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar Punto">
                        <IconButton size="small" color="primary" onClick={() => openEditForm(point)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PointFormDialog 
        open={formOpen} 
        onClose={() => setFormOpen(false)} 
        point={editingPoint} 
        onSaved={fetchPoints} 
      />

      <ExceptionsDialog 
        open={exceptionsOpen} 
        onClose={() => setExceptionsOpen(false)} 
        point={exceptionsPoint} 
      />
    </Box>
  )
}
