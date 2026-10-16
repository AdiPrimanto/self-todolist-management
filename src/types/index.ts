export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role?: string;
}

export interface Subtask {
  id: string;
  todo_id: string;
  title: string;
  is_completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string;
  user_id?: string;
  is_default?: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  due_date?: string; // YYYY-MM-DDTHH:mm format
  priority: Priority;
  status: TaskStatus;
  progress_percent: number; // 0 - 100
  category_id: string;
  created_by: string; // user id
  assigned_to?: string; // user id
  is_shared: boolean;
  is_recurring?: RecurringType;
  subtasks: Subtask[];
  created_at: string;
  updated_at: string;
}

export type FilterScope = 'all' | 'personal' | 'shared' | 'today' | 'overdue' | 'completed';

export type ViewMode = 'list' | 'kanban';
