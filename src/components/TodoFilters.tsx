import React from 'react';
import { Search, LayoutList, Kanban, Plus, User, Users, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Category, FilterScope, ViewMode } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TodoFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeScope: FilterScope;
  onScopeChange: (scope: FilterScope) => void;
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (catId: string | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenAddCategory: () => void;
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeScope,
  onScopeChange,
  categories,
  activeCategoryId,
  onSelectCategory,
  viewMode,
  onViewModeChange,
  onOpenAddCategory
}) => {
  return (
    <div className="controls-panel">
      {/* Search Bar & View Switcher */}
      <div className="search-and-views">
        <div className="search-box-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-box-input"
            placeholder="Cari judul tugas, catatan, atau checklist..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        {/* View mode toggle (List vs Kanban) */}
        <div className="view-mode-group">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="Tampilan Daftar"
          >
            <LayoutList size={16} />
            <span>List</span>
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => onViewModeChange('kanban')}
            title="Tampilan Papan Kanban"
          >
            <Kanban size={16} />
            <span>Kanban</span>
          </button>
        </div>
      </div>

      {/* Scope Filter Tabs */}
      <div className="scope-tabs" role="tablist">
        <button
          type="button"
          className={`scope-tab-btn ${activeScope === 'all' ? 'active' : ''}`}
          onClick={() => onScopeChange('all')}
        >
          Semua
        </button>
        <button
          type="button"
          className={`scope-tab-btn ${activeScope === 'personal' ? 'active' : ''}`}
          onClick={() => onScopeChange('personal')}
        >
          <User size={14} />
          <span>Pribadi</span>
        </button>
        <button
          type="button"
          className={`scope-tab-btn ${activeScope === 'shared' ? 'active' : ''}`}
          onClick={() => onScopeChange('shared')}
        >
          <Users size={14} />
          <span>Dibagikan</span>
        </button>
        <button
          type="button"
          className={`scope-tab-btn ${activeScope === 'today' ? 'active' : ''}`}
          onClick={() => onScopeChange('today')}
        >
          <Calendar size={14} />
          <span>Hari Ini</span>
        </button>
        <button
          type="button"
          className={`scope-tab-btn ${activeScope === 'overdue' ? 'active' : ''}`}
          onClick={() => onScopeChange('overdue')}
        >
          <AlertCircle size={14} color="#ef4444" />
          <span>Terlambat</span>
        </button>
        <button
          type="button"
          className={`scope-tab-btn ${activeScope === 'completed' ? 'active' : ''}`}
          onClick={() => onScopeChange('completed')}
        >
          <CheckCircle2 size={14} />
          <span>Selesai</span>
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="category-pills-bar">
        <button
          type="button"
          className={`category-pill ${activeCategoryId === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          Semua Kategori
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`category-pill ${activeCategoryId === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(activeCategoryId === cat.id ? null : cat.id)}
          >
            <CategoryIcon name={cat.icon} size={15} color={cat.color} />
            <span>{cat.name}</span>
          </button>
        ))}

        <button
          type="button"
          className="category-pill add-category-pill"
          onClick={onOpenAddCategory}
          title="Tambah Kategori Baru"
        >
          <Plus size={14} />
          <span>Kategori Baru</span>
        </button>
      </div>
    </div>
  );
};
