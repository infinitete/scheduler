import { FC, useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Text, Button, Input } from '@tarojs/components'
import { Schedule, ScheduleStatus, Priority } from '@/types/schedule'
import { loadSchedules, deleteSchedule, toggleScheduleStatus, setPriorityFilter, setDateFilter, setTitleFilter, setStatusFilter } from '@/actions/schedule'
import { loadSchedulesFromStorage, saveSchedulesToStorage } from '@/utils/storage'
import './index.scss'

type PageStateProps = {
  schedules: Schedule[]
  priorityFilter: Priority | null
  dateFilter: string | null
  titleFilter: string | null
  statusFilter: ScheduleStatus | null  // 添加状态筛选状态
}

type PageDispatchProps = {
  loadSchedules: (schedules: Schedule[]) => void
  deleteSchedule: (id: string) => void
  toggleScheduleStatus: (id: string) => void
  setPriorityFilter: (priority: Priority | null) => void
  setDateFilter: (date: string | null) => void
  setTitleFilter: (title: string | null) => void
  setStatusFilter: (status: ScheduleStatus | null) => void  // 添加状态筛选 action
}

type IProps = PageStateProps & PageDispatchProps

const ScheduleList: FC<IProps> = (props) => {
  const { 
    schedules, 
    priorityFilter, 
    dateFilter,
    titleFilter,
    statusFilter,  // 添加状态筛选状态
    loadSchedules, 
    deleteSchedule, 
    toggleScheduleStatus,
    setPriorityFilter,
    setDateFilter,
    setTitleFilter,
    setStatusFilter  // 添加状态筛选 action
  } = props

  // 从本地存储加载日程数据
  useEffect(() => {
    const loadData = async () => {
      const schedules = await loadSchedulesFromStorage()
      loadSchedules(schedules)
    }
    loadData()
  }, [])

  // 当日程数据变化时，保存到本地存储
  useEffect(() => {
    const saveData = async () => {
      await saveSchedulesToStorage(schedules)
    }
    saveData()
  }, [schedules])

  // 监听筛选条件变化
  useEffect(() => {
    console.log('筛选条件变化:', { priorityFilter, dateFilter, titleFilter, statusFilter });
  }, [priorityFilter, dateFilter, titleFilter, statusFilter]);

  // 过滤日程
  const filteredSchedules = useMemo(() => {
    console.log('开始筛选:', { 
      schedulesCount: schedules.length, 
      priorityFilter, 
      dateFilter,
      titleFilter,
      statusFilter
    });
    
    let result = [...schedules] // 创建副本避免修改原数组
    
    // 按标题筛选
    if (titleFilter) {
      console.log('标题筛选:', titleFilter);
      result = result.filter(schedule => 
        schedule.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
      console.log('标题筛选结果:', result.length);
    }
    
    // 按优先级筛选
    if (priorityFilter) {
      console.log('优先级筛选:', { priorityFilter });
      result = result.filter(schedule => schedule.priority === priorityFilter);
      console.log('优先级筛选结果:', result.length);
    }
    
    // 按状态筛选
    if (statusFilter !== null && statusFilter !== undefined) {
      console.log('状态筛选:', statusFilter);
      result = result.filter(schedule => schedule.status === statusFilter);
      console.log('状态筛选结果:', result.length);
    }
    
    // 按日期筛选
    if (dateFilter) {
      console.log('日期筛选:', dateFilter);
      result = result.filter(schedule => {
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
        
        console.log('比较日期:', { scheduleDateStr, dateFilter, match: scheduleDateStr === dateFilter });
        return scheduleDateStr === dateFilter
      })
    }
    
    // 按未完成和时间排序
    // 1. 未完成的排在前面
    // 2. 按开始时间升序排列
    result.sort((a, b) => {
      // 首先按状态排序：未完成(PENDING)排在前面，已完成(COMPLETED)排在后面
      if (a.status !== b.status) {
        if (a.status === ScheduleStatus.PENDING) return -1;
        if (b.status === ScheduleStatus.PENDING) return 1;
      }
      
      // 然后按开始时间排序：时间早的排在前面
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    });
    
    console.log('最终筛选结果:', result.length);
    return result
  }, [schedules, priorityFilter, dateFilter, titleFilter, statusFilter])

  // 跳转到筛选页面
  const handleFilter = () => {
    Taro.navigateTo({
      url: `/pages/filter/index?priority=${priorityFilter || ''}&date=${dateFilter || ''}`
    })
  }

  // 接收筛选参数的回调函数
  const onFilterChange = (filters: { priority: string, date: string }) => {
    setPriorityFilter(filters.priority ? (parseInt(filters.priority) as unknown as Priority) : null)
    setDateFilter(filters.date || null)
  }

  // 暴露回调函数给其他页面调用
  useEffect(() => {
    // 将回调函数挂载到当前页面实例
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage && currentPage.$component) {
      currentPage.$component.onFilterChange = onFilterChange
    }
  }, [])

  // 格式化时间显示
  const formatTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    const formatDate = (date: Date) => {
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours().toString().padStart(2, '0')
      const minute = date.getMinutes().toString().padStart(2, '0')
      return `${month}月${day}日 ${hour}:${minute}`
    }

    return `${formatDate(start)} - ${formatDate(end)}`
  }

  // 获取优先级文本
  const getPriorityText = (priority: Priority) => {
    const priorityMap = {
      [Priority.HIGH]: '高',
      [Priority.MEDIUM]: '中',
      [Priority.LOW]: '低'
    }
    return priorityMap[priority]
  }

  // 获取状态文本
  const getStatusText = (status: ScheduleStatus) => {
    const statusMap = {
      [ScheduleStatus.PENDING]: '待处理',
      [ScheduleStatus.COMPLETED]: '已完成'
    }
    return statusMap[status]
  }

  // 跳转到新增页面
  const handleAdd = () => {
    Taro.navigateTo({
      url: '/pages/schedule-form/index'
    })
  }

  // 跳转到详情页面
  const handleViewDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/schedule-detail/index?id=${id}`
    })
  }

  // 跳转到编辑页面
  const handleEdit = (id: string) => {
    Taro.navigateTo({
      url: `/pages/schedule-form/index?id=${id}`
    })
  }

  // 删除日程
  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条日程吗？',
      success: (res) => {
        if (res.confirm) {
          deleteSchedule(id)
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }

  // 切换日程状态
  const handleToggleStatus = (id: string) => {
    toggleScheduleStatus(id)
  }

  return (
    <View className='schedule-list'>
      {/* 优化后的筛选区域 */}
      <View className='schedule-list__header'>
        {/* 搜索框 */}
        <View 
          className='schedule-list__search-container'
          onClick={handleFilter}
        >
          <Input
            className='schedule-list__search-input'
            placeholder='输入关键词搜索日程'
            disabled
            value={
              (titleFilter ? `标题: ${titleFilter}` : '') +
              (titleFilter && (priorityFilter || dateFilter || statusFilter !== null) ? ', ' : '') +
              (priorityFilter ? `优先级: ${getPriorityText(priorityFilter)}` : '') +
              (priorityFilter && (dateFilter || statusFilter !== null) ? ', ' : '') +
              (statusFilter !== null ? `状态: ${getStatusText(statusFilter)}` : '') +
              (statusFilter !== null && dateFilter ? ', ' : '') +
              (dateFilter ? `日期: ${dateFilter}` : '')
            }
          />
          {
            priorityFilter || dateFilter || titleFilter || statusFilter !== null ? (
              <View 
                className='schedule-list__search-icon schedule-list__clear-icon'
                onClick={(e) => {
                  e.stopPropagation();
                  setPriorityFilter(null)
                  setDateFilter(null)
                  setTitleFilter(null)
                  setStatusFilter(null)  // 清除状态筛选
                }}
              >
                ×
              </View>
            ) : (
              <View className='schedule-list__search-icon'>🔍</View>
            )
          }
        </View>
        
        {/* 状态筛选按钮已移除，相关功能已在筛选页面实现 */}
      </View>

      {/* 日程列表 */}
      {filteredSchedules.length === 0 ? (
        <View className='schedule-list__empty'>
          <View className='empty-icon'>📅</View>
          <View className='empty-text'>暂无日程</View>
        </View>
      ) : (
        <View className='schedule-list__items'>
          {filteredSchedules.map(schedule => (
            <View
              key={schedule.id}
              className={`schedule-list__item ${schedule.status === ScheduleStatus.COMPLETED ? 'schedule-list__item--completed' : ''}`}
            >
              <View className='schedule-list__item-header'>
                <Text
                  className={`schedule-list__item-title ${schedule.status === ScheduleStatus.COMPLETED ? 'schedule-list__item-title--completed' : ''}`}
                  onClick={() => handleViewDetail(schedule.id)}
                >
                  {schedule.title}
                </Text>
                <Text className={`schedule-list__item-priority schedule-list__item-priority--${schedule.priority}`}>
                  {getPriorityText(schedule.priority)}
                </Text>
              </View>

              <View className='schedule-list__item-time'>
                <Text className='icon'>🕒</Text>
                <Text>{formatTime(schedule.startTime, schedule.endTime)}</Text>
              </View>

              {schedule.description && (
                <View className='schedule-list__item-desc'>
                  {schedule.description}
                </View>
              )}

              {schedule.location && (
                <View className='schedule-list__item-location'>
                  <Text className='icon'>📍</Text>
                  <Text>{schedule.location}</Text>
                </View>
              )}

              <View className='schedule-list__item-footer'>
                <Button
                  className='schedule-list__item-status'
                  onClick={() => handleToggleStatus(schedule.id)}
                >
                  {schedule.status === ScheduleStatus.COMPLETED ? '✓ 已完成' : '标记完成'}
                </Button>
                <View className='schedule-list__item-actions'>
                  <Button
                    className='schedule-list__action-btn'
                    onClick={() => handleEdit(schedule.id)}
                  >
                    编辑
                  </Button>
                  <Button
                    className='schedule-list__action-btn schedule-list__action-btn--delete'
                    onClick={() => handleDelete(schedule.id)}
                  >
                    删除
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 添加按钮 */}
      <Button className='schedule-list__add-btn' onClick={handleAdd}>
        +
      </Button>
    </View>
  )
}

export default connect(
  (state: any) => {
    console.log('从 Redux 获取状态:', state.schedule);
    return {
      schedules: state.schedule.schedules,
      priorityFilter: state.schedule.priorityFilter,
      dateFilter: state.schedule.dateFilter,
      titleFilter: state.schedule.titleFilter,
      statusFilter: state.schedule.statusFilter  // 添加状态筛选状态
    }
  },
  (dispatch) => ({
    loadSchedules(schedules: Schedule[]) {
      dispatch(loadSchedules(schedules))
    },
    deleteSchedule(id: string) {
      dispatch(deleteSchedule(id))
    },
    toggleScheduleStatus(id: string) {
      dispatch(toggleScheduleStatus(id))
    },
    setPriorityFilter(priority: Priority | null) {
      dispatch(setPriorityFilter(priority))
    },
    setDateFilter(date: string | null) {
      dispatch(setDateFilter(date))
    },
    setTitleFilter(title: string | null) {
      dispatch(setTitleFilter(title))
    },
    setStatusFilter(status: ScheduleStatus | null) {  // 添加状态筛选 action
      dispatch(setStatusFilter(status))
    }
  })
)(ScheduleList)