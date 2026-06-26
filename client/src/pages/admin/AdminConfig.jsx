import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, TextField, Button, Snackbar, Alert, CircularProgress, Divider, FormControlLabel, Checkbox } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { getConfig, updateConfig } from '../../services/admin.js'

export default function AdminConfig() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [form, setForm] = useState({ 
    whatsapp_avisos_url: '', 
    whatsapp_abierto_url: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    admin_phone: '',
    tablon_title: '',
    tablon_subtitle: '',
    tablon_body: '',
    tablon_footer: '',
    tablon_show_schedules: false,
    tablon_schedules_title: '',
    tablon_schedules_body: ''
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  async function fetchConfig() {
    try {
      const { data } = await getConfig()
      setForm({
        whatsapp_avisos_url: data.data.whatsapp_avisos_url || '',
        whatsapp_abierto_url: data.data.whatsapp_abierto_url || '',
        twilio_account_sid: data.data.twilio_account_sid || '',
        twilio_auth_token: data.data.twilio_auth_token || '',
        twilio_phone_number: data.data.twilio_phone_number || '',
        admin_phone: data.data.admin_phone || '',
        tablon_title: data.data.tablon_title || '',
        tablon_subtitle: data.data.tablon_subtitle || '',
        tablon_body: data.data.tablon_body || '',
        tablon_footer: data.data.tablon_footer || '',
        tablon_show_schedules: data.data.tablon_show_schedules === 'true',
        tablon_schedules_title: data.data.tablon_schedules_title || '',
        tablon_schedules_body: data.data.tablon_schedules_body || ''
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
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
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
      // transform boolean to string before sending
      const payload = { ...form, tablon_show_schedules: String(form.tablon_show_schedules) }
      await updateConfig(payload)
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
        Gestiona los enlaces y variables del sistema.
      </Typography>

      <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Grupos de WhatsApp</Typography>
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

            <Divider sx={{ mb: 4 }} />

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Tablón de Avisos (Inicio)</Typography>
            <TextField
              fullWidth
              label="Título"
              name="tablon_title"
              value={form.tablon_title}
              onChange={handleChange}
              placeholder="PUNTOS DE ACOPIO"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Subtítulo"
              name="tablon_subtitle"
              value={form.tablon_subtitle}
              onChange={handleChange}
              placeholder="TÉRMINOS DE VOLUNTARIADO"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Cuerpo del mensaje"
              name="tablon_body"
              value={form.tablon_body}
              onChange={handleChange}
              placeholder="Escribe el cuerpo del mensaje..."
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Footer"
              name="tablon_footer"
              value={form.tablon_footer}
              onChange={handleChange}
              placeholder="PUNTO ZERO - JUNTOS POR EL PLANETA"
              sx={{ mb: 4 }}
            />

            <Divider sx={{ mb: 4 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Horarios (Opcional)</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.tablon_show_schedules}
                    onChange={handleChange}
                    name="tablon_show_schedules"
                    color="primary"
                  />
                }
                label="Mostrar sección de horarios en el tablón"
                sx={{ mb: 3 }}
              />
              
              {form.tablon_show_schedules && (
                <>
                  <TextField
                    fullWidth
                    label="Título de horarios"
                    name="tablon_schedules_title"
                    value={form.tablon_schedules_title}
                    onChange={handleChange}
                    placeholder="HORARIOS"
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Lista de horarios (uno por línea)"
                    name="tablon_schedules_body"
                    value={form.tablon_schedules_body}
                    onChange={handleChange}
                    placeholder="Jardines Hda: 8 am - apertura / 12 pm - cierre&#10;Carretas: 9 am - apertura / 1:30 pm - cierre"
                  />
                </>
              )}
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>SMS y Twilio</Typography>
            <TextField
              fullWidth
              label="Account SID"
              name="twilio_account_sid"
              value={form.twilio_account_sid}
              onChange={handleChange}
              placeholder="AC..."
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Auth Token"
              name="twilio_auth_token"
              type="password"
              value={form.twilio_auth_token}
              onChange={handleChange}
              placeholder="••••••••••••••••"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Teléfono Twilio"
              name="twilio_phone_number"
              value={form.twilio_phone_number}
              onChange={handleChange}
              placeholder="+1234567890"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Teléfono Admin (Notificaciones)"
              name="admin_phone"
              value={form.admin_phone}
              onChange={handleChange}
              placeholder="+521234567890"
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
