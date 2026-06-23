import { useState, useRef } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, CircularProgress, Alert,
  InputAdornment, IconButton, Link, Card, CardContent,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import logo from '../assets/logo.png'

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
        navigate('/perfil', { replace: true })
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
    <Box sx={{ p: 2, maxWidth: 448, mx: 'auto', pt: { xs: 4, sm: 8 } }}>
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Box component="img" src={logo} alt="Punto Zero" sx={{ height: 64, objectFit: 'contain' }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        Bienvenido de nuevo (v1.1)
      </Typography>

      <Card elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)'
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Iniciar sesión
          </Typography>

          {serverError && <Alert severity="error" sx={{ mb: 3 }}>{serverError}</Alert>}

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

            <Box sx={{ textAlign: 'right', mb: 4 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                color="text.secondary"
                underline="hover"
                sx={{ fontWeight: 500 }}
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
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        ¿No tienes cuenta?{' '}
        <Link component={RouterLink} to="/register" underline="hover" color="primary.main" sx={{ fontWeight: 600 }}>
          Regístrate
        </Link>
      </Typography>
    </Box>
  )
}
