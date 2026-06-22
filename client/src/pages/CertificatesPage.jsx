import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, alpha, useTheme, Button } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { QRCodeSVG } from 'qrcode.react'
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

function CertificateCard({ cert, isActive, userName, theme }) {
  const handleContextMenu = (e) => {
    e.preventDefault()
  }

  const qrData = JSON.stringify({
    certId: cert.id,
    userId: cert.userId,
    type: cert.type,
    expiresAt: cert.expiresAt,
  })

  const safeFormatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const parsed = parseISO(dateString)
    return isValid(parsed) ? format(parsed, "d 'de' MMMM, yyyy", { locale: es }) : 'Fecha inválida'
  }

  return (
    <Card elevation={0} sx={{ 
      borderRadius: '24px', 
      border: '1px solid',
      borderColor: isActive ? 'success.light' : 'divider',
      bgcolor: isActive ? alpha(theme.palette.success.main, 0.03) : 'background.paper',
      mb: 3,
      overflow: 'hidden'
    }}>
      <Box sx={{ p: 2, bgcolor: isActive ? 'success.main' : 'grey.400', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <EmojiEventsIcon />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {cert.type === 'Exencion' ? 'Certificado de Exención' : 'Certificado de Reconocimiento'}
        </Typography>
      </Box>
      <CardContent sx={{ p: 4, opacity: isActive ? 1 : 0.6, filter: isActive ? 'none' : 'grayscale(100%)' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box 
              onContextMenu={handleContextMenu}
              sx={{ 
                p: 2, 
                bgcolor: 'white', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'inline-block'
              }}
            >
              <QRCodeSVG 
                value={qrData} 
                size={200} 
                level="M" 
                includeMargin={false} 
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            {isActive && (
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 2 }}>
                ¡Felicidades! Tu certificado está activo.
              </Typography>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">Otorgado a</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{userName}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">Tipo de Certificado</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{cert.type}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">Fecha de Emisión</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {safeFormatDate(cert.issuedAt)}
              </Typography>
            </Box>

            {cert.expiresAt && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Válido hasta</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: isActive ? 'text.primary' : 'error.main' }}>
                  {safeFormatDate(cert.expiresAt)}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default function CertificatesPage() {
  const theme = useTheme()
  const { user } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claimLoading, setClaimLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = useCallback(async (signal) => {
    try {
      const [certRes, progRes] = await Promise.all([
        api.get('/volunteer/certificates', { signal }),
        api.get('/agenda/progress', { signal })
      ])
      
      setCertificates(Array.isArray(certRes.data) ? certRes.data : [])
      setProgress(progRes.data)
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        setError(err.response?.data?.error?.message || 'Error al cargar tus certificados o progreso.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClaim = async () => {
    setClaimLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/volunteer/certificates/claim-exencion')
      setSuccess('¡Certificado generado con éxito!')
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al generar el certificado.')
    } finally {
      setClaimLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const activeCertificates = certificates.filter(c => c.isActive)
  const pastCertificates = certificates.filter(c => !c.isActive)
  const hasActiveExencion = activeCertificates.some(c => c.type === 'Exencion')
  
  // Single source of truth from backend
  const isEligible = progress?.isEligible

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Voluntario'

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
        Mis Certificados
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Aquí encontrarás tus códigos QR generados por asistencia constante.
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '16px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>{error}</Alert>}

      {!hasActiveExencion && isEligible && (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            disabled={claimLoading}
            onClick={handleClaim}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, px: 4 }}
          >
            {claimLoading ? <CircularProgress size={24} color="inherit" /> : 'Generar Certificado de Exención'}
          </Button>
        </Box>
      )}

      {certificates.length === 0 ? (
        <Box sx={{ 
          p: 6, textAlign: 'center', borderRadius: '24px', 
          bgcolor: alpha('#000', 0.02), border: '2px dashed', borderColor: 'divider' 
        }}>
          <EmojiEventsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aún no tienes certificados. Completa tus atenciones para obtener tu Exención.
          </Typography>
        </Box>
      ) : (
        <>
          {activeCertificates.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Certificados Activos</Typography>
              {activeCertificates.map(cert => (
                <CertificateCard key={cert.id} cert={cert} isActive={true} userName={userName} theme={theme} />
              ))}
            </Box>
          )}

          {pastCertificates.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.secondary' }}>Historial de Certificados</Typography>
              {pastCertificates.map(cert => (
                <CertificateCard key={cert.id} cert={cert} isActive={false} userName={userName} theme={theme} />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
