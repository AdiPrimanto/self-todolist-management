import type { Todo, Category, UserProfile } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-1',
    email: 'adi@example.com',
    name: 'Adiprimanto',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'Owner'
  },
  {
    id: 'user-2',
    email: 'partner@example.com',
    name: 'Partner / Teammate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'Collaborator'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Pribadi', icon: 'User', color: '#0d9488', is_default: true },
  { id: 'cat-2', name: 'Kerja & Project', icon: 'Briefcase', color: '#0f766e', is_default: true },
  { id: 'cat-3', name: 'Belanja & Kebutuhan', icon: 'ShoppingCart', color: '#059669', is_default: true },
  { id: 'cat-4', name: 'Ibadah & Doa', icon: 'Sparkles', color: '#14b8a6', is_default: true },
  { id: 'cat-5', name: 'Rumah Tangga', icon: 'Home', color: '#0284c7', is_default: true },
  { id: 'cat-6', name: 'Kesehatan & Habit', icon: 'Heart', color: '#e11d48', is_default: true }
];

// Helper untuk format tanggal ISO lokal
const getOffsetDateString = (offsetDays: number, hours: number, minutes: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const INITIAL_TODOS: Todo[] = [
  {
    id: 'todo-1',
    title: 'Bayar Tagihan Internet & Listrik Bulanan',
    description: 'Cek nomor tagihan di aplikasi PLN dan Indihome, jangan sampai kena denda lewat tanggal 15.',
    due_date: getOffsetDateString(-1, 20, 0), // Overdue kemarin jam 20:00!
    priority: 'urgent',
    status: 'todo',
    progress_percent: 0,
    category_id: 'cat-5',
    created_by: 'user-1',
    assigned_to: 'user-2',
    is_shared: true,
    is_recurring: 'monthly',
    subtasks: [
      { id: 'st-1', todo_id: 'todo-1', title: 'Cek tagihan Indihome via mobile banking', is_completed: false },
      { id: 'st-2', todo_id: 'todo-1', title: 'Top-up token listrik rumah', is_completed: false }
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'todo-2',
    title: 'Review Fitur & Deploy Supabase Todo App',
    description: 'Pastikan skema database berjalan normal, styling tosca minimalis rapi, dan animasi GSAP lancar.',
    due_date: getOffsetDateString(0, 19, 30), // Hari ini jam 19:30
    priority: 'high',
    status: 'in_progress',
    progress_percent: 66,
    category_id: 'cat-2',
    created_by: 'user-1',
    assigned_to: 'user-1',
    is_shared: false,
    is_recurring: 'none',
    subtasks: [
      { id: 'st-3', todo_id: 'todo-2', title: 'Setup database tables & RLS policies', is_completed: true },
      { id: 'st-4', todo_id: 'todo-2', title: 'Implementasi UI komponen tosca minimalis', is_completed: true },
      { id: 'st-5', todo_id: 'todo-2', title: 'Testing sharing antar user & pengingat', is_completed: false }
    ],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'todo-3',
    title: 'Belanja Mingguan Sayur & Buah Segar',
    description: 'Beli stok mingguan di supermarket atau pasar segar. Masukkan daftar belanja ke subtask.',
    due_date: getOffsetDateString(1, 9, 0), // Besok jam 09:00 pagi
    priority: 'medium',
    status: 'todo',
    progress_percent: 25,
    category_id: 'cat-3',
    created_by: 'user-2',
    assigned_to: 'user-1',
    is_shared: true,
    is_recurring: 'weekly',
    subtasks: [
      { id: 'st-6', todo_id: 'todo-3', title: 'Alpukat & Apel Fuji 1kg', is_completed: true },
      { id: 'st-7', todo_id: 'todo-3', title: 'Bayam & Brokoli hidroponik', is_completed: false },
      { id: 'st-8', todo_id: 'todo-3', title: 'Dada ayam fillet 1kg', is_completed: false },
      { id: 'st-9', todo_id: 'todo-3', title: 'Minyak kelapa & bumbu dapur', is_completed: false }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'todo-4',
    title: 'Membaca Doa Pembuka Rezeki & Dzikir Pagi',
    description: 'Amalan rutin pagi hari setelah subuh untuk kelancaran rezeki dan ketenangan berkah.',
    due_date: getOffsetDateString(0, 6, 30),
    priority: 'low',
    status: 'completed',
    progress_percent: 100,
    category_id: 'cat-4',
    created_by: 'user-1',
    is_shared: false,
    is_recurring: 'daily',
    subtasks: [
      { id: 'st-10', todo_id: 'todo-4', title: 'Dzikir pagi Al-Ma’tsurat', is_completed: true },
      { id: 'st-11', todo_id: 'todo-4', title: 'Doa pembuka rezeki & sedekah subuh', is_completed: true }
    ],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  }
];

class DataService {
  private todosKey = 'zentask_todos_v1';
  private categoriesKey = 'zentask_categories_v1';
  private currentUserKey = 'zentask_current_user_v1';

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    // Migrasi data jika sebelumnya tersimpan dengan key toscatask
    if (!localStorage.getItem(this.todosKey)) {
      const oldTodos = localStorage.getItem('toscatask_todos_v1');
      localStorage.setItem(this.todosKey, oldTodos || JSON.stringify(INITIAL_TODOS));
    }
    if (!localStorage.getItem(this.categoriesKey)) {
      const oldCats = localStorage.getItem('toscatask_categories_v1');
      localStorage.setItem(this.categoriesKey, oldCats || JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(this.currentUserKey)) {
      const oldUser = localStorage.getItem('toscatask_current_user_v1');
      localStorage.setItem(this.currentUserKey, oldUser || JSON.stringify(DEMO_USERS[0]));
    }
  }

  getCurrentUser(): UserProfile {
    try {
      const data = localStorage.getItem(this.currentUserKey);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return DEMO_USERS[0];
  }

  setCurrentUser(user: UserProfile) {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  getAvailableUsers(): UserProfile[] {
    return DEMO_USERS;
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

  private generateId(prefix = 'id'): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

          if (!error && data) return data as Todo[];
        } catch (e) {
          console.warn('Supabase fetch todos failed, fallback to local', e);
        }
      }
    }

    const data = localStorage.getItem(this.todosKey);
    return data ? JSON.parse(data) : INITIAL_TODOS;
  }

  async saveTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Todo> {
    const isEdit = Boolean(todo.id);
    const id = todo.id || this.generateId('todo');
    const now = new Date().toISOString();

    const fullTodo: Todo = {
      ...todo,
      id,
      subtasks: todo.subtasks || [],
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          if (isEdit) {
            const { subtasks: _, ...todoData } = fullTodo;
            await supabase.from('todos').update(todoData).eq('id', id);
          } else {
            const { subtasks: _, ...todoData } = fullTodo;
            await supabase.from('todos').insert(todoData);
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
    const updatedSubtasks = target.subtasks.map(st => ({
      ...st,
      is_completed: !isCompleted
    }));

    const updatedTodo: Todo = {
      ...target,
      status: newStatus,
      progress_percent: newProgress,
      subtasks: updatedSubtasks,
      updated_at: new Date().toISOString()
    };

    await this.saveTodo(updatedTodo);
    return updatedTodo;
  }

  async toggleSubtask(todoId: string, subtaskId: string): Promise<Todo | undefined> {
    const todos = await this.getTodos();
    const target = todos.find(t => t.id === todoId);
    if (!target) return undefined;

    const updatedSubtasks = target.subtasks.map(st =>
      st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
    );

    // Hitung progress otomatis berdasarkan subtask
    const total = updatedSubtasks.length;
    const completedCount = updatedSubtasks.filter(st => st.is_completed).length;
    const progress = total > 0 ? Math.round((completedCount / total) * 100) : target.progress_percent;
    const newStatus = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'todo';

    const updatedTodo: Todo = {
      ...target,
      subtasks: updatedSubtasks,
      progress_percent: progress,
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    await this.saveTodo(updatedTodo);
    return updatedTodo;
  }

  resetToDefaultData() {
    localStorage.setItem(this.todosKey, JSON.stringify(INITIAL_TODOS));
    localStorage.setItem(this.categoriesKey, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(this.currentUserKey, JSON.stringify(DEMO_USERS[0]));
  }
}

export const dataService = new DataService();
