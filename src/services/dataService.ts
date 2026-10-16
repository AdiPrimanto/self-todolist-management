import type { Todo, Category, UserProfile, Subtask } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';
import { isValidUUID, generateUUID } from '../utils/uuid';

export const DEMO_USERS: UserProfile[] = [];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Pribadi', icon: 'User', color: '#0d9488', is_default: true },
  { id: 'cat-2', name: 'Kerja & Project', icon: 'Briefcase', color: '#0f766e', is_default: true },
  { id: 'cat-3', name: 'Belanja & Kebutuhan', icon: 'ShoppingCart', color: '#059669', is_default: true },
  { id: 'cat-4', name: 'Ibadah & Doa', icon: 'Sparkles', color: '#14b8a6', is_default: true },
  { id: 'cat-5', name: 'Rumah Tangga', icon: 'Home', color: '#0284c7', is_default: true },
  { id: 'cat-6', name: 'Kesehatan & Habit', icon: 'Heart', color: '#e11d48', is_default: true }
];

export const INITIAL_TODOS: Todo[] = [];


class DataService {
  private todosKey = 'zentask_todos_v1';
  private categoriesKey = 'zentask_categories_v1';
  private currentUserKey = 'zentask_current_user_v1';

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    // Bersihkan data dummy lama jika ada
    try {
      localStorage.removeItem('toscatask_todos_v1');
      localStorage.removeItem('toscatask_categories_v1');
      localStorage.removeItem('toscatask_current_user_v1');
    } catch {
      // ignore
    }

    if (!localStorage.getItem(this.todosKey)) {
      localStorage.setItem(this.todosKey, JSON.stringify(INITIAL_TODOS));
    }
    if (!localStorage.getItem(this.categoriesKey)) {
      localStorage.setItem(this.categoriesKey, JSON.stringify(INITIAL_CATEGORIES));
    }
  }

  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(this.currentUserKey);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return null;
  }

  setCurrentUser(user: UserProfile) {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  async getUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('name');

          if (!error && data && data.length > 0) {
            return data.map(p => ({
              id: p.id,
              email: p.email,
              name: p.name || p.email.split('@')[0],
              avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.email}`,
              role: p.role || 'Member'
            }));
          }
        } catch (e) {
          console.warn('Gagal fetch profiles dari Supabase:', e);
        }
      }
    }
    return authService.getRegisteredUsers();
  }

  getAvailableUsers(): UserProfile[] {
    return authService.getRegisteredUsers();
  }

  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.from('categories').select('*').order('name');
          if (!error && data && data.length > 0) return data as Category[];
        } catch (e) {
          console.warn('Supabase fetch categories failed, fallback to local', e);
        }
      }
    }
    const data = localStorage.getItem(this.categoriesKey);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  }

  private generateId(_prefix = 'id'): string {
    return generateUUID();
  }

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...cat,
      id: this.generateId('cat')
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.from('categories').insert(cat).select().single();
          if (!error && data) return data as Category;
        } catch (e) {
          console.warn('Supabase category insert failed, fallback to local', e);
        }
      }
    }

    const categories = await this.getCategories();
    categories.push(newCategory);
    localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
    return newCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('categories').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase category delete failed', e);
        }
      }
    }
    const categories = (await this.getCategories()).filter(c => c.id !== id);
    localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
  }

  async getTodos(): Promise<Todo[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('todos')
            .select(`
              *,
              subtasks (*)
            `)
            .order('created_at', { ascending: false });

          if (!error && data) {
            return (data as any[]).map(todo => ({
              ...todo,
              subtasks: (todo.subtasks || []).sort(
                (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
              )
            })) as Todo[];
          }
        } catch (e) {
          console.warn('Supabase fetch todos failed, fallback to local', e);
        }
      }
    }

    const data = localStorage.getItem(this.todosKey);
    return data ? JSON.parse(data) : INITIAL_TODOS;
  }

  async saveTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Todo> {
    const isEdit = Boolean(todo.id && isValidUUID(todo.id));
    const id = (todo.id && isValidUUID(todo.id)) ? todo.id : generateUUID();
    const now = new Date().toISOString();

    // Sanitize subtasks to have valid UUID and matching todo_id
    const sanitizedSubtasks: Subtask[] = (todo.subtasks || []).map(st => ({
      ...st,
      id: isValidUUID(st.id) ? st.id : generateUUID(),
      todo_id: id
    }));

    const fullTodo: Todo = {
      ...todo,
      id,
      subtasks: sanitizedSubtasks,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { subtasks: _, ...todoData } = fullTodo;

          if (isEdit) {
            await supabase.from('todos').update(todoData).eq('id', id);
          } else {
            await supabase.from('todos').insert(todoData);
          }

          // Sinkronisasi tabel subtasks di Supabase
          // 1. Hapus subtask sebelumnya untuk todo ini agar konsisten
          await supabase.from('subtasks').delete().eq('todo_id', id);

          // 2. Insert subtask baru jika ada
          if (sanitizedSubtasks.length > 0) {
            const subtaskRows = sanitizedSubtasks.map((st, idx) => ({
              id: st.id,
              todo_id: id,
              title: st.title,
              is_completed: Boolean(st.is_completed),
              sort_order: idx
            }));
            const { error: subtaskError } = await supabase.from('subtasks').insert(subtaskRows);
            if (subtaskError) {
              console.warn('Supabase subtasks insert error:', subtaskError);
            }
          }
        } catch (e) {
          console.warn('Supabase save todo failed, syncing local', e);
        }
      }
    }

    const todos = await this.getTodos();
    let updatedList: Todo[];
    const exists = todos.some(t => t.id === id);
    if (isEdit && exists) {
      updatedList = todos.map(t => (t.id === id ? { ...t, ...fullTodo, updated_at: now } : t));
    } else {
      updatedList = [fullTodo, ...todos];
    }

    localStorage.setItem(this.todosKey, JSON.stringify(updatedList));
    return fullTodo;
  }

  async deleteTodo(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('todos').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase delete todo failed', e);
        }
      }
    }

    const todos = (await this.getTodos()).filter(t => t.id !== id);
    localStorage.setItem(this.todosKey, JSON.stringify(todos));
  }

  async toggleTodoStatus(id: string): Promise<Todo | undefined> {
    const todos = await this.getTodos();
    const target = todos.find(t => t.id === id);
    if (!target) return undefined;

    const isCompleted = target.status === 'completed';
    const newStatus = isCompleted ? 'todo' : 'completed';
    const newProgress = isCompleted ? 0 : 100;

    // toggle all subtasks as well
    const updatedSubtasks = (target.subtasks || []).map(st => ({
      ...st,
      is_completed: !isCompleted
    }));

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase
            .from('todos')
            .update({
              status: newStatus,
              progress_percent: newProgress,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (updatedSubtasks.length > 0) {
            await supabase
              .from('subtasks')
              .update({ is_completed: !isCompleted })
              .eq('todo_id', id);
          }
        } catch (e) {
          console.warn('Supabase toggle todo status failed:', e);
        }
      }
    }

    const updatedTodo: Todo = {
      ...target,
      status: newStatus,
      progress_percent: newProgress,
      subtasks: updatedSubtasks,
      updated_at: new Date().toISOString()
    };

    const updatedList = todos.map(t => (t.id === id ? updatedTodo : t));
    localStorage.setItem(this.todosKey, JSON.stringify(updatedList));
    return updatedTodo;
  }

  async toggleSubtask(todoId: string, subtaskId: string): Promise<Todo | undefined> {
    const todos = await this.getTodos();
    const target = todos.find(t => t.id === todoId);
    if (!target) return undefined;

    const targetSubtask = target.subtasks?.find(st => st.id === subtaskId);
    const newIsCompleted = targetSubtask ? !targetSubtask.is_completed : false;

    const updatedSubtasks = (target.subtasks || []).map(st =>
      st.id === subtaskId ? { ...st, is_completed: newIsCompleted } : st
    );

    // Hitung progress otomatis berdasarkan subtask
    const total = updatedSubtasks.length;
    const completedCount = updatedSubtasks.filter(st => st.is_completed).length;
    const progress = total > 0 ? Math.round((completedCount / total) * 100) : target.progress_percent;
    const newStatus = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'todo';

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase
            .from('subtasks')
            .update({ is_completed: newIsCompleted })
            .eq('id', subtaskId);

          await supabase
            .from('todos')
            .update({
              progress_percent: progress,
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', todoId);
        } catch (e) {
          console.warn('Supabase toggle subtask failed:', e);
        }
      }
    }

    const updatedTodo: Todo = {
      ...target,
      subtasks: updatedSubtasks,
      progress_percent: progress,
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    const updatedList = todos.map(t => (t.id === todoId ? updatedTodo : t));
    localStorage.setItem(this.todosKey, JSON.stringify(updatedList));
    return updatedTodo;
  }

  resetToDefaultData() {
    localStorage.setItem(this.todosKey, JSON.stringify(INITIAL_TODOS));
    localStorage.setItem(this.categoriesKey, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.removeItem(this.currentUserKey);
  }
}

export const dataService = new DataService();
