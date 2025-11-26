import React, { useState, useEffect } from 'react'
import { View, Button, Picker, Text, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { connect } from 'react-redux'
import { setPriorityFilter, setDateFilter, setTitleFilter, setStatusFilter } from '@/actions/schedule'
import { Priority, ScheduleStatus } from '@/types/schedule'
import './index.scss'

type PageStateProps = {
  priorityFilter: Priority | null
  dateFilter: string | null
  titleFilter: string | null
  statusFilter: ScheduleStatus | null
}

type PageDispatchProps = {
  setPriorityFilter: (priority: Priority | null) => void
  setDateFilter: (date: string | null) => void
  setTitleFilter: (title: string | null) => void
  setStatusFilter: (status: ScheduleStatus | null) => void
}

type IProps = PageStateProps & PageDispatchProps

const FilterPage: React.FC<IProps> = (props) => {
  const { 
    priorityFilter: reduxPriorityFilter, 
    dateFilter: reduDateFilter,
    titleFilter: reduxTitleFilter,
    statusFilter: reduxStatusFilter,
    setPriorityFilter,
    setDateFilter,
    setTitleFilter,
    setStatusFilter
  } = props
  
  const router = useRouter()
  const [priority, setPriority] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  // 初始化筛选条件
  useEffect(() => {
    console.log('初始化筛选条件:', { 
      reduxPriorityFilter, 
      reduDateFilter,
      reduxTitleFilter,
      reduxStatusFilter
    });
    
    // 优先使用 Redux 中的状态，如果没有则使用路由参数
    if (reduxPriorityFilter) {
      // 将 Priority 枚举值转换为对应的字符串索引
      const priorityIndexMap = {
        [Priority.LOW]: '1',
        [Priority.MEDIUM]: '2',
        [Priority.HIGH]: '3'
      };
      setPriority(priorityIndexMap[reduxPriorityFilter] || '')
    } else if (router.params.priority && router.params.priority !== 'null' && router.params.priority !== '0') {
      setPriority(router.params.priority)
    } else {
      setPriority('')
    }
    
    if (reduDateFilter) {
      setDate(reduDateFilter)
    } else if (router.params.date && router.params.date !== 'null') {
      setDate(router.params.date)
    } else {
      setDate('')
    }
    
    // 初始化标题筛选
    if (reduxTitleFilter) {
      setTitle(reduxTitleFilter)
    }
    
    // 初始化状态筛选
    if (reduxStatusFilter) {
      setStatus(reduxStatusFilter.toString())
    }
  }, [router.params, reduxPriorityFilter, reduDateFilter, reduxTitleFilter, reduxStatusFilter])

  // 保存筛选条件并返回
  const handleSave = () => {
    console.log('保存筛选条件:', { priority, date, title, status });
    
    // 更新 Redux 状态
    // 将字符串值转换为正确的 Priority 枚举值
    let priorityValue: Priority | null = null;
    if (priority) {
      const priorityMap = {
        '1': Priority.LOW,
        '2': Priority.MEDIUM,
        '3': Priority.HIGH
      };
      priorityValue = priorityMap[priority] || null;
    }
    
    // 将字符串值转换为正确的 ScheduleStatus 枚举值
    let statusValue: ScheduleStatus | null = null;
    if (status) {
      const statusMap = {
        '1': ScheduleStatus.PENDING,
        '2': ScheduleStatus.COMPLETED
      };
      statusValue = statusMap[status] || null;
    }
    
    console.log('设置 Redux 筛选条件:', { 
      priorityValue, 
      dateFilter: date || null, 
      titleFilter: title || null,
      statusFilter: statusValue
    });
    setPriorityFilter(priorityValue)
    setDateFilter(date || null)
    setTitleFilter(title || null)
    setStatusFilter(statusValue)
    
    // 返回上一页
    Taro.navigateBack({
      delta: 1
    })
  }

  // 清除所有筛选条件
  const handleClearAll = () => {
    setPriority('')
    setDate('')
    setTitle('')
    setStatus('')
    setPriorityFilter(null)
    setDateFilter(null)
    setTitleFilter(null)
    setStatusFilter(null)
  }

  return (
    <View className='filter-page'>
      <View className='filter-page__header'>
        <Text className='filter-page__title'>筛选条件</Text>
      </View>
      
      <View className='filter-page__content'>
        <View className='filter-page__card'>
          <View className='filter-page__form'>
            {/* 标题筛选 */}
            <View className='filter-page__section'>
              <View className='filter-page__section-header'>
                <View className='filter-page__section-icon'>T</View>
                <Text className='filter-page__label'>按标题筛选</Text>
              </View>
              <Input
                className='filter-page__input'
                placeholder='请输入标题关键词'
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
              />
            </View>

            <View className='filter-page__divider'></View>

            {/* 优先级筛选 */}
            <View className='filter-page__section'>
              <View className='filter-page__section-header'>
                <View className='filter-page__section-icon'>!</View>
                <Text className='filter-page__label'>按优先级筛选</Text>
              </View>
              <Picker 
                mode='selector' 
                range={['无', '低', '中', '高']} 
                onChange={(e) => setPriority(e.detail.value === 0 ? '' : String(e.detail.value))}
              >
                <View className='filter-page__picker'>
                  <Text className='filter-page__picker-text'>
                    {priority ? ['无', '低', '中', '高'][parseInt(priority)] : '请选择优先级'}
                  </Text>
                  <Text className='filter-page__picker-arrow'>›</Text>
                </View>
              </Picker>
            </View>

            <View className='filter-page__divider'></View>

            {/* 状态筛选 */}
            <View className='filter-page__section'>
              <View className='filter-page__section-header'>
                <View className='filter-page__section-icon'>✓</View>
                <Text className='filter-page__label'>按状态筛选</Text>
              </View>
              <Picker 
                mode='selector' 
                range={['无', '待处理', '已完成']} 
                onChange={(e) => setStatus(e.detail.value === 0 ? '' : String(e.detail.value))}
              >
                <View className='filter-page__picker'>
                  <Text className='filter-page__picker-text'>
                    {status ? ['无', '待处理', '已完成'][parseInt(status)] : '请选择状态'}
                  </Text>
                  <Text className='filter-page__picker-arrow'>›</Text>
                </View>
              </Picker>
            </View>

            <View className='filter-page__divider'></View>

            {/* 日期筛选 */}
            <View className='filter-page__section'>
              <View className='filter-page__section-header'>
                <View className='filter-page__section-icon'>📅</View>
                <Text className='filter-page__label'>按日期筛选</Text>
              </View>
              <Picker 
                mode='date' 
                value={date} 
                start='2020-01-01' 
                end='2030-12-31' 
                onChange={(e) => setDate(e.detail.value)}
              >
                <View className='filter-page__picker'>
                  <Text className='filter-page__picker-text'>
                    {date || '请选择日期'}
                  </Text>
                  <Text className='filter-page__picker-arrow'>›</Text>
                </View>
              </Picker>
            </View>
          </View>
          
          <View className='filter-page__footer'>
            <Button 
              className='filter-page__button filter-page__button--clear'
              onClick={handleClearAll}
            >
              清除所有
            </Button>
            <Button 
              className='filter-page__button filter-page__button--save'
              onClick={handleSave}
            >
              应用筛选
            </Button>
          </View>
        </View>
      </View>
    </View>
  )
}

export default connect(
  (state: any) => {
    console.log('从 Redux 获取筛选状态:', state.schedule);
    return {
      priorityFilter: state.schedule.priorityFilter,
      dateFilter: state.schedule.dateFilter,
      titleFilter: state.schedule.titleFilter,
      statusFilter: state.schedule.statusFilter
    }
  },
  (dispatch) => ({
    setPriorityFilter(priority: Priority | null) {
      dispatch(setPriorityFilter(priority))
    },
    setDateFilter(date: string | null) {
      dispatch(setDateFilter(date))
    },
    setTitleFilter(title: string | null) {
      dispatch(setTitleFilter(title))
    },
    setStatusFilter(status: ScheduleStatus | null) {
      dispatch(setStatusFilter(status))
    }
  })
)(FilterPage)