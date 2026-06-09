import { useState, useMemo } from 'react'
import {
  Box, IconButton, Typography, Grid, Paper, alpha, Stack
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSaturday, isSameDay, isToday, 
  startOfWeek, endOfWeek 
} from 'date-fns'
import { es } from 'date-fns/locale'

export default function CalendarGrid({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // Start on Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
    
    const weeksArr = []
    for (let i = 0; i < allDays.length; i += 7) {
      weeksArr.push(allDays.slice(i, i + 7))
    }
    return weeksArr
  }, [currentMonth])

  const dayHeaders = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'capitalize', color: 'text.primary' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={prevMonth} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={nextMonth} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Day Headers */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {dayHeaders.map((day, i) => (
          <Grid item xs={1.71} key={`header-${i}`}>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Weeks Rows */}
      <Stack spacing={1}>
        {weeks.map((week, wIdx) => (
          <Grid container spacing={1} key={`week-${wIdx}`}>
            {week.map((day, dIdx) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
              const selectable = isSaturday(day) && day >= new Date()
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const today = isToday(day)

              return (
                <Grid item xs={1.71} key={day.toString()}>
                  <Paper
                    elevation={0}
                    onClick={() => selectable && onDateSelect(day)}
                    sx={{
                      py: 1.5, // Taller touch target
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: selectable ? 'pointer' : 'default',
                      borderRadius: '12px',
                      transition: 'all 0.2s',
                      bgcolor: isSelected 
                        ? 'primary.main' 
                        : selectable 
                          ? alpha('#41703f', 0.08) 
                          : 'transparent',
                      color: isSelected 
                        ? 'white' 
                        : selectable 
                          ? 'primary.main' 
                          : isCurrentMonth ? 'text.secondary' : 'text.disabled',
                      border: today ? '2px solid' : isSelected ? 'none' : '1px solid',
                      borderColor: isSelected 
                        ? 'transparent' 
                        : today 
                          ? 'primary.main' 
                          : selectable 
                            ? alpha('#41703f', 0.2) 
                            : 'transparent',
                      '&:hover': {
                        bgcolor: selectable && !isSelected ? alpha('#41703f', 0.15) : undefined,
                        transform: selectable ? 'scale(1.05)' : 'none'
                      }
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: selectable || today ? 700 : 400,
                        fontSize: selectable ? '1rem' : '0.875rem'
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        ))}
      </Stack>
    </Box>
  )
}
