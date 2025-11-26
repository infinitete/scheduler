import Taro from '@tarojs/taro'
import { Schedule } from '@/types/schedule'

const STORAGE_KEY = 'schedules'

/**
 * 从本地存储加载日程数据
 */
export const loadSchedulesFromStorage = async (): Promise<Schedule[]> => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('加载日程数据失败:', error)
    return []
  }
}

/**
 * 保存日程数据到本地存储
 */
export const saveSchedulesToStorage = async (schedules: Schedule[]): Promise<void> => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(schedules))
  } catch (error) {
    console.error('保存日程数据失败:', error)
  }
}

/**
 * 清空本地存储的日程数据
 */
export const clearSchedulesStorage = async (): Promise<void> => {
  try {
    Taro.removeStorageSync(STORAGE_KEY)
  } catch (error) {
    console.error('清空日程数据失败:', error)
  }
}

/**
 * 保存测试数据到本地存储
 */
export const saveTestDataToStorage = async (testData: Schedule[]): Promise<void> => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(testData))
  } catch (error) {
    console.error('保存测试数据失败:', error)
  }
}