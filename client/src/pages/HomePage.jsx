import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Divider } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
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
  
  const showSchedules = config.tablon_show_schedules === 'true'
  const schedulesTitle = config.tablon_schedules_title || 'HORARIOS'
  const schedulesBody = config.tablon_schedules_body || 'Jardines Hda: 8 am - apertura / 12 pm - cierre\nCarretas: 9 am - apertura / 1:30 pm - cierre\nEl Refugio: 10 am - apertura / 2 pm - cierre'

  return (
    <Box sx={{ py: { xs: 2, sm: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          Bienvenido a Punto Zero
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
            {body.split('\n').map((line, idx) => {
              if (!line.trim()) return <Box key={idx} sx={{ height: 16 }} /> // Space for empty lines
              const isBullet = line.includes('Atender algún') || line.includes('Estas seis ocasiones') || line.includes('La exención de la aportación');
              return (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: isBullet ? 1.5 : 2 }}>
                  {isBullet && (
                    <Box component="span" sx={{ color: 'success.main', mr: 1.5, mt: '4px', display: 'flex' }}>
                      <CheckCircleIcon fontSize="small" />
                    </Box>
                  )}
                  <Typography variant="body1" sx={{ 
                    color: 'text.primary', 
                    lineHeight: 1.7,
                    fontSize: '1.05rem',
                    fontWeight: isBullet ? 500 : 400
                  }}>
                    {line}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          {showSchedules && (
            <Box sx={{ 
              mb: 4,
              p: 3, 
              bgcolor: 'primary.50',
              borderRadius: '16px',
              border: '1px dashed',
              borderColor: 'primary.200'
            }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 700, 
                color: 'primary.main', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AccessTimeIcon fontSize="small" />
                {schedulesTitle}
              </Typography>
              
              {schedulesBody.split('\n').map((line, idx) => {
                if (!line.trim()) return null;
                const [point, ...rest] = line.split(':')
                const schedule = rest.join(':')
                
                return (
                  <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', mb: 1, gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      • {point.trim()}:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {schedule.trim()}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          )}

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
