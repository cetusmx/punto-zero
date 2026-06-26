import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, IconButton, CircularProgress, Alert, alpha } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { isAfter, startOfDay, parseISO } from 'date-fns'
import api from '../lib/api'
import TurnCard from '../components/TurnCard'

export default function MyHistoryPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [historyTurns, setHistoryTurns] = useState([])

  useEffect(() => {
    fetchMyTurns()
  }, [])

  async function fetchMyTurns() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/agenda/my-turns')
      
      const today = startOfDay(new Date())
      const upcoming = data.filter(t => 
        (isAfter(parseISO(t.saturdayDate), today) || t.saturdayDate === today.toISOString()) && 
        t.status === 'Pendiente'
      )
      
      const history = data.filter(t => !upcoming.find(ut => ut.id === t.id))
      setHistoryTurns(history)
    } catch {
      setError('Error al cargar tu historial. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Historial Completo
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>{error}</Alert>}

      {historyTurns.length === 0 && !error ? (
        <Box sx={{ 
          p: 4, textAlign: 'center', borderRadius: '24px', 
          bgcolor: alpha('#000', 0.02), border: '2px dashed', borderColor: 'divider' 
        }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron registros de historial.
          </Typography>
        </Box>
      ) : (
        <Box>
          {historyTurns.map(turn => (
            <TurnCard key={turn.id} turn={turn} isUpcoming={false} />
          ))}
        </Box>
      )}
    </Box>
  )
}
