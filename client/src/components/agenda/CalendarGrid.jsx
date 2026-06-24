import { useState, useMemo } from 'react'
import {
  Box, IconButton, Typography, Paper, alpha, Stack
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSaturday, isSameDay, isToday, 
  startOfWeek, endOfWeek 
} from 'date-fns'
import { es } from 'date-fns/locale'
import logoBanana from '../../assets/logoBanana.png'

export default function CalendarGrid({ selectedDate, onDateSelect, occupiedDates = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const allDays = eachDayOfInterval({ start: startDate, end: endDate })

    const weeksArr = []
    for (let i = 0; i < allDays.length; i += 7) {
      weeksArr.push(allDays.slice(i, i + 7))
    }
    return weeksArr
  }, [currentMonth])

  const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <Box sx={{ width: '100%' }}>
      {/* Calendar Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 4,
        px: 1 
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
            {format(currentMonth, 'MMMM', { locale: es }).charAt(0).toUpperCase() + format(currentMonth, 'MMMM', { locale: es }).slice(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {format(currentMonth, 'yyyy')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton 
            onClick={prevMonth} 
            size="medium" 
            sx={{ 
              bgcolor: 'background.paper', 
              border: '1px solid', 
              borderColor: 'divider',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={nextMonth} 
            size="medium" 
            sx={{ 
              bgcolor: 'background.paper', 
              border: '1px solid', 
              borderColor: 'divider',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* CSS Grid for Days */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: { xs: 0.5, sm: 1 },
        width: '100%',
        bgcolor: alpha('#f4f7f4', 0.5),
        p: 1,
        borderRadius: '20px'
      }}>
        {/* Day Headers */}
        {dayHeaders.map((day, i) => (
          <Box key={`header-${i}`} sx={{ py: 1 }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              align="center" 
              sx={{ 
                display: 'block', 
                fontWeight: 700, 
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {day}
            </Typography>
          </Box>
        ))}

        {/* Calendar Days */}
        {weeks.flat().map((day) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
          const selectable = isSaturday(day) && day >= new Date()
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isOccupied = occupiedDates.some(d => isSameDay(day, d))
          const today = isToday(day)

          return (
            <Box 
              key={day.toString()} 
              sx={{ 
                p: { xs: 0.2, sm: 0.5 },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Paper
                elevation={isSelected || isOccupied ? 4 : 0}
                onClick={() => selectable && onDateSelect(day)}
                sx={{
                  width: '100%',
                  aspectRatio: '1/1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: selectable ? 'pointer' : 'default',
                  borderRadius: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  bgcolor: (isSelected || isOccupied)
                    ? 'primary.main' 
                    : selectable 
                      ? 'white' 
                      : 'transparent',
                  color: (isSelected || isOccupied)
                    ? 'white' 
                    : selectable 
                      ? 'primary.main' 
                      : isCurrentMonth ? 'text.secondary' : 'text.disabled',
                  border: (isSelected || isOccupied)
                    ? 'none' 
                    : selectable 
                      ? '1px solid' 
                      : today ? '2px solid' : 'none',
                  borderColor: today 
                    ? 'primary.main' 
                    : selectable 
                      ? alpha('#41703f', 0.15) 
                      : 'transparent',
                  boxShadow: selectable && !(isSelected || isOccupied) ? '0 2px 6px rgba(65, 112, 63, 0.08)' : 'none',
                  '&:hover': {
                    bgcolor: selectable && !(isSelected || isOccupied) ? alpha('#41703f', 0.04) : undefined,
                    transform: selectable && !(isSelected || isOccupied) ? 'translateY(-2px)' : 'none',
                    boxShadow: selectable && !(isSelected || isOccupied) ? '0 4px 12px rgba(65, 112, 63, 0.12)' : undefined,
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {selectable && !(isSelected || isOccupied) && (
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 4, 
                    width: 4, 
                    height: 4, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main' 
                  }} />
                )}
                {(isSelected || isOccupied) && (
                  <Box 
                    component="img" 
                    src={logoBanana} 
                    alt="Banana" 
                    sx={{ 
                      position: 'absolute', 
                      width: '60%', 
                      height: '60%', 
                      objectFit: 'contain', 
                      zIndex: 1,
                      opacity: 0.9
                    }} 
                  />
                )}
                {!(isSelected || isOccupied) && (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: selectable || today ? 800 : 400,
                      fontSize: { xs: '0.9rem', sm: '1.1rem' },
                      zIndex: 1
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                )}
              </Paper>
            </Box>
          )
        })}
      </Box>

      {/* Legend sutil */}
      <Box sx={{ mt: 2, px: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
          <Typography variant="caption" color="text.secondary">Disponible</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid', borderColor: 'primary.main' }} />
          <Typography variant="caption" color="text.secondary">Hoy</Typography>
        </Box>
      </Box>
    </Box>
  )
}

