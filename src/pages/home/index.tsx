import React, { useState, useEffect } from 'react'
import { View, Button, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Calendar from '@/components/Calendar'
import Summary from '@/components/Summary'
import { Schedule } from '@/types/schedule'
import { loadSchedulesFromStorage } from '@/utils/storage'
import './index.scss'

const Home: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([])

  // 从本地存储加载日程数据
  useEffect(() => {
    const loadData = async () => {
      const schedules = await loadSchedulesFromStorage()
      setSchedules(schedules)
    }
    loadData()
  }, [])

  // 当日程数据变化时，重新加载数据
  useEffect(() => {
    const loadData = async () => {
      const schedules = await loadSchedulesFromStorage()
      setSchedules(schedules)
    }
    
    // 监听页面显示事件
    Taro.eventCenter.on('scheduleUpdated', loadData)
    
    // 返回清理函数
    return () => {
      Taro.eventCenter.off('scheduleUpdated', loadData)
    }
  }, [])

  // 处理日期点击事件
  const handleDateClick = (date: string) => {
    Taro.showModal({
      title: '新建日程',
      content: `是否在 ${date} 创建新日程？`,
      success: (res) => {
        if (res.confirm) {
          // 获取当前时间作为开始时间
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, '0')
          const day = String(now.getDate()).padStart(2, '0')
          const hours = String(now.getHours()).padStart(2, '0')
          const minutes = String(now.getMinutes()).padStart(2, '0')
          
          // 检查选择的日期是否是今天或未来
          const selectedDate = new Date(date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          if (selectedDate < today) {
            Taro.showToast({
              title: '不能创建过去的日程',
              icon: 'none'
            })
            return
          }
          
          // 如果选择的是今天，则使用当前时间；否则使用当天的 09:00
          const startTime = selectedDate.getTime() === today.getTime() 
            ? `${year}-${month}-${day} ${hours}:${minutes}` 
            : `${date} 09:00`
          
          Taro.navigateTo({
            url: `/pages/schedule-form/index?startTime=${startTime}`
          })
        }
      }
    })
  }

  return (
    <View className='home'>
      <Calendar 
        schedules={schedules}
        onDateSelect={handleDateClick}
      />
      
      <Summary schedules={schedules} />
    </View>
  )
}

export default Home