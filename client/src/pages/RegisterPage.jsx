import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, Checkbox, FormControlLabel,
  CircularProgress, Alert, InputAdornment, IconButton, Card, CardContent,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import api from '../lib/api'
import logo from '../assets/logo.png'

const PHONE_REGEX = /^\d{10}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN = 8
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    acceptedTerms: false,
    privacyAccepted: false,
  })

  const submittedRef = useRef(false)

  function validateField(name, value) {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'El nombre es obligatorio'
      case 'phone':
        if (!value) return 'El teléfono es obligatorio'
        if (!PHONE_REGEX.test(value)) return 'El teléfono debe tener 10 dígitos'
        return ''
      case 'email':
        if (!value) return 'El correo electrónico es obligatorio'
        if (!EMAIL_REGEX.test(value)) return 'Ingresa un correo electrónico válido'
        return ''
      case 'password':
        if (!value) return 'La contraseña es obligatoria'
        if (value.length < PASSWORD_MIN) return 'La contraseña debe tener al menos 8 caracteres'
        if (!SPECIAL_CHAR_REGEX.test(value)) return 'La contraseña debe contener al menos un carácter especial'
        return ''
      default:
        return ''
    }
  }

  function handleChange(e) {
    const { name, value, checked, type } = e.target
    const val = type === 'checkbox' ? checked : value
    setForm((prev) => ({ ...prev, [name]: val }))

    if (type !== 'checkbox') {
      const error = validateField(name, value)
      setFieldErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target
    const error = validateField(name, value)
    setFieldErrors((prev) => ({ ...prev, [name]: error }))
  }

  function isFormValid() {
    return (
      form.name.trim() &&
      PHONE_REGEX.test(form.phone) &&
      EMAIL_REGEX.test(form.email) &&
      form.password.length >= PASSWORD_MIN &&
      SPECIAL_CHAR_REGEX.test(form.password) &&
      form.acceptedTerms &&
      form.privacyAccepted
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submittedRef.current) return
    submittedRef.current = true
    setServerError('')

    const errors = {}
    Object.keys(form).forEach((key) => {
      if (typeof form[key] === 'string') {
        const err = validateField(key, form[key])
        if (err) errors[key] = err
      }
    })
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      submittedRef.current = false
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      navigate('/verify-otp', { state: { phone: form.phone, sessionToken: data.sessionToken } })
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Error al registrar. Intenta de nuevo.'
      const field = err.response?.data?.error?.field
      if (field) {
        setFieldErrors((prev) => ({ ...prev, [field]: msg }))
      } else {
        setServerError(msg)
      }
    } finally {
      submittedRef.current = false
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 2, maxWidth: 448, mx: 'auto', pt: { xs: 4, sm: 8 } }}>
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Box component="img" src={logo} alt="Punto Zero" sx={{ height: 64, objectFit: 'contain' }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        Únete a la comunidad de voluntarios (v1.1)
      </Typography>

      <Card elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)'
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Crear cuenta
          </Typography>

          {serverError && <Alert severity="error" sx={{ mb: 3 }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Nombre completo"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label="Teléfono"
              name="phone"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                if (val.length <= 10) {
                  handleChange({ target: { name: 'phone', value: val, type: 'text', checked: false } })
                }
              }}
              onBlur={handleBlur}
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone || '10 dígitos'}
              slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || 'Mínimo 8 caracteres y 1 especial'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2.5 }}
            />

            <FormControlLabel
              control={<Checkbox checked={form.acceptedTerms} onChange={handleChange} name="acceptedTerms" />}
              label={<Typography variant="body2">Acepto los Términos y Condiciones</Typography>}
              sx={{ mb: 0.5, alignItems: 'flex-start' }}
            />

            <FormControlLabel
              control={<Checkbox checked={form.privacyAccepted} onChange={handleChange} name="privacyAccepted" />}
              label={<Typography variant="body2">Acepto el Aviso de Privacidad</Typography>}
              sx={{ mb: 4, alignItems: 'flex-start' }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !isFormValid()}
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Crear cuenta'}
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        ¿Ya tienes cuenta?{' '}
        <Button onClick={() => navigate('/login')} sx={{ fontWeight: 600, textTransform: 'none' }}>
          Inicia sesión
        </Button>
      </Typography>
    </Box>
  )
}
