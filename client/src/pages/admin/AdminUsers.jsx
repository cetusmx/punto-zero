import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Button, Alert, CircularProgress, TextField,
  MenuItem, TablePagination, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Tooltip
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import { es } from 'date-fns/locale'
import api from '../../lib/api'
import ConfirmDialog from '../../components/ConfirmDialog'

// Simple debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

// Validation rules from UX
const validateField = (name, value) => {
  if (name === 'gender' && !value?.trim()) return 'El género es requerido'
  if (name === 'age' && !value?.trim()) return 'La edad es requerida'
  if (name === 'scheme' && !value?.trim()) return 'El esquema es requerido'
  if (name === 'frequency' && !value?.trim()) return 'La frecuencia es requerida'
  if (name === 'status' && !value?.trim()) return 'El estatus es requerido'
  return ''
}

function UserEditDialog({ open, onClose, user, onSaved }) {
  const [formData, setFormData] = useState({
    gender: '', age: '', scheme: '', frequency: '', status: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (open && user) {
      setFormData({
        gender: user.gender || '',
        age: user.age || '',
        scheme: user.scheme || '',
        frequency: user.frequency || '',
        status: user.status || 'Alta'
      })
      setErrors({})
      setApiError('')
    }
  }, [open, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const errorMsg = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: errorMsg }))
  }

  const isFormValid = () => {
    return (
      formData.gender &&
      formData.age &&
      formData.scheme &&
      formData.frequency &&
      formData.status &&
      Object.values(errors).every(x => !x)
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid()) return

    setLoading(true)
    setApiError('')
    try {
      await api.put(`/admin/users/${user.id}`, formData)
      onSaved()
      onClose()
    } catch (err) {
      setApiError(err.response?.data?.error?.message || 'Error al actualizar perfil.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px' } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar Usuario</DialogTitle>
        <DialogContent dividers>
          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
          <Grid container spacing={2}>
            {/* Read-only fields */}
            <Grid item xs={12}>
              <TextField fullWidth disabled label="Nombre" value={user.name} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth disabled label="Teléfono" value={user.phone} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth disabled label="Correo" value={user.email} size="small" />
            </Grid>
            
            {/* Editable fields */}
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Género" name="gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur} error={!!errors.gender} helperText={errors.gender} size="small">
                <MenuItem value="Hombre">Hombre</MenuItem>
                <MenuItem value="Mujer">Mujer</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
                <MenuItem value="Prefiero no decir">Prefiero no decir</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Edad" name="age" value={formData.age} onChange={handleChange} onBlur={handleBlur} error={!!errors.age} helperText={errors.age} size="small">
                <MenuItem value="<20">&lt;20</MenuItem>
                <MenuItem value="20-29">20-29</MenuItem>
                <MenuItem value="30-39">30-39</MenuItem>
                <MenuItem value="40-49">40-49</MenuItem>
                <MenuItem value="50-59">50-59</MenuItem>
                <MenuItem value="60+">60+</MenuItem>
                <MenuItem value="OTRA">OTRA</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Esquema" name="scheme" value={formData.scheme} onChange={handleChange} onBlur={handleBlur} error={!!errors.scheme} helperText={errors.scheme} size="small">
                <MenuItem value="Puntos de Acopio">Puntos de Acopio</MenuItem>
                <MenuItem value="Ruta en casa">Ruta en casa</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Frecuencia" name="frequency" value={formData.frequency} onChange={handleChange} onBlur={handleBlur} error={!!errors.frequency} helperText={errors.frequency} size="small">
                <MenuItem value="Semanal">Semanal</MenuItem>
                <MenuItem value="Quincenal">Quincenal</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Estatus" name="status" value={formData.status} onChange={handleChange} onBlur={handleBlur} error={!!errors.status} helperText={errors.status} size="small">
                <MenuItem value="Alta">Alta</MenuItem>
                <MenuItem value="Pausa">Pausa</MenuItem>
                <MenuItem value="Baja">Baja</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || !isFormValid()} sx={{ borderRadius: '8px', textTransform: 'none' }}>
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  // Reset page when search changes
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const [editOpen, setEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/admin/users', {
        params: {
          q: debouncedSearch,
          page: page + 1,
          limit: rowsPerPage
        }
      })
      setUsers(data.data)
      setTotalCount(data.totalCount)
    } catch (err) {
      setUsers([])
      setTotalCount(0)
      setError(err.response?.data?.error?.message || 'Error al cargar usuarios.')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handlePageChange = (event, newPage) => setPage(newPage)
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleBlockUnblock = (user) => {
    const isBlocking = user.access === 'Habilitado'
    let title = ''
    let message = ''

    if (isBlocking && user.futureSchedulingsCount > 0) {
      title = 'Bloquear y Cancelar Turnos'
      message = `Este usuario tiene ${user.futureSchedulingsCount} calendarizaciones futuras. ¿Deseas continuar? Se cancelarán y liberarán.`
    } else if (isBlocking) {
      title = 'Bloquear Usuario'
      message = `¿Seguro que deseas bloquear a ${user.name}?`
    } else {
      title = 'Desbloquear Usuario'
      message = `¿Seguro que deseas desbloquear a ${user.name}?`
    }

    setConfirmDialog({
      open: true,
      title,
      message,
      confirmColor: isBlocking ? 'error' : 'success',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }))
        try {
          await api.post(`/admin/users/${user.id}/block`, {
            action: isBlocking ? 'block' : 'unblock'
          })
          fetchUsers()
          setConfirmDialog(prev => ({ ...prev, open: false }))
        } catch (err) {
          setError(err.response?.data?.error?.message || 'Error al cambiar acceso del usuario.')
          setConfirmDialog(prev => ({ ...prev, open: false }))
        }
      }
    })
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Usuarios</Typography>
          <Typography color="text.secondary">Lista y gestión de voluntarios</Typography>
        </Box>
        <IconButton onClick={fetchUsers} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>{error}</Alert>}

      <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, teléfono, email, estatus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
            }}
            sx={{ mb: 3 }}
          />

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Nombre / Contacto</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estatus</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Acceso</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Registro</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography color="text.disabled">No se encontraron usuarios.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">{user.phone}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          size="small" 
                          color={user.status === 'Alta' ? 'success' : user.status === 'Pausa' ? 'warning' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.access} 
                          size="small" 
                          color={user.access === 'Habilitado' ? 'primary' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{format(new Date(user.createdAt), 'dd MMM yyyy', { locale: es })}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Editar Perfil">
                            <IconButton size="small" onClick={() => { setSelectedUser(user); setEditOpen(true); }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.access === 'Habilitado' ? 'Bloquear Acceso' : 'Desbloquear Acceso'}>
                            <IconButton size="small" color={user.access === 'Habilitado' ? 'error' : 'success'} onClick={() => handleBlockUnblock(user)}>
                              {user.access === 'Habilitado' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
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
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </CardContent>
      </Card>

      <UserEditDialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)} 
        user={selectedUser} 
        onSaved={fetchUsers} 
      />

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
