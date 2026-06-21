import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Card, CardContent, Stack, Chip, Button, 
  CircularProgress, Alert, alpha, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import HistoryIcon from '@mui/icons-material/History'
import CancelIcon from '@mui/icons-material/Cancel'
import { format, isAfter, startOfDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../lib/api'

const STATUS_COLORS = {
  Pendiente: { color: 'warning', label: 'Pendiente' },
  Asistio: { color: 'success', label: 'Asistió' },
  Falta: { color: 'error', label: 'Falta' },
  Cancelado: { color: 'default', label: 'Cancelado' },
}

export default function MySchedulesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [turns, setTurns] = useState([])

  const [cancelDialogOpen, setCancelOpen] = useState(false)
  const [selectedTurn, setSelectedTurn] = useState(null)

  useEffect(() => {
    fetchMyTurns()
  }, [])

  async function fetchMyTurns() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/agenda/my-turns')
      setTurns(data)
    } catch {
      setError('Error al cargar tus turnos. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelTurn() {
    setCancelOpen(false)
    setCancelLoading(true)
    setError('')
    try {
      await api.post(`/agenda/cancel/${selectedTurn.id}`)
      setSuccess('Turno cancelado exitosamente.')
      await fetchMyTurns()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al cancelar el turno.')
    } finally {
      setCancelLoading(false)
    }
  }

  function openCancel(turn) {
    setSelectedTurn(turn)
    setCancelOpen(true)
  }

  const today = startOfDay(new Date())

  const upcomingTurns = turns.filter(t => 
    (isAfter(parseISO(t.saturdayDate), today) || t.saturdayDate === today.toISOString()) && 
    t.status === 'Pendiente'
  )

  const historyTurns = turns.filter(t => 
    !upcomingTurns.find(ut => ut.id === t.id)
  )

  function TurnCard({ turn, isUpcoming }) {
    const statusInfo = STATUS_COLORS[turn.status] || { color: 'default', label: turn.status }
    
    return (
      <Card elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,.04)',
        mb: 2
      }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {format(parseISO(turn.saturdayDate), "EEEE d 'de' MMMM", { locale: es })}
                </Typography>
                <Chip 
                  label={statusInfo.label} 
                  color={statusInfo.color} 
                  size="small" 
                  sx={{ fontWeight: 600, borderRadius: '8px' }} 
                />
              </Box>
              
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{turn.point.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{turn.point.address}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{turn.point.horario}</Typography>
                </Box>
              </Stack>
            </Grid>
            {isUpcoming && (
              <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<CancelIcon />}
                  onClick={() => openCancel(turn)}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Cancelar turno
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
        Mis Turnos
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Gestiona tus próximas participaciones y revisa tu historial.
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '16px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>{error}</Alert>}
      {cancelLoading && <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={20} /> <Typography variant="body2">Cancelando turno...</Typography></Box>}

      <Grid container spacing={4}>
        {/* Upcoming Turns */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <EventAvailableIcon color="primary" /> Próximos Turnos
          </Typography>
          
          {upcomingTurns.length === 0 ? (
            <Box sx={{ 
              p: 4, textAlign: 'center', borderRadius: '24px', 
              bgcolor: alpha('#000', 0.02), border: '2px dashed', borderColor: 'divider' 
            }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No tienes turnos programados.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/agenda')}
                sx={{ mt: 2, borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
              >
                Ir a la Agenda
              </Button>
            </Box>
          ) : (
            upcomingTurns.map(turn => <TurnCard key={turn.id} turn={turn} isUpcoming={true} />)
          )}
        </Grid>

        {/* Attendance History */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <HistoryIcon color="action" /> Historial de Asistencia
          </Typography>

          {historyTurns.length === 0 ? (
            <Box sx={{ 
              p: 4, textAlign: 'center', borderRadius: '24px', 
              bgcolor: alpha('#000', 0.02), border: '2px dashed', borderColor: 'divider' 
            }}>
              <Typography variant="body1" color="text.secondary">
                Aún no tienes historial de participación.
              </Typography>
            </Box>
          ) : (
            historyTurns.map(turn => <TurnCard key={turn.id} turn={turn} isUpcoming={false} />)
          )}
        </Grid>
      </Grid>

      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelOpen(false)} PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Cancelar este turno?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción liberará el espacio para otros voluntarios. Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCancelOpen(false)} sx={{ fontWeight: 600 }}>Volver</Button>
          <Button onClick={handleCancelTurn} color="error" variant="contained" sx={{ borderRadius: '12px', fontWeight: 600 }}>
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
