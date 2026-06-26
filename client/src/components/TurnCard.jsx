import { Card, CardContent, Grid, Box, Typography, Chip, Stack, Button } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CancelIcon from '@mui/icons-material/Cancel'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_COLORS = {
  Pendiente: { color: 'warning', label: 'Pendiente' },
  Asistio: { color: 'success', label: 'Asistió' },
  Falta: { color: 'error', label: 'Falta' },
  Cancelado: { color: 'default', label: 'Cancelado' },
}

export default function TurnCard({ turn, isUpcoming, onCancel }) {
  const statusInfo = STATUS_COLORS[turn.status] || { color: 'default', label: turn.status }
  
  return (
    <Card elevation={0} sx={{ 
      borderRadius: '24px', 
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
      mb: 2
    }}>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {format(parseISO(turn.saturdayDate), "EEEE d 'de' MMMM", { locale: es })}
              </Typography>
              <Chip 
                label={statusInfo.label} 
                color={statusInfo.color} 
                size="small" 
                sx={{ fontWeight: 600, borderRadius: '8px' }} 
              />
            </Box>
            
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{turn.point.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{turn.point.address}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{turn.point.horario}</Typography>
              </Box>
            </Stack>
          </Grid>
          {isUpcoming && onCancel && (
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <Button 
                size="small" 
                color="error" 
                startIcon={<CancelIcon />}
                onClick={() => onCancel(turn)}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                Cancelar turno
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}
