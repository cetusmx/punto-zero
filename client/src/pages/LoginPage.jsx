import { useState, useRef } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, CircularProgress, Alert,
  InputAdornment, IconButton, Link,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState({
    identifier: '',
    password: '',
  })

  const submittedRef = useRef(false)

  function validateField(name, value) {
    switch (name) {
      case 'identifier':
        return value.trim() ? '' : 'El identificador es obligatorio'
      case 'password':
        return value ? '' : 'La contraseña es obligatoria'
      default:
        return ''
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    const error = validateField(name, value)
    setFieldErrors((prev) => ({ ...prev, [name]: error }))
  }

  function handleBlur(e) {
    const { name, value } = e.target
    const error = validateField(name, value)
    setFieldErrors((prev) => ({ ...prev, [name]: error }))
  }

  function isFormValid() {
    return form.identifier.trim() && form.password
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submittedRef.current) return
    submittedRef.current = true
    setServerError('')

    const errors = {}
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key])
      if (err) errors[key] = err
    })
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      submittedRef.current = false
      return
    }

    setLoading(true)
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      if (data.isFirstLogin) {
        navigate('/profile', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Error al iniciar sesión. Intenta de nuevo.'
      const status = err.response?.status
      if (status === 403) {
        setServerError('Cuenta desactivada. Contacta al administrador.')
      } else {
        setServerError(msg)
      }
    } finally {
      submittedRef.current = false
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 2, maxWidth: 400, mx: 'auto', pt: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
        Iniciar sesión
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ingresa con tu teléfono o correo electrónico
      </Typography>

      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label="Teléfono o correo electrónico"
          name="identifier"
          value={form.identifier}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!fieldErrors.identifier}
          helperText={fieldErrors.identifier}
          sx={{ mb: 2 }}
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
          helperText={fieldErrors.password}
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
          sx={{ mb: 1 }}
        />

        <Box sx={{ textAlign: 'right', mb: 3 }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            color="text.secondary"
            underline="hover"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading || !isFormValid()}
          sx={{ borderRadius: 3, py: 1.5, mb: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión'}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          ¿No tienes cuenta?{' '}
          <Link component={RouterLink} to="/register" underline="hover" color="primary.main">
            Regístrate
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
