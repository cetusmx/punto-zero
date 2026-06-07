import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, CircularProgress, Alert, Card, CardContent,
} from '@mui/material'
import api from '../lib/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')
  const [fieldError, setFieldError] = useState('')

  function validatePhone(val) {
    if (!val) return 'El teléfono es obligatorio'
    if (!/^\d{10}$/.test(val)) return 'El teléfono debe tener 10 dígitos'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    
    const err = validatePhone(phone)
    if (err) {
      setFieldError(err)
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { phone })
      setMessage(data.message)
      // Small delay then redirect to reset-password
      setTimeout(() => {
        navigate('/reset-password', { state: { phone } })
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al procesar la solicitud. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 2, maxWidth: 448, mx: 'auto', pt: { xs: 4, sm: 8 } }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
        punto-zero
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        Recuperación de contraseña (v1.1)
      </Typography>

      <Card elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)'
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            ¿Olvidaste tu contraseña?
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tu número de teléfono y te enviaremos un código para restablecer tu contraseña.
          </Typography>

          {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Teléfono"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                if (val.length <= 10) {
                  setPhone(val)
                  setFieldError('')
                }
              }}
              error={!!fieldError}
              helperText={fieldError || '10 dígitos'}
              slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !!message}
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar código'}
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        <Button onClick={() => navigate('/login')} sx={{ fontWeight: 600, textTransform: 'none' }}>
          Volver al inicio de sesión
        </Button>
      </Typography>
    </Box>
  )
}
