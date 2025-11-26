import { 
  ADD_SCHEDULE, 
  UPDATE_SCHEDULE, 
  DELETE_SCHEDULE, 
  LOAD_SCHEDULES, 
  SET_FILTER,
  SET_PRIORITY_FILTER,
  SET_DATE_FILTER,
  SET_TITLE_FILTER,
  SET_STATUS_FILTER,  // 添加状态筛选
  CLEAR_FILTERS,
  TOGGLE_SCHEDULE_STATUS
} from '../constants/schedule'
import { Schedule, ScheduleStatus, Priority } from '@/types/schedule'

export interface ScheduleFilter {
  title?: string
  priority?: Priority
  status?: ScheduleStatus
  date?: string
}

export interface ScheduleState {
  schedules: Schedule[]
  filter: ScheduleFilter
  priorityFilter: Priority | null
  dateFilter: string | null
  titleFilter: string | null
  statusFilter: ScheduleStatus | null  // 添加状态筛选状态
}

const INITIAL_STATE: ScheduleState = {
  schedules: [],
  filter: {},
  priorityFilter: null,
  dateFilter: null,
  titleFilter: null,
  statusFilter: null  // 初始化状态筛选状态
}

export default function scheduleReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD_SCHEDULE:
      return {
        ...state,
        schedules: [...state.schedules, action.payload]
      }

    case UPDATE_SCHEDULE:
      return {
        ...state,
        schedules: state.schedules.map(schedule =>
          schedule.id === action.payload.id
            ? { ...schedule, ...action.payload.schedule, updatedAt: new Date().toISOString() }
            : schedule
        )
      }

    case DELETE_SCHEDULE:
      return {
        ...state,
        schedules: state.schedules.filter(schedule => schedule.id !== action.payload)
      }

    case LOAD_SCHEDULES:
      return {
        ...state,
        schedules: action.payload
      }

    case SET_FILTER:
      return {
        ...state,
        filter: action.payload
      }
      
    case SET_PRIORITY_FILTER:
      return {
        ...state,
        priorityFilter: action.payload
      }
      
    case SET_DATE_FILTER:
      return {
        ...state,
        dateFilter: action.payload
      }
      
    case SET_TITLE_FILTER:
      return {
        ...state,
        titleFilter: action.payload
      }
      
    case SET_STATUS_FILTER:  // 添加状态筛选处理
      return {
        ...state,
        statusFilter: action.payload
      }
      
    case CLEAR_FILTERS:
      return {
        ...state,
        priorityFilter: null,
        dateFilter: null,
        titleFilter: null,
        statusFilter: null  // 清除状态筛选
      }

    case TOGGLE_SCHEDULE_STATUS:
      return {
        ...state,
        schedules: state.schedules.map(schedule =>
          schedule.id === action.payload
            ? {
                ...schedule,
                status: schedule.status === ScheduleStatus.COMPLETED
                  ? ScheduleStatus.PENDING
                  : ScheduleStatus.COMPLETED,
                updatedAt: new Date().toISOString()
              }
            : schedule
        )
      }

    default:
      return state
  }
}