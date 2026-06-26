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
import ExemptionProgress from '../components/ExemptionProgress'
import TurnCard from '../components/TurnCard'

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

      <ExemptionProgress key={turns.map(t => t.status).join('-')} />

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
            upcomingTurns.map(turn => <TurnCard key={turn.id} turn={turn} isUpcoming={true} onCancel={openCancel} />)
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
            <Box>
              {historyTurns.slice(0, 3).map(turn => (
                <TurnCard key={turn.id} turn={turn} isUpcoming={false} />
              ))}
              {historyTurns.length > 3 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => navigate('/historial-turnos')}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                  >
                    Ver historial completo ({historyTurns.length})
                  </Button>
                </Box>
              )}
            </Box>
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
