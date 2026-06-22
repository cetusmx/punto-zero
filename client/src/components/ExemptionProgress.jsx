import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Stack, alpha, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../lib/api';

export default function ExemptionProgress() {
  const theme = useTheme();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data } = await api.get('/agenda/progress');
        setProgress(data);
      } catch (err) {
        console.error('Error fetching progress', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 4, p: 2, bgcolor: 'error.50', borderRadius: '16px', color: 'error.main' }}>
        <Typography variant="body2">No se pudo cargar el progreso de exención. Intenta recargar la página.</Typography>
      </Box>
    );
  }

  if (!progress || !progress.isActive) return null;

  const displayAttendances = Math.min(6, progress.totalAttendances);
  const percentage = Math.min(100, (progress.totalAttendances / 6) * 100);
  const isComplete = progress.totalAttendances >= 6;

  return (
    <Card elevation={0} sx={{ 
      borderRadius: '24px', 
      border: '1px solid',
      borderColor: isComplete ? 'success.light' : 'divider',
      mb: 4,
      bgcolor: isComplete ? alpha(theme.palette.success.main, 0.05) : 'background.paper'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              Programa de Exención
              {isComplete && <CheckCircleIcon color="success" />}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: isComplete ? 'success.main' : 'primary.main' }}>
              {displayAttendances}/6
            </Typography>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              color={isComplete ? "success" : "primary"}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: isComplete ? alpha(theme.palette.success.main, 0.2) : 'grey.100'
              }} 
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Atenciones</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{displayAttendances}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Restantes</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{progress.remaining}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Faltas</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: progress.faltas >= 2 ? 'error.main' : 'text.primary' }}>
                {progress.faltas} {progress.faltas >= 2 && '(Riesgo de reinicio)'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Fecha Límite</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {progress.deadline ? (() => {
                  const [y, m, d] = progress.deadline.split('T')[0].split('-');
                  return format(new Date(y, m - 1, d), "d 'de' MMMM, yyyy", { locale: es });
                })() : 'N/A'}
              </Typography>
            </Box>
          </Box>
          
          {isComplete && (
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, mt: 1 }}>
              ¡Felicidades! Has completado tus atenciones. Tu código QR de exención está listo.
            </Typography>
          )}
          
          {progress.faltas === 2 && !isComplete && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'error.50', borderRadius: '12px' }}>
              <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                Llevas 2 faltas. Una más y tu conteo de atenciones se reiniciará.
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
