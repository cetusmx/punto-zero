import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, MenuItem, TextField,
  FormControlLabel, Switch, Alert, Skeleton, Stack, Chip, Button, Divider, alpha
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { format, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import CalendarGrid from '../components/agenda/CalendarGrid'
import api from '../lib/api'

export default function AgendaPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState({ points: [], schedulings: [] })
  const [filters, setFilters] = useState({ colonias: [], points: [] })
  
  const [selectedColonia, setSelectedColonia] = useState('')
  const [selectedPointId, setSelectedPointId] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    fetchFilters()
    fetchSlots()
  }, [selectedColonia, selectedPointId])

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
    } catch (err) {
      setError('Error al cargar la disponibilidad. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
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

      <Grid container spacing={3}>
        {/* Left Side: Filters and Calendar */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
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
          </Stack>
        </Grid>

        {/* Right Side: Slot List */}
        <Grid item xs={12} md={7}>
          {!selectedDate ? (
            <Card elevation={0} sx={{ 
              height: { md: '100%' },
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
        </Grid>
      </Grid>
    </Box>
  )
}
