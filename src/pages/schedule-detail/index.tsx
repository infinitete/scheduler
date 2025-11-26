import { FC, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { Schedule, Priority, ScheduleStatus } from '@/types/schedule'
import { deleteSchedule, toggleScheduleStatus } from '@/actions/schedule'
import './index.scss'

type PageStateProps = {
  schedules: Schedule[]
}

type PageDispatchProps = {
  deleteSchedule: (id: string) => void
  toggleScheduleStatus: (id: string) => void
}

type IProps = PageStateProps & PageDispatchProps

const ScheduleDetail: FC<IProps> = (props) => {
  const { schedules, deleteSchedule, toggleScheduleStatus } = props
  const [schedule, setSchedule] = useState<Schedule | undefined>(undefined)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params || {}
    const id = params.id
    
    if (id) {
      const foundSchedule = schedules.find(s => s.id === id)
      if (foundSchedule) {
        setSchedule(foundSchedule)
      } else {
        Taro.showToast({
          title: '日程不存在',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    }
  }, [schedules])

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const weekDay = weekDays[date.getDay()]
    
    return `${year}年${month}月${day}日 星期${weekDay} ${hour}:${minute}`
  }

  const getPriorityText = (priority: Priority) => {
    const priorityMap = {
      [Priority.HIGH]: '高',
      [Priority.MEDIUM]: '中',
      [Priority.LOW]: '低'
    }
    return priorityMap[priority]
  }

  const getStatusText = (status: ScheduleStatus) => {
    const statusMap = {
      [ScheduleStatus.PENDING]: '待办',
      [ScheduleStatus.COMPLETED]: '已完成',
      [ScheduleStatus.CANCELLED]: '已取消'
    }
    return statusMap[status]
  }

  const handleEdit = () => {
    if (schedule) {
      Taro.navigateTo({
        url: `/pages/schedule-form/index?id=${schedule.id}`
      })
    }
  }

  const handleDelete = () => {
    if (schedule) {
      Taro.showModal({
        title: '确认删除',
        content: '确定要删除这条日程吗？',
        success: (res) => {
          if (res.confirm) {
            deleteSchedule(schedule.id)
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            })
            setTimeout(() => {
              Taro.navigateBack()
            }, 1000)
          }
        }
      })
    }
  }

  const handleToggleStatus = () => {
    if (schedule) {
      toggleScheduleStatus(schedule.id)
      Taro.showToast({
        title: schedule.status === ScheduleStatus.COMPLETED ? '标记为待办' : '标记为已完成',
        icon: 'success'
      })
    }
  }

  if (!schedule) {
    return (
      <View className='schedule-detail'>
        <View className='schedule-detail__empty'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='schedule-detail'>
      {/* 头部信息 */}
      <View className='schedule-detail__header'>
        <Text className={`schedule-detail__title ${schedule.status === ScheduleStatus.COMPLETED ? 'schedule-detail__title--completed' : ''}`}>
          {schedule.title}
        </Text>
        <View className='schedule-detail__status'>
          <Text className={`schedule-detail__status-badge schedule-detail__status-badge--${schedule.status}`}>
            {getStatusText(schedule.status)}
          </Text>
          <Text className={`schedule-detail__priority schedule-detail__priority--${schedule.priority}`}>
            优先级：{getPriorityText(schedule.priority)}
          </Text>
        </View>
      </View>

      {/* 时间信息 */}
      <View className='schedule-detail__section'>
        <Text className='schedule-detail__section-title'>时间安排</Text>
        <View className='schedule-detail__time-range'>
          <View className='schedule-detail__time-item'>
            <Text className='label'>开始</Text>
            <Text>{formatDateTime(schedule.startTime)}</Text>
          </View>
          <View className='schedule-detail__time-item'>
            <Text className='label'>结束</Text>
            <Text>{formatDateTime(schedule.endTime)}</Text>
          </View>
        </View>
      </View>

      {/* 描述 */}
      {schedule.description && (
        <View className='schedule-detail__section'>
          <Text className='schedule-detail__section-title'>详细描述</Text>
          <Text className='schedule-detail__description'>
            {schedule.description}
          </Text>
        </View>
      )}

      {/* 地点 */}
      {schedule.location && (
        <View className='schedule-detail__section'>
          <View className='schedule-detail__info-item'>
            <View className='schedule-detail__info-label'>
              <Text className='icon'>📍</Text>
              <Text>地点</Text>
            </View>
            <Text className='schedule-detail__info-value'>
              {schedule.location}
            </Text>
          </View>
        </View>
      )}

      {/* 提醒设置 */}
      <View className='schedule-detail__section'>
        <View className='schedule-detail__info-item'>
          <View className='schedule-detail__info-label'>
            <Text className='icon'>🔔</Text>
            <Text>提醒</Text>
          </View>
          <Text className='schedule-detail__info-value'>
            {schedule.reminder ? '已开启' : '未开启'}
          </Text>
        </View>

        {/* 元数据 */}
        <View className='schedule-detail__meta'>
          <View className='schedule-detail__meta-item'>
            创建时间：{formatDateTime(schedule.createdAt)}
          </View>
          <View className='schedule-detail__meta-item'>
            更新时间：{formatDateTime(schedule.updatedAt)}
          </View>
        </View>
      </View>

      {/* 操作按钮 */}
      <View className='schedule-detail__actions' style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <Button
          className={`schedule-detail__action-btn ${schedule.status === ScheduleStatus.COMPLETED ? 'schedule-detail__action-btn--secondary' : 'schedule-detail__action-btn--success'}`}
          onClick={handleToggleStatus}
        >
          {schedule.status === ScheduleStatus.COMPLETED ? '标记待办' : '✓ 完成'}
        </Button>
        <Button
          className='schedule-detail__action-btn schedule-detail__action-btn--primary'
          onClick={handleEdit}
        >
          编辑
        </Button>
        <Button
          className='schedule-detail__action-btn schedule-detail__action-btn--danger'
          onClick={handleDelete}
        >
          删除
        </Button>
      </View>
    </View>
  )
}

export default connect(
  (state: any) => ({
    schedules: state.schedule.schedules
  }),
  (dispatch) => ({
    deleteSchedule(id: string) {
      dispatch(deleteSchedule(id))
    },
    toggleScheduleStatus(id: string) {
      dispatch(toggleScheduleStatus(id))
    }
  })
)(ScheduleDetail)
