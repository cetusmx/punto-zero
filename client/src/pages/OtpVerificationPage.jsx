import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
} from '@mui/material'
import api from '../lib/api'

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

  if (loading && !digits.some((d) => d)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, maxWidth: 400, mx: 'auto', pt: 6, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
        Verifica tu teléfono
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Enviamos un código de 6 dígitos al
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, fontWeight: 600 }}>
        {phone}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
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
                style: { textAlign: 'center', fontSize: '1.5rem', width: 32, height: 40, padding: 0 },
                inputMode: 'numeric',
                pattern: '[0-9]*',
              },
            }}
            sx={{ width: 56 }}
          />
        ))}
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleVerify}
        disabled={loading || digits.some((d) => !d)}
        sx={{ borderRadius: 3, py: 1.5, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Verificar'}
      </Button>

      <Box sx={{ mt: 2 }}>
        {canResend ? (
          <Button onClick={handleResend} disabled={loading} size="small">
            Reenviar código
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Reenviar código en {cooldown} segundos
          </Typography>
        )}
      </Box>
    </Box>
  )
}
