import { useState, useEffect } from 'react'
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert } from '@mui/material'
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../../lib/api'

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const { data } = await api.get('/admin/certificates')
        setCertificates(data)
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Error al cargar certificados.')
      } finally {
        setLoading(false)
      }
    }
    fetchCertificates()
  }, [])

  const safeFormatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const parsed = parseISO(dateString)
    return isValid(parsed) ? format(parsed, "dd/MMM/yyyy", { locale: es }) : 'N/A'
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Certificados Emitidos</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Listado histórico de todos los certificados de exención y reconocimiento generados.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Voluntario</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Asistencias</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Emisión</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vencimiento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No hay certificados emitidos todavía.
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((cert) => (
                  <TableRow key={cert.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{cert.user?.name || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">{cert.user?.phone || ''}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={cert.type} 
                        size="small" 
                        color={cert.type === 'Reconocimiento' ? 'warning' : 'primary'} 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>{cert.attendancesAtIssuance}</TableCell>
                    <TableCell>{safeFormatDate(cert.issuedAt)}</TableCell>
                    <TableCell>{safeFormatDate(cert.expiresAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={cert.isActive ? 'Vigente' : 'Expirado'} 
                        size="small" 
                        color={cert.isActive ? 'success' : 'default'} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
