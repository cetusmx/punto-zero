import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Button, Alert, CircularProgress, Stack, TextField,
  MenuItem
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RefreshIcon from '@mui/icons-material/Refresh'
import { format, startOfWeek, addDays, isSaturday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../../lib/api'

const STATUS_COLORS = {
  Pendiente: 'warning',
  Asistio: 'success',
  Falta: 'error',
  Cancelado: 'default',
}

export default function AdminAgenda() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [turns, setTurns] = useState([])
  
  // Generate list of recent and future Saturdays
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const currentSaturday = isSaturday(today) ? today : addDays(startOfWeek(today), 6)
    return format(currentSaturday, 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchTurns()
  }, [selectedDate])

  async function fetchTurns() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/admin/agenda/turns?date=${selectedDate}`)
      setTurns(data)
    } catch (err) {
      setError('Error al cargar los turnos del sábado seleccionado.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(id, newStatus) {
    try {
      await api.patch(`/admin/agenda/turns/${id}/status`, { status: newStatus })
      fetchTurns()
    } catch (err) {
      setError('Error al actualizar el estatus.')
    }
  }

  // Generate 4 Saturdays (2 past, 2 future roughly)
  const saturdays = []
  const today = new Date()
  const baseSat = addDays(startOfWeek(today), -7) // Start from last week
  for (let i = 0; i < 6; i++) {
    saturdays.push(addDays(baseSat, i * 7))
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Gestión Sabatina</Typography>
          <Typography color="text.secondary">Control de asistencia y asignaciones</Typography>
        </Box>
        <IconButton onClick={fetchTurns} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Seleccionar Sábado</Typography>
              <TextField
                select
                fullWidth
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                size="small"
              >
                {saturdays.map((sat) => (
                  <MenuItem key={sat.toISOString()} value={format(sat, 'yyyy-MM-dd')}>
                    {format(sat, "d 'de' MMMM", { locale: es })}
                  </MenuItem>
                ))}
              </TextField>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>{error}</Alert>}

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Voluntario</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Punto de Acopio</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estatus</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : turns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Typography color="text.disabled">No hay turnos registrados para esta fecha.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  turns.map((turn) => (
                    <TableRow key={turn.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{turn.user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{turn.user.phone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{turn.point.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{turn.point.colonia}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={turn.status} 
                          color={STATUS_COLORS[turn.status]} 
                          size="small" 
                          sx={{ fontWeight: 600, borderRadius: '8px' }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {turn.status !== 'Asistio' && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="success" 
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleUpdateStatus(turn.id, 'Asistio')}
                              sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                              Asistencia
                            </Button>
                          )}
                          {turn.status !== 'Falta' && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error" 
                              startIcon={<CancelIcon />}
                              onClick={() => handleUpdateStatus(turn.id, 'Falta')}
                              sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                              Falta
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  )
}
