import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Autocomplete, TextField, CircularProgress, Tooltip, Alert, Chip 
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../../context/AuthContext';
import { getAdministrators, getEligibleUsersForAdmin, promoteToAdmin, demoteToVolunteer, toggleAdminBlock } from '../../services/admin';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminAdministrators() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Promotion Modal State
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalError, setModalError] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ open: false });

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAdministrators();
      setAdmins(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al cargar administradores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    // eslint-disable-next-line
    fetchAdmins(); 
  }, [fetchAdmins]);

  // AC: Debounced search for Autocomplete
  useEffect(() => {
    let active = true;

    // Always fetch, even if query is empty to show a default list

    const delayDebounce = setTimeout(async () => {
      setOptionsLoading(true);
      try {
        const { data } = await getEligibleUsersForAdmin(searchQuery);
        if (active) {
          setOptions(data);
        }
      } catch (err) {
        console.error('Error fetching eligible users', err);
      } finally {
        if (active) {
          setOptionsLoading(false);
        }
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [searchQuery]);

  const handleOpenPromoteModal = async () => {
    setSearchQuery('');
    setOptions([]);
    setSelectedUser(null);
    setModalError('');
    setOpenModal(true);

    setOptionsLoading(true);
    try {
      const { data } = await getEligibleUsersForAdmin('');
      setOptions(data);
    } catch (err) {
      console.error('Error fetching eligible users on open', err);
    } finally {
      setOptionsLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedUser) return;
    setIsPromoting(true);
    setModalError('');
    try {
      await promoteToAdmin(selectedUser.id);
      setOpenModal(false);
      fetchAdmins();
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Error al promover usuario.');
    } finally {
      setIsPromoting(false);
    }
  };

  const confirmDemote = (admin) => {
    setConfirmDialog({
      open: true,
      title: 'Degradar Administrador',
      message: `¿Estás seguro de que deseas degradar a ${admin.name} a voluntario? Perderá acceso a este panel de administración.`,
      confirmColor: 'error',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          await demoteToVolunteer(admin.id);
          fetchAdmins();
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (err) {
          setError(err.response?.data?.error?.message || 'Error al degradar administrador.');
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const confirmToggleBlock = (admin) => {
    const isBlocking = admin.access !== 'Bloqueado';
    setConfirmDialog({
      open: true,
      title: isBlocking ? 'Bloquear Administrador' : 'Desbloquear Administrador',
      message: isBlocking 
        ? `¿Seguro que deseas revocar el acceso a la plataforma de ${admin.name}?` 
        : `¿Seguro que deseas restablecer el acceso a la plataforma de ${admin.name}?`,
      confirmColor: isBlocking ? 'error' : 'success',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          await toggleAdminBlock(admin.id, isBlocking ? 'block' : 'unblock');
          fetchAdmins();
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (err) {
          setError(err.response?.data?.error?.message || 'Error al modificar el acceso.');
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Administradores</Typography>
          <Typography color="text.secondary">Control de acceso y roles administrativos</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />} 
          onClick={handleOpenPromoteModal}
          sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}
        >
          Promover Usuario
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
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
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.disabled">No hay administradores registrados.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{admin.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{admin.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{admin.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={admin.role} 
                      color={admin.role === 'superadmin' ? 'secondary' : 'primary'} 
                      size="small" 
                      sx={{ fontWeight: 600, borderRadius: '8px' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={admin.access} 
                      color={admin.access === 'Habilitado' ? 'success' : 'error'} 
                      size="small" 
                      sx={{ fontWeight: 600, borderRadius: '8px' }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Degradar a Voluntario">
                      <span>
                        <IconButton 
                          disabled={admin.id === user.id} 
                          onClick={() => confirmDemote(admin)}
                          color="warning"
                        >
                          <ArrowDownwardIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={admin.access === 'Bloqueado' ? 'Restaurar Acceso' : 'Bloquear Acceso'}>
                      <span>
                        <IconButton 
                          disabled={admin.id === user.id} 
                          onClick={() => confirmToggleBlock(admin)}
                          color={admin.access === 'Bloqueado' ? 'success' : 'error'}
                        >
                          {admin.access === 'Bloqueado' ? <CheckCircleIcon /> : <BlockIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Promotion Modal */}
      <Dialog 
        open={openModal} 
        onClose={isPromoting ? undefined : () => setOpenModal(false)}
        fullWidth 
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Promover a Administrador</DialogTitle>
        <DialogContent sx={{ minHeight: '120px' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Busca y selecciona a un voluntario existente para otorgarle permisos administrativos.
          </Typography>
          
          {modalError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{modalError}</Alert>}
          
          <Autocomplete 
            options={options} 
            getOptionLabel={(opt) => `${opt.name} (${opt.email})`}
            onInputChange={(e, val) => setSearchQuery(val)}
            onChange={(e, val) => setSelectedUser(val)}
            loading={optionsLoading}
            filterOptions={(x) => x} // Disable built-in filtering, trust server response
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            noOptionsText={searchQuery ? "No se encontraron voluntarios" : "Escribe para buscar..."}
            ListboxProps={{ style: { maxHeight: 240 } }} // ~5 items
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Buscar voluntario..." 
                variant="outlined"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {optionsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps?.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit" disabled={isPromoting} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button onClick={handlePromote} variant="contained" disabled={!selectedUser || isPromoting} sx={{ borderRadius: '8px', textTransform: 'none', minWidth: '100px' }}>
            {isPromoting ? <CircularProgress size={24} color="inherit" /> : 'Promover'}
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
  );
}
