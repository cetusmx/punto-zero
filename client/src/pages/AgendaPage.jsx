import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Card, CardContent, MenuItem, TextField,
  FormControlLabel, Switch, Alert, Skeleton, Stack, Chip, Button, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox,
  CircularProgress, Paper
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { format, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import CalendarGrid from '../components/agenda/CalendarGrid'
import api from '../lib/api'

export default function AgendaPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [data, setData] = useState({ points: [], schedulings: [] })
  const [filters, setFilters] = useState({ colonias: [], points: [] })
  
  const [selectedColonia, setSelectedColonia] = useState('')
  const [selectedPointId, setSelectedPointId] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  async function fetchFilters() {
    try {
      const { data } = await api.get('/agenda/filters')
      setFilters(data)
    } catch (err) {
      console.error('Error fetching filters', err)
    }
  }

  async function fetchSlots() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (selectedColonia) params.append('colonia', selectedColonia)
      if (selectedPointId) params.append('pointId', selectedPointId)
      
      const { data } = await api.get(`/agenda/available-slots?${params.toString()}`)
      setData(data)
    } catch {
      setError('Error al cargar la disponibilidad. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    fetchFilters()
    fetchSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColonia, selectedPointId])

  async function handleBookTurn() {
    setBookingLoading(true)
    setError('')
    try {
      await api.post('/agenda/schedule', {
        pointId: selectedSlot.id,
        saturdayDate: format(selectedDate, 'yyyy-MM-dd'),
        acceptedTerms
      })
      setSuccess('¡Turno agendado con éxito!')
      setBookingOpen(false)
      setTimeout(() => navigate('/mis-turnos'), 1500)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al agendar el turno.')
      setBookingOpen(false)
    } finally {
      setBookingLoading(false)
    }
  }

  function openBooking(slot) {
    setSelectedSlot(slot)
    setAcceptedTerms(false)
    setBookingOpen(true)
  }

  const selectedDaySlots = selectedDate ? data.points.map(point => {
    const isReserved = data.schedulings.some(s => 
      s.pointId === point.id && isSameDay(parseISO(s.saturdayDate), selectedDate)
    )
    const isUnavailable = point.unavailableDates.some(ud => 
      isSameDay(parseISO(ud.saturdayDate), selectedDate)
    )
    return { ...point, isReserved, isUnavailable }
  }).filter(slot => {
    if (onlyAvailable && slot.isReserved) return false
    if (slot.isUnavailable) return false
    return true
  }) : []

  return (
    <Box sx={{ py: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
        Agenda de Turnos
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Selecciona un sábado para ver los puntos de acopio disponibles.
      </Typography>

      {success && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 4, borderRadius: '16px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left Column: Filters and Calendar */}
        <Box sx={{ flex: { md: 5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card elevation={0} sx={{ 
            borderRadius: '24px', 
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Filtros de búsqueda</Typography>
              <Stack spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Colonia"
                  size="small"
                  value={selectedColonia}
                  onChange={(e) => setSelectedColonia(e.target.value)}
                >
                  <MenuItem value="">Todas las colonias</MenuItem>
                  {filters.colonias.map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Punto de Acopio"
                  size="small"
                  value={selectedPointId}
                  onChange={(e) => setSelectedPointId(e.target.value)}
                >
                  <MenuItem value="">Todos los puntos</MenuItem>
                  {filters.points.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </TextField>

                <FormControlLabel
                  control={<Switch checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />}
                  label={<Typography variant="body2">Solo con cupo disponible</Typography>}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ 
            borderRadius: '24px', 
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <CalendarGrid selectedDate={selectedDate} onDateSelect={setSelectedDate} />
            </CardContent>
          </Card>
        </Box>

        {/* Right Column: Slot List */}
        <Box sx={{ flex: { md: 7 } }}>
          {!selectedDate ? (
            <Card elevation={0} sx={{ 
              height: '100%',
              minHeight: 300,
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              p: 4,
              textAlign: 'center',
              bgcolor: alpha('#000', 0.02),
              borderRadius: '24px',
              border: '2px dashed',
              borderColor: 'divider'
            }}>
              <CalendarMonthIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Selecciona un sábado en el calendario
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Verás los horarios y ubicaciones disponibles para ese día.
              </Typography>
            </Card>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </Typography>
                <Chip label={`${selectedDaySlots.length} puntos`} color="primary" variant="outlined" />
              </Box>

              {loading ? (
                <Stack spacing={2}>
                  {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: '24px' }} />)}
                </Stack>
              ) : selectedDaySlots.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: '16px' }}>
                  No hay puntos disponibles para los filtros seleccionados en esta fecha.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {selectedDaySlots.map(slot => (
                    <Card key={slot.id} elevation={0} sx={{ 
                      borderRadius: '24px', 
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                              {slot.name}
                            </Typography>
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2">{slot.address}, {slot.colonia}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2">{slot.horario}</Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                            {slot.isReserved ? (
                              <Chip label="Ocupado" color="error" variant="soft" />
                            ) : (
                              <Button 
                                variant="contained" 
                                onClick={() => openBooking(slot)}
                                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                              >
                                Agendar turno
                              </Button>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Booking Confirmation Dialog */}
      <Dialog 
        open={bookingOpen} 
        onClose={() => !bookingLoading && setBookingOpen(false)}
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar reservación</DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" gutterBottom>
                Estás por agendar tu participación para el día:
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: alpha('#f4f7f4', 0.5), mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedSlot.name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedSlot.address}</Typography>
                <Typography variant="body2" color="text.secondary">Horario: {selectedSlot.horario}</Typography>
              </Paper>

              <FormControlLabel
                control={
                  <Checkbox 
                    checked={acceptedTerms} 
                    onChange={(e) => setAcceptedTerms(e.target.checked)} 
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Me comprometo a asistir puntualmente y avisar con anticipación si no puedo acudir.
                  </Typography>
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setBookingOpen(false)} 
            disabled={bookingLoading}
            sx={{ fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleBookTurn}
            disabled={!acceptedTerms || bookingLoading}
            sx={{ borderRadius: '12px', fontWeight: 600, px: 4 }}
          >
            {bookingLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Turno'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
