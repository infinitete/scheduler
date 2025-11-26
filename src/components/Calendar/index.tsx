import { FC, useState, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import { Schedule } from '@/types/schedule'
import './index.scss'

interface CalendarProps {
  schedules: Schedule[]
  onDateSelect: (date: string) => void
}

const Calendar: FC<CalendarProps> = ({ schedules, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // 获取当前月份的第一天和最后一天
  const firstDay = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    return date
  }, [currentDate])
  
  const lastDay = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return date
  }, [currentDate])
  
  // 获取日历显示的所有日期
  const calendarDays = useMemo(() => {
    const days: Date[] = []
    const startDay = firstDay.getDay() // 0-6, 0是周日
    
    // 填充上个月的日期
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i))
    }
    
    // 填充当前月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
    }
    
    // 填充下个月的日期，凑满6行
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i))
    }
    
    return days
  }, [currentDate, firstDay, lastDay])
  
  // 获取某一天的日程数量
  const getScheduleCount = (date: Date) => {
    // 使用本地日期字符串进行比较
    const dateStr = formatDate(date)
    return schedules.filter(schedule => {
      // 统一处理不同格式的日期字符串，确保使用本地时间
      let scheduleDateStr = ''
      
      // 处理 ISO 格式: 2023-12-01T10:30:00.000Z
      if (schedule.startTime.includes('T')) {
        // 使用 Date 对象处理时区，然后转换为本地日期字符串
        const scheduleDate = new Date(schedule.startTime)
        const localYear = scheduleDate.getFullYear()
        const localMonth = String(scheduleDate.getMonth() + 1).padStart(2, '0')
        const localDate = String(scheduleDate.getDate()).padStart(2, '0')
        scheduleDateStr = `${localYear}-${localMonth}-${localDate}`
      } 
      // 处理其他格式: 2023-12-01 10:30
      else if (schedule.startTime.includes(' ')) {
        scheduleDateStr = schedule.startTime.split(' ')[0]
      }
      // 处理纯日期格式: 2023-12-01
      else {
        scheduleDateStr = schedule.startTime
      }
      
      return scheduleDateStr === dateStr
    }).length
  }
  
  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // 检查是否是当前月
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }
  
  // 检查是否是今天
  const isToday = (date: Date) => {
    const today = new Date()
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate()
  }
  
  // 上一个月
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }
  
  // 下一个月
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }
  
  // 点击日期
  const handleDateClick = (date: Date) => {
    onDateSelect(formatDate(date))
  }
  
  return (
    <View className='calendar'>
      <View className='calendar__header'>
        <Text className='calendar__arrow' onClick={prevMonth}>‹</Text>
        <Text className='calendar__title'>
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </Text>
        <Text className='calendar__arrow' onClick={nextMonth}>›</Text>
      </View>
      
      <View className='calendar__weekdays'>
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <Text key={day} className='calendar__weekday'>{day}</Text>
        ))}
      </View>
      
      <View className='calendar__days'>
        {calendarDays.map((date, index) => {
          const scheduleCount = getScheduleCount(date)
          return (
            <View
              key={index}
              className={`calendar__day ${!isCurrentMonth(date) ? 'calendar__day--other-month' : ''} ${isToday(date) ? 'calendar__day--today' : ''} ${scheduleCount > 0 ? 'calendar__day--has-schedule' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <Text className='calendar__day-text'>{date.getDate()}</Text>
              {scheduleCount > 0 && isCurrentMonth(date) && (
                <View className='calendar__day-badge'>
                  <Text className='calendar__day-badge-text'>{scheduleCount}</Text>
                </View>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default Calendar
