import { useState, useMemo } from 'react'
import {
  Box, IconButton, Typography, Grid, Paper, alpha
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

export default function CalendarGrid({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Get the start day of the week to align the grid
  const firstDayOfMonth = startOfMonth(currentMonth).getDay()
  const blanks = Array(firstDayOfMonth).fill(null)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </Typography>
        <Box>
          <IconButton onClick={prevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={nextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={1}>
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day) => (
          <Grid item xs={1.71} key={day}>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', fontWeight: 600 }}>
              {day}
            </Typography>
          </Grid>
        ))}

        {blanks.map((_, i) => (
          <Grid item xs={1.71} key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const selectable = isSaturday(day) && day >= new Date()
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const today = isToday(day)

          return (
            <Grid item xs={1.71} key={day.toString()}>
              <Paper
                elevation={0}
                onClick={() => selectable && onDateSelect(day)}
                sx={{
                  aspectRatio: '1/1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: selectable ? 'pointer' : 'default',
                  borderRadius: '12px',
                  bgcolor: isSelected 
                    ? 'primary.main' 
                    : selectable 
                      ? alpha('#41703f', 0.1) 
                      : 'transparent',
                  color: isSelected 
                    ? 'white' 
                    : selectable 
                      ? 'primary.main' 
                      : 'text.disabled',
                  border: today ? '1px solid' : 'none',
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: selectable && !isSelected ? alpha('#41703f', 0.2) : undefined
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: selectable || today ? 600 : 400 }}>
                  {format(day, 'd')}
                </Typography>
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
