import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Paper } from '@mui/material'
import { getMetrics } from '../../../services/admin.js'

function MetricCard({ title, value, subtitle }) {
  return (
    <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', my: 'auto' }}>
          {value !== undefined && value !== null ? value : 0}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const { data } = await getMetrics()
        setMetrics(data.data)
      } catch (err) {
        console.error('Error fetching metrics', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!metrics) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Error al cargar las métricas</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Métricas generales del programa.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <MetricCard title="Total Usuarios" value={metrics.totalUsers} />
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <MetricCard title="Estatus: Alta" value={metrics.usersByStatus?.Alta || 0} />
            </Grid>
            <Grid item xs={4}>
              <MetricCard title="Estatus: Pausa" value={metrics.usersByStatus?.Pausa || 0} />
            </Grid>
            <Grid item xs={4}>
              <MetricCard title="Estatus: Baja" value={metrics.usersByStatus?.Baja || 0} />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <MetricCard title="Acceso Habilitado" value={metrics.usersByAccess?.Habilitado || 0} />
        </Grid>

        <Grid item xs={12} md={4}>
          <MetricCard title="Acceso Bloqueado" value={metrics.usersByAccess?.Bloqueado || 0} />
        </Grid>

        <Grid item xs={12} md={4}>
          <MetricCard title="Códigos de Reconocimiento" value={metrics.recognitionQrsGenerated || 0} subtitle="Generados" />
        </Grid>

        <Grid item xs={12} md={6}>
          <MetricCard title="QRs de Exención Activos" value={metrics.activeExemptionQrs || 0} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Ocupación Anual por Punto de Acopio</Typography>
            {(!metrics.assignedDatesPerPoint || metrics.assignedDatesPerPoint.length === 0) ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>0</Typography>
            ) : (
              <Grid container spacing={2}>
                {metrics.assignedDatesPerPoint.map(point => (
                  <Grid item xs={12} sm={6} md={3} key={point.pointId}>
                    <MetricCard title={point.name} value={`${point.percentage}%`} subtitle="Sábados asignados este año" />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
