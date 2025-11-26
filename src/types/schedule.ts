// 日程类型定义

// 日程优先级
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// 日程状态
export enum ScheduleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 日程数据结构
export interface Schedule {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO 8601 格式
  endTime: string;   // ISO 8601 格式
  location?: string;
  priority: Priority;
  status: ScheduleStatus;
  reminder?: boolean; // 是否设置提醒
  reminderTime?: string; // 提醒时间（分钟数）
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// 日程列表过滤器
export interface ScheduleFilter {
  status?: ScheduleStatus;
  priority?: Priority;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}
