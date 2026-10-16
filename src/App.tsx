import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ReminderBanner } from './components/ReminderBanner';
import { TodoStats } from './components/TodoStats';
import { TodoFilters } from './components/TodoFilters';
import { TodoList } from './components/TodoList';
import { KanbanBoard } from './components/KanbanBoard';
import { TodoModal } from './components/TodoModal';
import { CategoryModal } from './components/CategoryModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AuthScreen } from './components/AuthScreen';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { isSupabaseConfigured } from './lib/supabase';
import { soundManager } from './utils/audio';
import { fireToscaConfetti } from './utils/animations';
import type { Todo, Category, UserProfile, FilterScope, ViewMode, TaskStatus } from './types';
import './App.css';

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(() => authService.getRegisteredUsers());

  // Filter & View States
  const [activeScope, setActiveScope] = useState<FilterScope>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Theme & Sound States
  const [isDark, setIsDark] = useState(() => {
    return (localStorage.getItem('zentask_theme') || localStorage.getItem('toscatask_theme')) === 'dark';
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundManager.isSoundEnabled());
  const [isSupabaseLive, setIsSupabaseLive] = useState(isSupabaseConfigured());

  // Modals
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Sync theme to root html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('zentask_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Shortcut rahasia untuk membuka modal konfigurasi Supabase jika dibutuhkan admin (?setup=db atau Ctrl/Cmd+Shift+D)
  useEffect(() => {
    if (window.location.search.includes('setup=db') || window.location.search.includes('config=db')) {
      setIsConfigModalOpen(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsConfigModalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadData = useCallback(async () => {
    const loadedTodos = await dataService.getTodos();
    const loadedCategories = await dataService.getCategories();
    setTodos(loadedTodos);
    setCategories(loadedCategories);
    setAvailableUsers(authService.getRegisteredUsers());
    setIsSupabaseLive(isSupabaseConfigured());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleToggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handleToggleSound = () => {
    const newState = soundManager.toggleSound();
    setIsSoundEnabled(newState);
  };

  const handleSwitchUser = (user: UserProfile) => {
    const switched = authService.switchDemoUser(user.id);
    if (switched) {
      setCurrentUser(switched);
      dataService.setCurrentUser(switched);
    } else {
      setCurrentUser(user);
      dataService.setCurrentUser(user);
    }
    soundManager.playPop();
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    soundManager.playPop();
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await dataService.toggleTodoStatus(id);
    if (updated) {
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
    }
  };

  const handleToggleSubtask = async (todoId: string, subtaskId: string) => {
    const updated = await dataService.toggleSubtask(todoId, subtaskId);
    if (updated) {
      setTodos(prev => prev.map(t => (t.id === todoId ? updated : t)));
    }
  };

  const handleSaveTodo = async (todoData: Omit<Todo, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    await dataService.saveTodo(todoData);
    await loadData();
    soundManager.playSuccess();
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus tugas ini?')) {
      await dataService.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      soundManager.playPop();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: TaskStatus) => {
    const target = todos.find(t => t.id === id);
    if (!target) return;

    const isCompleted = newStatus === 'completed';
    const progress = isCompleted ? 100 : newStatus === 'todo' ? 0 : Math.max(target.progress_percent, 25);
    const updatedSubtasks = isCompleted
      ? target.subtasks.map(st => ({ ...st, is_completed: true }))
      : newStatus === 'todo'
      ? target.subtasks.map(st => ({ ...st, is_completed: false }))
      : target.subtasks;

    const updated = await dataService.saveTodo({
      ...target,
      status: newStatus,
      progress_percent: progress,
      subtasks: updatedSubtasks
    });
    setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
    if (isCompleted) {
      soundManager.playSuccess();
      fireToscaConfetti();
    } else {
      soundManager.playPop();
    }
  };

  const handleSaveCategory = async (catData: Omit<Category, 'id'>) => {
    const newCat = await dataService.createCategory(catData);
    setCategories(prev => [...prev, newCat]);
    soundManager.playSuccess();
  };

  // Filter logic
  const filteredTodos = useMemo(() => {
    const now = new Date();

    return todos.filter(todo => {
      if (!currentUser) return false;

      // 1. User access permission (Personal belongs to user, or it's shared)
      const isVisible =
        todo.is_shared ||
        todo.created_by === currentUser.id ||
        todo.assigned_to === currentUser.id;

      if (!isVisible) return false;

      // 2. Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = todo.title.toLowerCase().includes(query);
        const descMatch = todo.description?.toLowerCase().includes(query) || false;
        const subtasksMatch = todo.subtasks?.some(s => s.title.toLowerCase().includes(query)) || false;
        if (!titleMatch && !descMatch && !subtasksMatch) return false;
      }

      // 3. Category Filter
      if (activeCategoryId && todo.category_id !== activeCategoryId) {
        return false;
      }

      // 4. Scope Filter
      if (activeScope === 'personal') {
        return !todo.is_shared && todo.created_by === currentUser.id;
      }
      if (activeScope === 'shared') {
        return todo.is_shared;
      }
      if (activeScope === 'completed') {
        return todo.status === 'completed';
      }
      if (activeScope === 'overdue') {
        if (!todo.due_date || todo.status === 'completed') return false;
        return new Date(todo.due_date).getTime() < now.getTime();
      }
      if (activeScope === 'today') {
        if (!todo.due_date) return false;
        const due = new Date(todo.due_date);
        return (
          due.getDate() === now.getDate() &&
          due.getMonth() === now.getMonth() &&
          due.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [todos, currentUser, searchQuery, activeCategoryId, activeScope]);

  if (!currentUser) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AuthScreen
          onLoginSuccess={user => {
            setCurrentUser(user);
            dataService.setCurrentUser(user);
            setAvailableUsers(authService.getRegisteredUsers());
          }}
          isSupabaseLive={isSupabaseLive}
        />
        <SupabaseConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onConfigSaved={loadData}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        availableUsers={availableUsers}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
        onOpenAddTodo={() => {
          setEditingTodo(null);
          setIsTodoModalOpen(true);
        }}
      />

      {/* Main Menu Reminder for pending / overdue tasks */}
      <ReminderBanner
        todos={todos.filter(t => t.is_shared || t.created_by === currentUser.id || t.assigned_to === currentUser.id)}
        onFilterDue={dueType => setActiveScope(dueType)}
      />

      {/* Productivity Stats Grid */}
      <TodoStats
        todos={todos.filter(t => t.is_shared || t.created_by === currentUser.id || t.assigned_to === currentUser.id)}
      />

      {/* Search, Filter Scope Tabs, and Category Bar */}
      <TodoFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeScope={activeScope}
        onScopeChange={setActiveScope}
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddCategory={() => setIsCategoryModalOpen(true)}
      />

      {/* Content: List View or Kanban Board */}
      <main id="main-content">
        {viewMode === 'list' ? (
          <TodoList
            todos={filteredTodos}
            categories={categories}
            users={availableUsers}
            onToggleStatus={handleToggleStatus}
            onToggleSubtask={handleToggleSubtask}
            onEdit={todo => {
              setEditingTodo(todo);
              setIsTodoModalOpen(true);
            }}
            onDelete={handleDeleteTodo}
            onOpenAddTodo={() => {
              setEditingTodo(null);
              setIsTodoModalOpen(true);
            }}
          />
        ) : (
          <KanbanBoard
            todos={filteredTodos}
            categories={categories}
            users={availableUsers}
            onToggleStatus={handleToggleStatus}
            onToggleSubtask={handleToggleSubtask}
            onEdit={todo => {
              setEditingTodo(todo);
              setIsTodoModalOpen(true);
            }}
            onDelete={handleDeleteTodo}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>

      {/* Modals */}
      <TodoModal
        isOpen={isTodoModalOpen}
        onClose={() => {
          setIsTodoModalOpen(false);
          setEditingTodo(null);
        }}
        onSave={handleSaveTodo}
        initialTodo={editingTodo}
        categories={categories}
        users={availableUsers}
        currentUser={currentUser}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />

      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigSaved={loadData}
      />
    </div>
  );
}

export default App;
