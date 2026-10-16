import React from 'react';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import type { Todo, Category, UserProfile, TaskStatus } from '../types';
import { TodoCard } from './TodoCard';

interface KanbanBoardProps {
  todos: Todo[];
  categories: Category[];
  users: UserProfile[];
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  todos,
  categories,
  users,
  onToggleStatus,
  onToggleSubtask,
  onEdit,
  onDelete,
  onUpdateStatus
}) => {
  const [activeCol, setActiveCol] = React.useState<TaskStatus | 'all'>('all');

  const columns: { id: TaskStatus; title: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'todo',
      title: 'Belum Dimulai',
      icon: <Circle size={16} color="var(--tosca-600)" />,
      color: 'var(--tosca-600)'
    },
    {
      id: 'in_progress',
      title: 'Sedang Berjalan',
      icon: <Clock size={16} color="#0f766e" />,
      color: '#0f766e'
    },
    {
      id: 'completed',
      title: 'Selesai',
      icon: <CheckCircle2 size={16} color="#10b981" />,
      color: '#10b981'
    }
  ];

  const displayedColumns = activeCol === 'all' ? columns : columns.filter(c => c.id === activeCol);

  return (
    <div className="kanban-wrapper">
      {/* Mobile Kanban Tab Switcher */}
      <div className="kanban-mobile-tabs">
        <button
          type="button"
          className={`kanban-tab-btn ${activeCol === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCol('all')}
        >
          Semua ({todos.length})
        </button>
        {columns.map(col => {
          const count = todos.filter(t => t.status === col.id).length;
          return (
            <button
              key={col.id}
              type="button"
              className={`kanban-tab-btn ${activeCol === col.id ? 'active' : ''}`}
              onClick={() => setActiveCol(col.id)}
            >
              <span>{col.title}</span>
              <span className="kanban-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="kanban-board">
        {displayedColumns.map(col => {
          const colTodos = todos.filter(t => t.status === col.id);

          return (
            <div key={col.id} className="kanban-column" id={`kanban-col-${col.id}`}>
              <div className="kanban-col-header">
                <div className="kanban-col-title">
                  {col.icon}
                  <span>{col.title}</span>
                </div>
                <span className="kanban-count-badge">{colTodos.length}</span>
              </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {colTodos.length === 0 ? (
                <div
                  style={{
                    padding: '30px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.84rem',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  Tidak ada tugas di sini
                </div>
              ) : (
                colTodos.map(todo => (
                  <div key={todo.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <TodoCard
                      todo={todo}
                      categories={categories}
                      users={users}
                      onToggleStatus={onToggleStatus}
                      onToggleSubtask={onToggleSubtask}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />

                    {/* Quick Move Status Chips */}
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', padding: '0 4px' }}>
                      {col.id !== 'todo' && (
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                          onClick={() => onUpdateStatus(todo.id, 'todo')}
                        >
                          ← Ke To Do
                        </button>
                      )}
                      {col.id !== 'in_progress' && (
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                          onClick={() => onUpdateStatus(todo.id, 'in_progress')}
                        >
                          {col.id === 'todo' ? 'Mulai →' : '← Sedang Berjalan'}
                        </button>
                      )}
                      {col.id !== 'completed' && (
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ fontSize: '0.72rem', padding: '2px 6px', color: '#10b981' }}
                          onClick={() => onUpdateStatus(todo.id, 'completed')}
                        >
                          Selesai ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
