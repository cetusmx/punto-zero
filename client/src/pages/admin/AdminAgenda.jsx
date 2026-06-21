import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Button, Alert, CircularProgress, Stack, TextField,
  MenuItem, Checkbox, Dialog, DialogTitle, DialogContent,
  DialogActions, Autocomplete, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RefreshIcon from '@mui/icons-material/Refresh'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { format, addDays, isSaturday } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../../lib/api'
import ConfirmDialog from '../../components/ConfirmDialog'

const STATUS_COLORS = {
  Pendiente: 'warning',
  Asistio: 'success',
  Falta: 'error',
  Cancelado: 'default',
  Vacante: 'info',
}

export default function AdminAgenda() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [turns, setTurns] = useState([])
  
  // Replacement modal states
  const [replacementOpen, setReplacementOpen] = useState(false)
  const [replacementPoint, setReplacementPoint] = useState(null)
  const [volunteers, setVolunteers] = useState([])
  const [selectedVolunteer, setSelectedVolunteer] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  // Mass Cancel states
  const [upcomingTurns, setUpcomingTurns] = useState([])
  const [massCancelIds, setMassCancelIds] = useState([])
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const [accordionExpanded, setAccordionExpanded] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState({ open: false })

  // Generate list of recent and future Saturdays
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const currentSaturday = isSaturday(today) ? today : addDays(today, 6 - today.getDay())
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

  async function fetchUpcoming() {
    setUpcomingLoading(true)
    try {
      const { data } = await api.get('/admin/agenda/upcoming-turns')
      setUpcomingTurns(data)
    } catch (err) {
      setError('Error al cargar próximas reservas.')
    } finally {
      setUpcomingLoading(false)
    }
  }

  function handleAccordionChange(event, isExpanded) {
    setAccordionExpanded(isExpanded)
    if (isExpanded) {
      fetchUpcoming()
      setMassCancelIds([])
    }
  }

  async function handleUpdateStatus(id, newStatus) {
    try {
      await api.patch(`/admin/agenda/turns/${id}/status`, { status: newStatus })
      fetchTurns()
      if (accordionExpanded) fetchUpcoming()
    } catch (err) {
      setError('Error al actualizar el estatus.')
    }
  }

  const handleCancelTurn = (id) => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Turno',
      message: '¿Estás seguro de que deseas cancelar este turno?',
      confirmColor: 'error',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }))
        await executeCancelTurn(id)
        setConfirmDialog(prev => ({ ...prev, open: false }))
      }
    })
  }

  const executeCancelTurn = async (id) => {
    try {
      await api.post(`/admin/agenda/turns/${id}/cancel`)
      fetchTurns()
      if (accordionExpanded) fetchUpcoming()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al cancelar el turno.')
    }
  }

  const handleBulkCancel = () => {
    if (massCancelIds.length === 0) return
    setConfirmDialog({
      open: true,
      title: 'Cancelación Masiva',
      message: `¿Estás seguro de que deseas cancelar los ${massCancelIds.length} turnos seleccionados?`,
      confirmColor: 'error',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }))
        await executeBulkCancel()
        setConfirmDialog(prev => ({ ...prev, open: false }))
      }
    })
  }

  const executeBulkCancel = async () => {
    try {
      await api.post('/admin/agenda/turns/cancel-multiple', { ids: massCancelIds })
      setMassCancelIds([])
      fetchUpcoming()
      fetchTurns()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al realizar la cancelación masiva.')
    }
  }

  async function openReplacementModal(point) {
    setReplacementPoint(point)
    setReplacementOpen(true)
    setSelectedVolunteer(null)
    setModalLoading(true)
    setModalError('')
    try {
      const { data } = await api.get(`/admin/users/eligible-volunteers?date=${selectedDate}`)
      setVolunteers(data)
    } catch (err) {
      setModalError('Error al cargar la lista de voluntarios elegibles.')
    } finally {
      setModalLoading(false)
    }
  }

  async function handleAssignReplacement() {
    if (!selectedVolunteer || !replacementPoint) return
    setModalLoading(true)
    setModalError('')
    try {
      await api.post('/admin/agenda/turns/assign-replacement', {
        pointId: replacementPoint.id,
        saturdayDate: selectedDate,
        userId: selectedVolunteer.id
      })
      setReplacementOpen(false)
      setSelectedVolunteer(null)
      fetchTurns()
      if (accordionExpanded) fetchUpcoming()
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Error al asignar el reemplazo.')
    } finally {
      setModalLoading(false)
    }
  }

  // Generate 6 Saturdays (1 past, 5 future)
  const saturdays = []
  const today = new Date()
  const prevSatOffset = -(today.getDay() + 1)
  const baseSat = addDays(today, prevSatOffset) // Precise previous Saturday calculation
  for (let i = 0; i < 6; i++) {
    saturdays.push(addDays(baseSat, i * 7))
  }

  const isAllUpcomingSelected = upcomingTurns.length > 0 && massCancelIds.length === upcomingTurns.length

  const handleSelectAllUpcoming = (e) => {
    if (e.target.checked) {
      setMassCancelIds(upcomingTurns.map(t => t.id))
    } else {
      setMassCancelIds([])
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Gestión Sabatina</Typography>
          <Typography color="text.secondary">Control de asistencia, cancelaciones y asignación de reemplazos</Typography>
        </Box>
        <IconButton onClick={() => { fetchTurns(); if(accordionExpanded) fetchUpcoming(); }} disabled={loading || upcomingLoading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Expandable Panel for Mass Cancellations of Upcoming Bookings */}
      <Accordion 
        expanded={accordionExpanded} 
        onChange={handleAccordionChange}
        sx={{ mb: 4, borderRadius: '24px !important', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.50', py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Cancelación Masiva de Próximos Turnos</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {massCancelIds.length > 0 && (
            <Box sx={{ p: 2, bgcolor: 'error.50', borderBottom: '1px solid', borderColor: 'error.100', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography color="error.main" variant="body2" sx={{ fontWeight: 600 }}>
                {massCancelIds.length} turno(s) seleccionado(s) para cancelar
              </Typography>
              <Button
                size="small"
                color="error"
                variant="contained"
                startIcon={<DeleteSweepIcon />}
                onClick={handleBulkCancel}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Ejecutar Cancelación
              </Button>
            </Box>
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={massCancelIds.length > 0 && massCancelIds.length < upcomingTurns.length}
                      checked={isAllUpcomingSelected}
                      onChange={handleSelectAllUpcoming}
                      size="small"
                      disabled={upcomingTurns.length === 0}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Voluntario</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Punto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upcomingLoading ? (
                  <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} sx={{ my: 2 }} /></TableCell></TableRow>
                ) : upcomingTurns.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}><Typography color="text.secondary">No hay reservas pendientes futuras.</Typography></TableCell></TableRow>
                ) : (
                  upcomingTurns.map(turn => (
                    <TableRow key={turn.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={massCancelIds.includes(turn.id)}
                          onChange={(e) => {
                            if (e.target.checked) setMassCancelIds(prev => [...prev, turn.id])
                            else setMassCancelIds(prev => prev.filter(id => id !== turn.id))
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{format(new Date(turn.saturdayDate), "d 'de' MMMM", { locale: es })}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{turn.user.name}</Typography>
                      </TableCell>
                      <TableCell>{turn.point.name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

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
                      <Typography color="text.disabled">No hay puntos de acopio activos registrados.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  turns.map((turn) => (
                    <TableRow key={turn.id} hover>
                      <TableCell>
                        {turn.user ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{turn.user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{turn.user.phone}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                            {turn.status === 'Cancelado' ? 'Cancelado (Sin asignar)' : 'Vacante (Sin reservar)'}
                          </Typography>
                        )}
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
                          {turn.user && turn.status !== 'Cancelado' ? (
                            <>
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
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<CancelIcon />}
                                onClick={() => handleCancelTurn(turn.id)}
                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<PersonAddIcon />}
                              onClick={() => openReplacementModal(turn.point)}
                              sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                              Asignar Reemplazo
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

      {/* Replacement Assignment Modal */}
      <Dialog 
        open={replacementOpen} 
        onClose={() => setReplacementOpen(false)} 
        fullWidth 
        maxWidth="xs" 
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Asignar Reemplazo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Selecciona un voluntario elegible para asignar al punto <strong>{replacementPoint?.name}</strong> para el sábado <strong>{selectedDate}</strong>.
          </Typography>
          {modalError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{modalError}</Alert>}
          {modalLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Autocomplete
              options={volunteers}
              getOptionLabel={(option) => `${option.name} (${option.phone})`}
              value={selectedVolunteer}
              onChange={(event, newValue) => setSelectedVolunteer(newValue)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Buscar Voluntario" 
                  variant="outlined" 
                  size="small" 
                  helperText="Solo se listan voluntarios habilitados y en estado Alta sin turnos este día"
                />
              )}
              noOptionsText="No hay voluntarios elegibles disponibles"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setReplacementOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
            Volver
          </Button>
          <Button 
            onClick={handleAssignReplacement} 
            variant="contained" 
            color="primary" 
            disabled={!selectedVolunteer || modalLoading}
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            Asignar Reemplazo
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmColor={confirmDialog.confirmColor}
        loading={confirmDialog.loading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </Box>
  )
}
