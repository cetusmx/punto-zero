import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, CircularProgress, IconButton, Badge, Divider, Button } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, loading, fetchNotifications, markAllAsRead } = useNotifications()

  useEffect(() => {
    fetchNotifications()
    // eslint-disable-next-line
  }, [])

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', flexGrow: 1 }}>
          Mis Notificaciones
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          color="primary"
          onClick={markAllAsRead}
          disabled={loading || notifications.length === 0}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          Marcar todo como leído
        </Button>
      </Box>

      <Card elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No tienes notificaciones
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notif, index) => (
              <Box key={notif.id}>
                <ListItem 
                  sx={{ 
                    bgcolor: notif.read ? 'transparent' : 'primary.50',
                    px: { xs: 2, sm: 3 },
                    py: 2.5
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                    <Badge color="error" variant="dot" invisible={notif.read} sx={{ mr: 2, mt: 1 }}>
                      <NotificationsIcon color={notif.read ? "disabled" : "primary"} />
                    </Badge>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notif.read ? 600 : 700 }}>
                          {notif.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: notif.link ? 1 : 0 }}>
                        {notif.message}
                      </Typography>
                      {notif.link && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          sx={{ mt: 1, textTransform: 'none', borderRadius: '12px' }}
                          onClick={() => {
                            if (notif.link.startsWith('/')) {
                              navigate(notif.link)
                            } else {
                              window.open(notif.link, '_blank')
                            }
                          }}
                        >
                          Ver detalles
                        </Button>
                      )}
                    </Box>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Card>
    </Box>
  )
}
