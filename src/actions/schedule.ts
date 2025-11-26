import Taro from '@tarojs/taro'
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
import { Schedule, Priority, ScheduleStatus } from '@/types/schedule'

// 加载日程
export const loadSchedules = (schedules: Schedule[]) => {
  return {
    type: LOAD_SCHEDULES,
    payload: schedules
  }
}

// 添加日程
export const addSchedule = (schedule: Schedule) => {
  return {
    type: ADD_SCHEDULE,
    payload: schedule
  }
}

// 更新日程
export const updateSchedule = (id: string, schedule: Partial<Schedule>) => {
  return {
    type: UPDATE_SCHEDULE,
    payload: {
      id,
      schedule
    }
  }
}

// 删除日程
export const deleteSchedule = (id: string) => {
  return {
    type: DELETE_SCHEDULE,
    payload: id
  }
}

// 设置筛选条件
export const setFilter = (filter) => {
  return {
    type: SET_FILTER,
    payload: filter
  }
}

// 设置优先级筛选
export const setPriorityFilter = (priority: Priority | null) => {
  return {
    type: SET_PRIORITY_FILTER,
    payload: priority
  }
}

// 设置日期筛选
export const setDateFilter = (date: string | null) => {
  return {
    type: SET_DATE_FILTER,
    payload: date
  }
}

// 设置标题筛选
export const setTitleFilter = (title: string | null) => {
  return {
    type: SET_TITLE_FILTER,
    payload: title
  }
}

// 设置状态筛选  // 添加状态筛选 action
export const setStatusFilter = (status: ScheduleStatus | null) => {
  return {
    type: SET_STATUS_FILTER,
    payload: status
  }
}

// 清除所有筛选
export const clearFilters = () => {
  return {
    type: CLEAR_FILTERS
  }
}

// 切换日程状态
export const toggleScheduleStatus = (id: string) => {
  return {
    type: TOGGLE_SCHEDULE_STATUS,
    payload: id
  }
}