import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, TextField, Button, Snackbar, Alert, CircularProgress } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { getConfig, updateConfig } from '../../services/admin.js'

export default function AdminConfig() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [form, setForm] = useState({ whatsapp_avisos_url: '', whatsapp_abierto_url: '' })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  async function fetchConfig() {
    try {
      const { data } = await getConfig()
      setForm({
        whatsapp_avisos_url: data.data.whatsapp_avisos_url || '',
        whatsapp_abierto_url: data.data.whatsapp_abierto_url || ''
      })
    } catch (err) {
      console.error('Error fetching config', err)
      setSnackbar({ open: true, message: 'Error al cargar la configuración', severity: 'error' })
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    fetchConfig()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const isValidUrlOrEmpty = (url) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  const avisosError = !isValidUrlOrEmpty(form.whatsapp_avisos_url) ? "Debe ser una URL válida (http/https)" : "";
  const abiertoError = !isValidUrlOrEmpty(form.whatsapp_abierto_url) ? "Debe ser una URL válida (http/https)" : "";
  const isFormValid = !avisosError && !abiertoError;

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await updateConfig(form)
      setSnackbar({ open: true, message: 'Configuración guardada exitosamente', severity: 'success' })
    } catch (err) {
      console.error('Error updating config', err)
      setSnackbar({ open: true, message: 'Error al guardar la configuración', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
        Configuración
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Gestiona los enlaces globales de WhatsApp para la comunidad.
      </Typography>

      <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="URL del Grupo de Avisos"
              name="whatsapp_avisos_url"
              value={form.whatsapp_avisos_url}
              onChange={handleChange}
              placeholder="https://chat.whatsapp.com/..."
              error={!!avisosError}
              helperText={avisosError}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="URL del Grupo Abierto"
              name="whatsapp_abierto_url"
              value={form.whatsapp_abierto_url}
              onChange={handleChange}
              placeholder="https://chat.whatsapp.com/..."
              error={!!abiertoError}
              helperText={abiertoError}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !isFormValid}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600 }}
            >
              Guardar Configuración
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', bgcolor: snackbar.severity === 'success' ? '#789b3d' : undefined, color: snackbar.severity === 'success' ? '#fff' : undefined }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
