import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Alert, CircularProgress, Card, CardContent,
} from '@mui/material'
import api from '../lib/api'
import logo from '../assets/logo.png'

const CODE_LENGTH = 6
const RESEND_COOLDOWN = 60
const MAX_ATTEMPTS = 3

export default function OtpVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone
  const sessionToken = location.state?.sessionToken

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const canResend = cooldown <= 0

  const inputRefs = useRef([])

  useEffect(() => {
    if (!phone || !sessionToken) {
      navigate('/register', { replace: true })
    }
  }, [phone, sessionToken, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleChange = useCallback((index, value) => {
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

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }, [digits])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (pasted.length === CODE_LENGTH) {
      const newDigits = pasted.split('')
      setDigits(newDigits)
      inputRefs.current[CODE_LENGTH - 1]?.focus()
    }
  }, [])

  async function handleVerify() {
    const code = digits.join('')
    if (code.length !== CODE_LENGTH) {
      setError('Ingresa el código completo de 6 dígitos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/verify-otp', {
        phone, code, sessionToken,
      })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/perfil', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Error al verificar el código'
      setError(msg)
      setAttempts((prev) => prev + 1)
      setDigits(Array(CODE_LENGTH).fill(''))
      inputRefs.current[0]?.focus()

      if (attempts + 1 >= MAX_ATTEMPTS) {
        setError('Demasiados intentos fallidos. Solicita un nuevo código.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/resend-otp', { phone })
      setCooldown(RESEND_COOLDOWN)
      setAttempts(0)
      setDigits(Array(CODE_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al reenviar el código')
    } finally {
      setLoading(false)
    }
  }

  if (!phone || !sessionToken) return null

  return (
    <Box sx={{ p: 2, maxWidth: 448, mx: 'auto', pt: { xs: 4, sm: 8 } }}>
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Box component="img" src={logo} alt="Punto Zero" sx={{ height: 64, objectFit: 'contain' }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        Verificación de identidad (v1.1)
      </Typography>

      <Card elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)'
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Verifica tu teléfono
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Enviamos un código de 6 dígitos al
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontWeight: 600 }}>
            {phone}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 4 }}>
            {digits.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                slotProps={{
                  htmlInput: {
                    maxLength: 1,
                    style: { textAlign: 'center', fontSize: '1.25rem', padding: '12px 0' },
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  },
                }}
                sx={{ 
                  width: { xs: 44, sm: 56 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleVerify}
            disabled={loading || digits.some((d) => !d)}
            sx={{ borderRadius: '12px', py: 1.5, fontWeight: 600, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verificar'}
          </Button>

          <Box sx={{ mt: 2 }}>
            {canResend ? (
              <Button onClick={handleResend} disabled={loading} sx={{ fontWeight: 600, textTransform: 'none' }}>
                Reenviar código
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Reenviar código en <strong>{cooldown}s</strong>
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        ¿Te equivocaste de número?{' '}
        <Button onClick={() => navigate('/register')} sx={{ fontWeight: 600, textTransform: 'none' }}>
          Regresa
        </Button>
      </Typography>
    </Box>
  )
}
