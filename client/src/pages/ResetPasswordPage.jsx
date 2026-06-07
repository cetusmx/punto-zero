import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, CircularProgress, Alert, Card, CardContent, InputAdornment, IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import api from '../lib/api'

const CODE_LENGTH = 6

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const phoneFromState = location.state?.phone

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''))
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const inputRefs = useRef([])

  useEffect(() => {
    if (!phoneFromState) {
      navigate('/forgot-password', { replace: true })
    }
  }, [phoneFromState, navigate])

  const handleChangeCode = useCallback((index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }, [])

  const handleKeyDownCode = useCallback((index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }, [digits])

  const handlePasteCode = useCallback((e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (pasted.length === CODE_LENGTH) {
      setDigits(pasted.split(''))
      inputRefs.current[CODE_LENGTH - 1]?.focus()
    }
  }, [])

  function validate() {
    const errors = {}
    if (digits.some(d => !d)) errors.code = 'Ingresa el código completo'
    if (!password) errors.password = 'La contraseña es obligatoria'
    else if (password.length < 8) errors.password = 'Mínimo 8 caracteres'
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.password = 'Mínimo un carácter especial'
    
    if (password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden'
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/reset-password', {
        phone: phoneFromState,
        code: digits.join(''),
        password
      })
      setMessage(data.message)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al restablecer la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  if (!phoneFromState) return null

  return (
    <Box sx={{ p: 2, maxWidth: 448, mx: 'auto', pt: { xs: 4, sm: 8 } }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
        punto-zero
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        Restablecer contraseña (v1.1)
      </Typography>

      <Card elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)'
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Ingresa tu código
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enviamos un código a tu teléfono <strong>{phoneFromState}</strong>
          </Typography>

          {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 4 }}>
              {digits.map((digit, index) => (
                <TextField
                  key={index}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleChangeCode(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDownCode(index, e)}
                  onPaste={handlePasteCode}
                  slotProps={{
                    htmlInput: {
                      maxLength: 1,
                      style: { textAlign: 'center', fontSize: '1.25rem', padding: '10px 0' },
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    },
                  }}
                  sx={{ 
                    width: { xs: 42, sm: 50 },
                    '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                  }}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              label="Nueva contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label="Confirmar contraseña"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Actualizar contraseña'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
