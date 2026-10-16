import React, { useEffect } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import type { Todo, Category, UserProfile } from '../types';
import { TodoCard } from './TodoCard';
import { animateCardsIn } from '../utils/animations';

interface TodoListProps {
  todos: Todo[];
  categories: Category[];
  users: UserProfile[];
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onOpenAddTodo: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  categories,
  users,
  onToggleStatus,
  onToggleSubtask,
  onEdit,
  onDelete,
  onOpenAddTodo
}) => {
  useEffect(() => {
    animateCardsIn('.todo-card-item');
  }, [todos]);

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <ClipboardList size={32} />
        </div>
        <h3 className="empty-state-title">Tidak Ada Tugas yang Ditemukan</h3>
        <p className="empty-state-desc">
          Tidak ada tugas yang cocok dengan filter atau pencarian saat ini. Buat tugas baru untuk mulai mencatat.
        </p>
        <button type="button" className="btn btn-primary" onClick={onOpenAddTodo}>
          <Plus size={16} />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>
    );
  }

  return (
    <div className="todo-list-grid">
      {todos.map(todo => (
        <TodoCard
          key={todo.id}
          todo={todo}
          categories={categories}
          users={users}
          onToggleStatus={onToggleStatus}
          onToggleSubtask={onToggleSubtask}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
