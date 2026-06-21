import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from '@mui/material'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading = false, confirmText = 'Aceptar', cancelText = 'Cancelar', confirmColor = 'primary' }) {
  const handleClose = () => {
    if (!loading && onCancel) onCancel()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading} sx={{ textTransform: 'none' }}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={loading} sx={{ borderRadius: '8px', textTransform: 'none', minWidth: '100px' }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
