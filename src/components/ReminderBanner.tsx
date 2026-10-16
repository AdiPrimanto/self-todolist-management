import React from 'react';
import { AlertCircle, CalendarClock, CheckCircle, ArrowRight } from 'lucide-react';
import type { Todo } from '../types';

interface ReminderBannerProps {
  todos: Todo[];
  onFilterDue: (filter: 'overdue' | 'today') => void;
}

export const ReminderBanner: React.FC<ReminderBannerProps> = ({ todos, onFilterDue }) => {
  const now = new Date();

  // Filter tugas yang belum selesai
  const pendingTodos = todos.filter(t => t.status !== 'completed');

  // Identifikasi tugas overdue
  const overdueTodos = pendingTodos.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date).getTime() < now.getTime();
  });

  // Identifikasi tugas jatuh tempo hari ini
  const todayTodos = pendingTodos.filter(t => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    return (
      dueDate.getDate() === now.getDate() &&
      dueDate.getMonth() === now.getMonth() &&
      dueDate.getFullYear() === now.getFullYear() &&
      dueDate.getTime() >= now.getTime()
    );
  });

  if (overdueTodos.length === 0 && todayTodos.length === 0) {
    return (
      <div className="reminder-banner">
        <div className="reminder-left">
          <div className="reminder-pulse-icon" style={{ background: 'var(--tosca-500)' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <h2 className="reminder-text-title">Semua Tugas Terkendali!</h2>
            <p className="reminder-text-desc">
              Hebat! Tidak ada tugas yang terlambat atau mendesak untuk saat ini. Tetap produktif!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasOverdue = overdueTodos.length > 0;

  return (
    <div className={`reminder-banner ${hasOverdue ? 'has-overdue' : ''}`}>
      <div className="reminder-left">
        <div className={`reminder-pulse-icon ${hasOverdue ? 'overdue-alert' : ''}`}>
          {hasOverdue ? <AlertCircle size={22} /> : <CalendarClock size={22} />}
        </div>
        <div>
          <h2 className="reminder-text-title">
            {hasOverdue
              ? `Pengingat: Ada ${overdueTodos.length} tugas yang terlambat!`
              : `Pengingat Hari Ini: Ada ${todayTodos.length} tugas perlu diselesaikan`}
          </h2>
          <p className="reminder-text-desc">
            {hasOverdue
              ? `Segera periksa tugas Anda yang telah melewati jam target pengerjaan.`
              : `Jadwal hari ini membutuhkan perhatian Anda sebelum hari berganti.`}
          </p>
        </div>
      </div>

      <button
        type="button"
        className={`btn ${hasOverdue ? 'btn-primary' : 'btn-secondary'}`}
        onClick={() => onFilterDue(hasOverdue ? 'overdue' : 'today')}
        style={{ alignSelf: 'center' }}
      >
        <span>{hasOverdue ? 'Tinjau Terlambat' : 'Lihat Jadwal Hari Ini'}</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
