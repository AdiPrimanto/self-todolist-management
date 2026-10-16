import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';
import type { Todo } from '../types';

interface TodoStatsProps {
  todos: Todo[];
}

export const TodoStats: React.FC<TodoStatsProps> = ({ todos }) => {
  const total = todos.length;
  const completed = todos.filter(t => t.status === 'completed').length;
  const inProgress = todos.filter(t => t.status === 'in_progress').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="stats-grid" aria-label="Statistik Produktivitas">
      <div className="stat-card">
        <div>
          <p className="stat-info-title">Total Tugas</p>
          <p className="stat-info-val">{total}</p>
        </div>
        <div className="stat-icon-wrapper">
          <ListTodo size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div>
          <p className="stat-info-title">Dalam Proses</p>
          <p className="stat-info-val">{inProgress}</p>
        </div>
        <div className="stat-icon-wrapper" style={{ color: '#0f766e', background: 'rgba(15, 118, 110, 0.1)' }}>
          <Clock size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div>
          <p className="stat-info-title">Selesai</p>
          <p className="stat-info-val">{completed}</p>
        </div>
        <div className="stat-icon-wrapper" style={{ color: '#0d9488', background: 'rgba(13, 148, 136, 0.1)' }}>
          <CheckCircle2 size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div>
          <p className="stat-info-title">Produktivitas</p>
          <p className="stat-info-val">{completionRate}%</p>
        </div>
        <div className="stat-icon-wrapper" style={{ color: '#14b8a6', background: 'rgba(20, 184, 166, 0.1)' }}>
          <TrendingUp size={24} />
        </div>
      </div>
    </section>
  );
};
