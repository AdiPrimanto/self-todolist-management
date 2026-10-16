import React, { useRef } from 'react';
import {
  Check,
  Clock,
  User,
  Users,
  Repeat,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Todo, Category, UserProfile } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { soundManager } from '../utils/audio';
import { fireToscaConfetti, animateTaskComplete } from '../utils/animations';

interface TodoCardProps {
  todo: Todo;
  categories: Category[];
  users: UserProfile[];
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  categories,
  users,
  onToggleStatus,
  onToggleSubtask,
  onEdit,
  onDelete
}) => {
  const [showSubtasks, setShowSubtasks] = React.useState(true);
  const [showMenu, setShowMenu] = React.useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!showMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showMenu]);

  const category = categories.find(c => c.id === todo.category_id);
  const assignee = users.find(u => u.id === todo.assigned_to);

  // Check due date & overdue status
  const now = new Date();
  let dueDateLabel = '';
  let isOverdue = false;
  let isDueToday = false;

  if (todo.due_date) {
    const due = new Date(todo.due_date);
    const isSameDay =
      due.getDate() === now.getDate() &&
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear();

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow =
      due.getDate() === tomorrow.getDate() &&
      due.getMonth() === tomorrow.getMonth() &&
      due.getFullYear() === tomorrow.getFullYear();

    const timeStr = due.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (isSameDay) {
      dueDateLabel = `Hari ini, ${timeStr}`;
      isDueToday = true;
      if (due.getTime() < now.getTime() && todo.status !== 'completed') {
        isOverdue = true;
      }
    } else if (isTomorrow) {
      dueDateLabel = `Besok, ${timeStr}`;
    } else {
      const dateStr = due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      dueDateLabel = `${dateStr}, ${timeStr}`;
      if (due.getTime() < now.getTime() && todo.status !== 'completed') {
        isOverdue = true;
      }
    }
  }

  const handleCheck = () => {
    if (todo.status !== 'completed') {
      soundManager.playSuccess();
      fireToscaConfetti();
      if (cardRef.current) {
        animateTaskComplete(cardRef.current);
      }
    } else {
      soundManager.playPop();
    }
    onToggleStatus(todo.id);
  };

  const handleSubtaskClick = (subtaskId: string) => {
    soundManager.playPop();
    onToggleSubtask(todo.id, subtaskId);
  };

  const subtasksCount = todo.subtasks?.length || 0;
  const completedSubtasksCount = todo.subtasks?.filter(s => s.is_completed).length || 0;

  return (
    <article
      ref={cardRef}
      className={`todo-card-item ${todo.status === 'completed' ? 'completed' : ''}`}
      id={`todo-card-${todo.id}`}
    >
      {/* Top Header */}
      <div className="todo-card-header">
        <div className="todo-card-title-row">
          <button
            type="button"
            className={`custom-checkbox-btn ${todo.status === 'completed' ? 'checked' : ''}`}
            onClick={handleCheck}
            aria-label={todo.status === 'completed' ? 'Tandai belum selesai' : 'Tandai selesai'}
          >
            {todo.status === 'completed' && <Check size={16} strokeWidth={3} />}
          </button>

          <div
            style={{ flex: 1, cursor: 'pointer' }}
            onClick={() => onEdit(todo)}
            title="Klik untuk melihat detail & mengedit tugas"
          >
            <h3 className="todo-title">{todo.title}</h3>
          </div>
        </div>

        {/* Action Menu button */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            type="button"
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Opsi Tugas"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '36px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '130px'
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '0.82rem' }}
                onClick={() => {
                  setShowMenu(false);
                  onEdit(todo);
                }}
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                className="btn btn-danger-ghost"
                style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '0.82rem' }}
                onClick={() => {
                  setShowMenu(false);
                  onDelete(todo.id);
                }}
              >
                <Trash2 size={14} />
                <span>Hapus</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description / Notes */}
      {todo.description && (
        <p
          className="todo-description"
          onClick={() => onEdit(todo)}
          style={{ cursor: 'pointer' }}
          title="Klik untuk melihat detail & mengedit tugas"
        >
          {todo.description}
        </p>
      )}

      {/* Meta Chips: Category, Date/Time, Scope, Priority, Assignee */}
      <div className="todo-meta-row">
        {category && (
          <span
            className="badge"
            style={{
              background: `rgba(20, 184, 166, 0.1)`,
              color: category.color || 'var(--tosca-700)',
              borderColor: `rgba(20, 184, 166, 0.2)`
            }}
          >
            <CategoryIcon name={category.icon} size={12} color={category.color} />
            <span>{category.name}</span>
          </span>
        )}

        {/* Due Date & Time */}
        {todo.due_date && (
          <span className={`date-chip ${isOverdue ? 'overdue' : isDueToday ? 'due-today' : ''}`}>
            <Clock size={12} />
            <span>{dueDateLabel} {isOverdue ? '(Terlambat)' : ''}</span>
          </span>
        )}

        {/* Priority Badge */}
        <span className={`badge badge-${todo.priority}`}>
          {todo.priority === 'urgent' && 'Mendesak'}
          {todo.priority === 'high' && 'Tinggi'}
          {todo.priority === 'medium' && 'Sedang'}
          {todo.priority === 'low' && 'Rendah'}
        </span>

        {/* Scope Badge (Personal vs Shared) */}
        <span className={`badge ${todo.is_shared ? 'badge-shared' : 'badge-personal'}`}>
          {todo.is_shared ? <Users size={12} /> : <User size={12} />}
          <span>{todo.is_shared ? 'Bersama' : 'Pribadi'}</span>
        </span>

        {/* Recurring badge */}
        {todo.is_recurring && todo.is_recurring !== 'none' && (
          <span className="badge badge-personal">
            <Repeat size={12} />
            <span>
              {todo.is_recurring === 'daily' && 'Harian'}
              {todo.is_recurring === 'weekly' && 'Mingguan'}
              {todo.is_recurring === 'monthly' && 'Bulanan'}
            </span>
          </span>
        )}

        {/* Assignee Avatar */}
        {todo.is_shared && assignee && (
          <span
            className="date-chip"
            title={`Ditugaskan kepada: ${assignee.name}`}
            style={{ padding: '2px 8px 2px 4px' }}
          >
            <img src={assignee.avatar} alt={assignee.name} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.75rem' }}>{assignee.name.split(' ')[0]}</span>
          </span>
        )}
      </div>

      {/* Progress Section */}
      <div className="card-progress-section">
        <div className="card-progress-header">
          <span style={{ fontWeight: 700 }}>Progress {todo.progress_percent}%</span>
          {subtasksCount > 0 ? (
            <button
              type="button"
              className="btn-ghost"
              style={{
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                fontWeight: 600,
                color: 'var(--tosca-700)',
                background: 'rgba(20, 184, 166, 0.08)',
                borderRadius: 'var(--radius-sm)'
              }}
              onClick={() => setShowSubtasks(!showSubtasks)}
            >
              <span>{completedSubtasksCount}/{subtasksCount} checklist</span>
              {showSubtasks ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          ) : (
            <button
              type="button"
              className="btn-ghost"
              style={{
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                color: 'var(--tosca-600)',
                background: 'rgba(20, 184, 166, 0.06)',
                borderRadius: 'var(--radius-sm)'
              }}
              onClick={() => onEdit(todo)}
              title="Tambah checklist langkah atau atur progress"
            >
              <span>+ Tambah Checklist</span>
            </button>
          )}
        </div>
        <div
          className="progress-track"
          style={{ cursor: 'pointer' }}
          onClick={() => onEdit(todo)}
          title="Klik untuk mengubah progress / checklist"
        >
          <div className="progress-fill" style={{ width: `${todo.progress_percent}%` }} />
        </div>
      </div>

      {/* Subtasks Accordion */}
      {subtasksCount > 0 && showSubtasks && (
        <div className="subtasks-list-box">
          {todo.subtasks.map(subtask => (
            <div
              key={subtask.id}
              className={`subtask-item ${subtask.is_completed ? 'completed' : ''}`}
            >
              <button
                type="button"
                className={`subtask-checkbox ${subtask.is_completed ? 'checked' : ''}`}
                onClick={() => handleSubtaskClick(subtask.id)}
              >
                {subtask.is_completed && <Check size={12} strokeWidth={3} />}
              </button>
              <span>{subtask.title}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
