import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material'
import api from '../lib/api'

export default function HomePage() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data } = await api.get('/config')
        setConfig(data.data)
      } catch (err) {
        console.error('Error fetching config', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !config) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ borderRadius: '16px' }}>
          No se pudo cargar la información de inicio.
        </Alert>
      </Box>
    )
  }

  // Fallbacks if not configured yet
  const title = config.tablon_title || 'PUNTOS DE ACOPIO'
  const subtitle = config.tablon_subtitle || 'TÉRMINOS DE VOLUNTARIADO'
  const body = config.tablon_body || 'Puedes apoyar las ocasiones que gustes, pero si deseas exentar la aportación de $40 por cubeta intercambiada, durante 1 año, estas son las condiciones...\n\nAtender algún punto de acopio al menos por seis ocasiones al año.\n\nEstas seis ocasiones deberán ser dentro de un periodo de seis meses. Si no se cumple la condición, se resetea el conteo de apoyos.\n\nLa exención de la aportación económica inicia después de cubrir las seis ocasiones de apoyo.'
  const footer = config.tablon_footer || 'PUNTO ZERO\nJUNTOS POR EL PLANETA'

  return (
    <Box sx={{ py: { xs: 2, sm: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          Inicio
        </Typography>
        <Typography color="text.secondary">
          Bienvenido a punto-zero
        </Typography>
      </Box>

      <Card elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        background: 'linear-gradient(to bottom right, #ffffff, #fafafa)',
        overflow: 'hidden'
      }}>
        {/* Banner/Header line */}
        <Box sx={{ height: '8px', width: '100%', bgcolor: 'primary.main' }} />
        
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 800, 
            color: 'primary.dark', 
            mb: 1, 
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}>
            {title}
          </Typography>
          
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            color: 'secondary.main', 
            mb: 4, 
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {subtitle}
          </Typography>

          <Box sx={{ 
            bgcolor: 'white', 
            p: 3, 
            borderRadius: '16px', 
            border: '1px solid', 
            borderColor: 'grey.100',
            mb: 4
          }}>
            <Typography variant="body1" sx={{ 
              color: 'text.primary', 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              fontSize: '1.05rem'
            }}>
              {body}
            </Typography>
          </Box>

          <Box sx={{ 
            borderTop: '1px solid', 
            borderColor: 'divider', 
            pt: 3,
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              whiteSpace: 'pre-wrap',
              letterSpacing: '1px'
            }}>
              {footer}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
