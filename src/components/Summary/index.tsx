import { FC, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Schedule, ScheduleStatus, Priority } from '@/types/schedule'
import './index.scss'

interface SummaryProps {
  schedules: Schedule[]
}

const Summary: FC<SummaryProps> = ({ schedules }) => {
  // 统计数据
  const stats = useMemo(() => {
    const total = schedules.length
    const completed = schedules.filter(s => s.status === ScheduleStatus.COMPLETED).length
    const pending = schedules.filter(s => s.status === ScheduleStatus.PENDING).length
    const high = schedules.filter(s => s.priority === Priority.HIGH).length
    const medium = schedules.filter(s => s.priority === Priority.MEDIUM).length
    const low = schedules.filter(s => s.priority === Priority.LOW).length
    
    return {
      total,
      completed,
      pending,
      high,
      medium,
      low,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [schedules])
  
  // 今日日程
  const todaySchedules = useMemo(() => {
    // 获取今天日期，使用本地时间
    const today = new Date()
    const todayYear = today.getFullYear()
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
    const todayDate = String(today.getDate()).padStart(2, '0')
    const todayStr = `${todayYear}-${todayMonth}-${todayDate}`
    
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
      
      // 只统计待办状态的日程
      return scheduleDateStr === todayStr && schedule.status === ScheduleStatus.PENDING
    })
  }, [schedules])
  
  // 即将到来的日程（未来7天）
  const upcomingSchedules = useMemo(() => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return schedules.filter(schedule => {
      // 统一处理不同格式的日期字符串
      let scheduleDateObj
      
      // 处理 ISO 格式: 2023-12-01T10:30:00.000Z
      if (schedule.startTime.includes('T')) {
        scheduleDateObj = new Date(schedule.startTime)
      } 
      // 处理其他格式: 2023-12-01 10:30
      else if (schedule.startTime.includes(' ')) {
        scheduleDateObj = new Date(schedule.startTime.replace(' ', 'T'))
      }
      // 处理纯日期格式: 2023-12-01
      else {
        scheduleDateObj = new Date(schedule.startTime)
      }
      
      return scheduleDateObj > today && 
             scheduleDateObj <= nextWeek && 
             schedule.status === ScheduleStatus.PENDING
    }).length
  }, [schedules])

  // 跳转到日程列表页面
  const navigateToScheduleList = () => {
    Taro.switchTab({
      url: '/pages/schedule-list/index'
    })
  }

  // 点击统计卡片
  const handleCardClick = (type: 'total' | 'completed' | 'pending') => {
    // 将筛选条件保存到本地存储，以便日程列表页面读取
    const filterMap = {
      'total': 'all',
      'completed': ScheduleStatus.COMPLETED,
      'pending': ScheduleStatus.PENDING
    }
    
    Taro.setStorageSync('schedule_filter', filterMap[type])
    navigateToScheduleList()
  }

  // 点击优先级
  const handlePriorityClick = (priority: Priority) => {
    Taro.setStorageSync('schedule_priority_filter', priority)
    navigateToScheduleList()
  }
  
  return (
    <View className='summary'>
      <Text className='summary__title'>日程总结</Text>
      
      {/* 完成率 */}
      <View className='summary__completion'>
        <View className='summary__completion-circle'>
          <Text className='summary__completion-rate'>{stats.completionRate}%</Text>
          <Text className='summary__completion-label'>完成率</Text>
        </View>
      </View>
      
      {/* 统计卡片 */}
      <View className='summary__cards'>
        <View 
          className='summary__card summary__card--total'
          onClick={() => handleCardClick('total')}
        >
          <View className='summary__card-icon summary__card-icon--total' />
          <Text className='summary__card-value'>{stats.total}</Text>
          <Text className='summary__card-label'>总日程</Text>
        </View>
        
        <View 
          className='summary__card summary__card--completed'
          onClick={() => handleCardClick('completed')}
        >
          <View className='summary__card-icon summary__card-icon--completed' />
          <Text className='summary__card-value'>{stats.completed}</Text>
          <Text className='summary__card-label'>已完成</Text>
        </View>
        
        <View 
          className='summary__card summary__card--pending'
          onClick={() => handleCardClick('pending')}
        >
          <View className='summary__card-icon summary__card-icon--pending' />
          <Text className='summary__card-value'>{stats.pending}</Text>
          <Text className='summary__card-label'>待处理</Text>
        </View>
      </View>
      
      {/* 优先级统计 */}
      <View className='summary__priority'>
        <Text className='summary__section-title'>优先级分布</Text>
        <View className='summary__priority-bars'>
          <View 
            className='summary__priority-item'
            onClick={() => handlePriorityClick(Priority.HIGH)}
          >
            <Text className='summary__priority-label'>高</Text>
            <View className='summary__priority-bar'>
              <View 
                className='summary__priority-fill summary__priority-fill--high' 
                style={{ width: `${stats.total > 0 ? (stats.high / stats.total) * 100 : 0}%` }}
              />
            </View>
            <Text className='summary__priority-value'>{stats.high}</Text>
          </View>
          
          <View 
            className='summary__priority-item'
            onClick={() => handlePriorityClick(Priority.MEDIUM)}
          >
            <Text className='summary__priority-label'>中</Text>
            <View className='summary__priority-bar'>
              <View 
                className='summary__priority-fill summary__priority-fill--medium' 
                style={{ width: `${stats.total > 0 ? (stats.medium / stats.total) * 100 : 0}%` }}
              />
            </View>
            <Text className='summary__priority-value'>{stats.medium}</Text>
          </View>
          
          <View 
            className='summary__priority-item'
            onClick={() => handlePriorityClick(Priority.LOW)}
          >
            <Text className='summary__priority-label'>低</Text>
            <View className='summary__priority-bar'>
              <View 
                className='summary__priority-fill summary__priority-fill--low' 
                style={{ width: `${stats.total > 0 ? (stats.low / stats.total) * 100 : 0}%` }}
              />
            </View>
            <Text className='summary__priority-value'>{stats.low}</Text>
          </View>
        </View>
      </View>
      
      {/* 今日和未来提醒 */}
      <View className='summary__upcoming'>
        <View 
          className='summary__upcoming-item'
          onClick={navigateToScheduleList}
        >
          <Text className='summary__upcoming-value'>{todaySchedules.length}</Text>
          <Text className='summary__upcoming-label'>今日待办</Text>
        </View>
        
        <View 
          className='summary__upcoming-item'
          onClick={navigateToScheduleList}
        >
          <Text className='summary__upcoming-value'>{upcomingSchedules}</Text>
          <Text className='summary__upcoming-label'>未来7天</Text>
        </View>
      </View>
    </View>
  )
}

export default Summary
