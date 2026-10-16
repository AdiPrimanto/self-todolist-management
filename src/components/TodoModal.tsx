import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Clock, User, Users, CheckSquare, Check } from 'lucide-react';
import type { Todo, Category, UserProfile, Priority, RecurringType, Subtask } from '../types';
import { animateModalEnter } from '../utils/animations';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todoData: Omit<Todo, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => void;
  initialTodo?: Todo | null;
  categories: Category[];
  users: UserProfile[];
  currentUser: UserProfile;
}

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTodo,
  categories,
  users,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isShared, setIsShared] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [recurring, setRecurring] = useState<RecurringType>('none');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTodo) {
        setTitle(initialTodo.title);
        setDescription(initialTodo.description || '');
        setDueDate(initialTodo.due_date || '');
        setCategoryId(initialTodo.category_id || (categories[0]?.id || ''));
        setPriority(initialTodo.priority);
        setIsShared(initialTodo.is_shared);
        setAssignedTo(initialTodo.assigned_to || '');
        setRecurring(initialTodo.is_recurring || 'none');
        setProgressPercent(initialTodo.progress_percent || 0);
        setSubtasks(initialTodo.subtasks ? [...initialTodo.subtasks] : []);
      } else {
        // Default new todo
        setTitle('');
        setDescription('');
        // Default due date to today at 18:00
        const d = new Date();
        d.setHours(18, 0, 0, 0);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const defaultDue = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDueDate(defaultDue);
        setCategoryId(categories[0]?.id || '');
        setPriority('medium');
        setIsShared(false);
        setAssignedTo(currentUser.id);
        setRecurring('none');
        setProgressPercent(0);
        setSubtasks([]);
      }

      if (modalRef.current) {
        animateModalEnter(modalRef.current, overlayRef.current || undefined);
      }
    }
  }, [isOpen, initialTodo, categories, currentUser]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: Subtask = {
      id: 'st-' + Date.now(),
      todo_id: initialTodo?.id || '',
      title: newSubtaskTitle.trim(),
      is_completed: false
    };
    const updated = [...subtasks, newSt];
    setSubtasks(updated);
    setNewSubtaskTitle('');
    // Auto calculate progress
    const total = updated.length;
    const completed = updated.filter(s => s.is_completed).length;
    if (total > 0) {
      setProgressPercent(Math.round((completed / total) * 100));
    }
  };

  const handleToggleSubtaskInModal = (stId: string) => {
    const updated = subtasks.map(st =>
      st.id === stId ? { ...st, is_completed: !st.is_completed } : st
    );
    setSubtasks(updated);
    const total = updated.length;
    const completed = updated.filter(s => s.is_completed).length;
    if (total > 0) {
      setProgressPercent(Math.round((completed / total) * 100));
    }
  };

  const handleRemoveSubtask = (stId: string) => {
    const updated = subtasks.filter(s => s.id !== stId);
    setSubtasks(updated);
    const total = updated.length;
    const completed = updated.filter(s => s.is_completed).length;
    if (total > 0) {
      setProgressPercent(Math.round((completed / total) * 100));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const status = progressPercent === 100 ? 'completed' : progressPercent > 0 ? 'in_progress' : 'todo';

    onSave({
      id: initialTodo?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate || undefined,
      priority,
      status,
      progress_percent: progressPercent,
      category_id: categoryId,
      created_by: initialTodo?.created_by || currentUser.id,
      assigned_to: isShared ? (assignedTo || currentUser.id) : currentUser.id,
      is_shared: isShared,
      is_recurring: recurring,
      subtasks
    });

    onClose();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={e => e.target === overlayRef.current && onClose()}>
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={20} color="var(--tosca-600)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {initialTodo ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            </h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="todo-title-input">Judul Tugas *</label>
              <input
                id="todo-title-input"
                type="text"
                className="form-input"
                placeholder="Contoh: Belanja mingguan atau Deploy fitur baru..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="todo-desc-input">Catatan / Keterangan</label>
              <textarea
                id="todo-desc-input"
                className="form-textarea"
                placeholder="Tuliskan catatan detail, instruksi, atau link referensi di sini..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Date & Time Picker */}
            <div className="form-group">
              <label className="form-label" htmlFor="todo-date-input" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="var(--tosca-600)" />
                <span>Tanggal & Jam Target Pengerjaan</span>
              </label>
              <input
                id="todo-date-input"
                type="datetime-local"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            {/* Category & Priority Grid */}
            <div className="form-grid-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="todo-category-select">Kategori</label>
                <select
                  id="todo-category-select"
                  className="form-select"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="todo-priority-select">Prioritas</label>
                <select
                  id="todo-priority-select"
                  className="form-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                >
                  <option value="low">Rendah (Low)</option>
                  <option value="medium">Sedang (Medium)</option>
                  <option value="high">Tinggi (High)</option>
                  <option value="urgent">Mendesak (Urgent ⚠️)</option>
                </select>
              </div>
            </div>

            {/* Sharing Switch */}
            <div className="modal-sharing-card">
              <div className="modal-sharing-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  {isShared ? <Users size={18} color="#0284c7" style={{ flexShrink: 0 }} /> : <User size={18} color="var(--tosca-600)" style={{ flexShrink: 0 }} />}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                      {isShared ? 'Tugas Bersama (Shared)' : 'Tugas Pribadi'}
                    </p>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {isShared
                        ? 'Dapat dilihat dan dikerjakan bersama oleh partner'
                        : 'Hanya bisa dilihat oleh Anda sendiri'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn ${isShared ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.78rem', flexShrink: 0 }}
                  onClick={() => setIsShared(!isShared)}
                >
                  {isShared ? 'Ganti ke Pribadi' : 'Bagikan ke Partner'}
                </button>
              </div>

              {/* Assignee if shared */}
              {isShared && (
                <div style={{ marginTop: '4px' }}>
                  <label className="form-label" htmlFor="todo-assignee-select" style={{ fontSize: '0.78rem' }}>
                    Tugaskan Kepada:
                  </label>
                  <select
                    id="todo-assignee-select"
                    className="form-select"
                    value={assignedTo || currentUser.id}
                    onChange={e => setAssignedTo(e.target.value)}
                    style={{ maxWidth: '100%' }}
                  >
                    {!users.some(u => u.id === currentUser.id) && (
                      <option value={currentUser.id}>
                        {currentUser.name} ({currentUser.email}) - Saya
                      </option>
                    )}
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) {u.id === currentUser.id ? '- Saya' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Recurring Option */}
            <div className="form-group">
              <label className="form-label" htmlFor="todo-recurring-select">Pengulangan Tugas (Recurring)</label>
              <select
                id="todo-recurring-select"
                className="form-select"
                value={recurring}
                onChange={e => setRecurring(e.target.value as RecurringType)}
              >
                <option value="none">Tidak Berulang (Sekali Saja)</option>
                <option value="daily">Harian (Setiap Hari)</option>
                <option value="weekly">Mingguan (Tiap Pekan)</option>
                <option value="monthly">Bulanan (Tiap Bulan)</option>
              </select>
            </div>

            {/* Subtasks Checklist */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtasks / Checklist Langkah ({subtasks.length})</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--tosca-600)' }}>
                  {progressPercent}% Selesai
                </span>
              </label>

              {/* Input tambah subtask */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', width: '100%' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tambah langkah checklist (misal: Beli susu, Telur)..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  style={{ flex: 1, minWidth: 0 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddSubtask}
                  style={{ padding: '0 14px', flexShrink: 0 }}
                  aria-label="Tambah subtask"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* List subtasks */}
              {subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {subtasks.map(st => (
                    <div
                      key={st.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.84rem',
                        gap: '8px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <button
                          type="button"
                          className={`subtask-checkbox ${st.is_completed ? 'checked' : ''}`}
                          onClick={() => handleToggleSubtaskInModal(st.id)}
                          aria-label={st.is_completed ? 'Tandai subtask belum selesai' : 'Tandai subtask selesai'}
                          style={{ flexShrink: 0 }}
                        >
                          {st.is_completed && <Check size={12} strokeWidth={3} />}
                        </button>
                        <span
                          style={{
                            textDecoration: st.is_completed ? 'line-through' : 'none',
                            color: st.is_completed ? 'var(--text-muted)' : 'inherit',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            minWidth: 0,
                            flex: 1
                          }}
                        >
                          {st.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-danger-ghost"
                        style={{ padding: '4px', borderRadius: '4px', flexShrink: 0 }}
                        onClick={() => handleRemoveSubtask(st.id)}
                        aria-label="Hapus subtask"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="todo-progress-slider">Progress Pengerjaan</label>
                <span style={{ fontWeight: 800, color: 'var(--tosca-600)' }}>{progressPercent}%</span>
              </div>
              <input
                id="todo-progress-slider"
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressPercent}
                onChange={e => setProgressPercent(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--tosca-500)', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              {initialTodo ? 'Simpan Perubahan' : 'Buat Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
