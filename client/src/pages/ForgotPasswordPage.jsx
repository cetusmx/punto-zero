import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Stepper, Step, StepLabel } from '@mui/material'
import api from '../lib/api'

const steps = ['Verificar teléfono', 'Nueva contraseña']

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const requestOtp = async () => {
    if (!phone) { setError('Ingresa tu teléfono'); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { phone })
      setStep(1)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Mínimo 8 caracteres y 1 especial')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { phone, code, password })
      navigate('/login', { state: { reset: true } })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Recuperar Contraseña</Typography>
          <Stepper activeStep={step} sx={{ mb: 3 }}>
            {steps.map((l) => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
          </Stepper>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {step === 0 && (
            <Box>
              <TextField fullWidth label="Teléfono" margin="normal" required
                value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="5512345678"
              />
              <Button fullWidth variant="contained" onClick={requestOtp} disabled={loading} sx={{ mt: 2 }}>
                {loading ? 'Enviando...' : 'Enviar código'}
              </Button>
            </Box>
          )}

          {step === 1 && (
            <Box component="form" onSubmit={resetPassword}>
              <TextField fullWidth label="Código SMS" margin="normal" required
                value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000"
              />
              <TextField fullWidth label="Nueva contraseña" type="password" margin="normal" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                helperText="Mínimo 8 caracteres y 1 especial"
              />
              <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
                {loading ? 'Guardando...' : 'Cambiar contraseña'}
              </Button>
            </Box>
          )}

          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              <Link to="/login">Volver al inicio de sesión</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
