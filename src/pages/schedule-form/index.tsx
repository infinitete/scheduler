import { FC, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Text, Input, Textarea, Picker, Switch, Button } from '@tarojs/components'
import { Schedule, Priority, ScheduleStatus } from '@/types/schedule'
import { addSchedule, updateSchedule } from '@/actions/schedule'
import './index.scss'

type PageStateProps = {
  schedules: Schedule[]
}

type PageDispatchProps = {
  addSchedule: (schedule: Schedule) => void
  updateSchedule: (id: string, schedule: Partial<Schedule>) => void
}

type IProps = PageStateProps & PageDispatchProps

const ScheduleForm: FC<IProps> = (props) => {
  const { schedules, addSchedule, updateSchedule } = props
  
  const [id, setId] = useState<string | undefined>(undefined)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [reminder, setReminder] = useState(false)
  const [initialized, setInitialized] = useState(false) // 标记是否已初始化

  useEffect(() => {
    if (initialized) return // 如果已经初始化，不再执行
    
    // 获取路由参数
    const params = Taro.getCurrentInstance().router?.params || {}
    const scheduleId = params.id
    const selectedDate = params.date // 从首页传递的日期
    
    if (scheduleId) {
      // 编辑模式，加载现有数据
      const schedule = schedules.find(s => s.id === scheduleId)
      if (schedule) {
        const startDateTime = new Date(schedule.startTime)
        const endDateTime = new Date(schedule.endTime)
        
        setId(schedule.id)
        setTitle(schedule.title)
        setDescription(schedule.description)
        setStartDate(formatDate(startDateTime))
        setStartTime(formatTime(startDateTime))
        setEndDate(formatDate(endDateTime))
        setEndTime(formatTime(endDateTime))
        setLocation(schedule.location || '')
        setPriority(schedule.priority)
        setReminder(schedule.reminder || false)
        
        Taro.setNavigationBarTitle({
          title: '编辑日程'
        })
        setInitialized(true)
      }
    } else {
      // 新增模式
      Taro.setNavigationBarTitle({
        title: '新增日程'
      })
      
      // 如果有传递日期参数，设置默认开始时间
      if (selectedDate) {
        const now = new Date()
        const selectedDateTime = new Date(selectedDate)
        
        // 设置选中日期 + 当前时间
        selectedDateTime.setHours(now.getHours())
        selectedDateTime.setMinutes(now.getMinutes())
        
        setStartDate(selectedDate)
        setStartTime(formatTime(selectedDateTime))
        
        // 默认结束时间为开始时间后1小时
        const endDateTime = new Date(selectedDateTime.getTime() + 60 * 60 * 1000)
        setEndDate(formatDate(endDateTime))
        setEndTime(formatTime(endDateTime))
      }
      setInitialized(true)
    }
  }, [schedules, initialized])

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatTime = (date: Date): string => {
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${hour}:${minute}`
  }

  const handleSubmit = () => {
    // 表单验证
    if (!title.trim()) {
      Taro.showToast({
        title: '请输入日程标题',
        icon: 'none'
      })
      return
    }

    if (!startDate || !startTime) {
      Taro.showToast({
        title: '请选择开始时间',
        icon: 'none'
      })
      return
    }

    if (!endDate || !endTime) {
      Taro.showToast({
        title: '请选择结束时间',
        icon: 'none'
      })
      return
    }

    // 合并日期和时间
    const startDateTime = new Date(`${startDate} ${startTime}`).toISOString()
    const endDateTime = new Date(`${endDate} ${endTime}`).toISOString()

    // 验证时间顺序
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      Taro.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      })
      return
    }

    if (id) {
      // 更新现有日程
      updateSchedule(id, {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        location,
        priority,
        reminder
      })
      
      Taro.showToast({
        title: '更新成功',
        icon: 'success'
      })
    } else {
      // 创建新日程
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        location,
        priority,
        status: ScheduleStatus.PENDING,
        reminder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      addSchedule(newSchedule)
      
      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      })
    }

    // 延迟返回上一页
    setTimeout(() => {
      Taro.navigateBack()
    }, 1000)
  }

  const handleCancel = () => {
    Taro.navigateBack()
  }

  // 选择地点
  const handleChooseLocation = () => {
    Taro.chooseLocation({
      success: (res) => {
        // res.name: 地点名称
        // res.address: 详细地址
        const locationName = res.name || res.address
        setLocation(locationName)
      },
      fail: (err) => {
        console.log('选择地点失败:', err)
        if (err.errMsg.includes('auth deny')) {
          Taro.showModal({
            title: '提示',
            content: '需要位置权限才能选择地点，请在设置中开启',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                Taro.openSetting()
              }
            }
          })
        }
      }
    })
  }

  return (
    <View className='schedule-form'>
      {/* 基本信息 */}
      <View className='schedule-form__section'>
        <View className='schedule-form__field'>
          <Text className='schedule-form__label schedule-form__label--required'>标题</Text>
          <Input
            className='schedule-form__input'
            placeholder='请输入日程标题'
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
        </View>

        <View className='schedule-form__field'>
          <Text className='schedule-form__label'>描述</Text>
          <Textarea
            className='schedule-form__textarea'
            placeholder='请输入日程描述'
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
          />
        </View>
      </View>

      {/* 时间设置 */}
      <View className='schedule-form__section'>
        <View className='schedule-form__field'>
          <Text className='schedule-form__label schedule-form__label--required'>开始时间</Text>
          <View style={{ display: 'flex', gap: '10px' }}>
            <Picker mode='date' value={startDate} onChange={(e) => setStartDate(e.detail.value)}>
              <View className='schedule-form__picker' style={{ flex: 1 }}>
                <Text className={startDate ? 'value' : 'placeholder'}>
                  {startDate || '选择日期'}
                </Text>
                <Text className='arrow'>▼</Text>
              </View>
            </Picker>
            <Picker mode='time' value={startTime} onChange={(e) => setStartTime(e.detail.value)}>
              <View className='schedule-form__picker' style={{ flex: 1 }}>
                <Text className={startTime ? 'value' : 'placeholder'}>
                  {startTime || '选择时间'}
                </Text>
                <Text className='arrow'>▼</Text>
              </View>
            </Picker>
          </View>
        </View>

        <View className='schedule-form__field'>
          <Text className='schedule-form__label schedule-form__label--required'>结束时间</Text>
          <View style={{ display: 'flex', gap: '10px' }}>
            <Picker mode='date' value={endDate} onChange={(e) => setEndDate(e.detail.value)}>
              <View className='schedule-form__picker' style={{ flex: 1 }}>
                <Text className={endDate ? 'value' : 'placeholder'}>
                  {endDate || '选择日期'}
                </Text>
                <Text className='arrow'>▼</Text>
              </View>
            </Picker>
            <Picker mode='time' value={endTime} onChange={(e) => setEndTime(e.detail.value)}>
              <View className='schedule-form__picker' style={{ flex: 1 }}>
                <Text className={endTime ? 'value' : 'placeholder'}>
                  {endTime || '选择时间'}
                </Text>
                <Text className='arrow'>▼</Text>
              </View>
            </Picker>
          </View>
        </View>
      </View>

      {/* 地点 */}
      <View className='schedule-form__section'>
        <View className='schedule-form__field'>
          <Text className='schedule-form__label'>地点</Text>
          <View className='schedule-form__picker' onClick={handleChooseLocation}>
            <Text className={location ? 'value' : 'placeholder'}>
              {location || '选择地点'}
            </Text>
            <Text className='icon'>📍</Text>
          </View>
        </View>
      </View>

      {/* 优先级 */}
      <View className='schedule-form__section'>
        <View className='schedule-form__field'>
          <Text className='schedule-form__label'>优先级</Text>
          <View className='schedule-form__priority-options'>
            <View
              className={`schedule-form__priority-btn schedule-form__priority-btn--low ${priority === Priority.LOW ? 'schedule-form__priority-btn--active' : ''}`}
              onClick={() => setPriority(Priority.LOW)}
            >
              低
            </View>
            <View
              className={`schedule-form__priority-btn schedule-form__priority-btn--medium ${priority === Priority.MEDIUM ? 'schedule-form__priority-btn--active' : ''}`}
              onClick={() => setPriority(Priority.MEDIUM)}
            >
              中
            </View>
            <View
              className={`schedule-form__priority-btn schedule-form__priority-btn--high ${priority === Priority.HIGH ? 'schedule-form__priority-btn--active' : ''}`}
              onClick={() => setPriority(Priority.HIGH)}
            >
              高
            </View>
          </View>
        </View>
      </View>

      {/* 提醒 */}
      <View className='schedule-form__section'>
        <View className='schedule-form__field'>
          <View className='schedule-form__switch-row'>
            <Text className='schedule-form__label'>设置提醒</Text>
            <Switch checked={reminder} onChange={(e) => setReminder(e.detail.value)} />
          </View>
        </View>
      </View>

      {/* 操作按钮 */}
      <View className='schedule-form__buttons'>
        <Button className='schedule-form__cancel-btn' onClick={handleCancel}>
          取消
        </Button>
        <Button className='schedule-form__submit-btn' onClick={handleSubmit}>
          保存
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
    addSchedule(schedule: Schedule) {
      dispatch(addSchedule(schedule))
    },
    updateSchedule(id: string, schedule: Partial<Schedule>) {
      dispatch(updateSchedule(id, schedule))
    }
  })
)(ScheduleForm)
