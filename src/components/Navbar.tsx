import React, { useState, useRef, useEffect } from 'react';
import { CheckSquare, Plus, Moon, Sun, Volume2, VolumeX, LogOut, ChevronDown } from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  availableUsers?: UserProfile[];
  onSwitchUser?: (user: UserProfile) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  isSupabaseLive?: boolean;
  onOpenConfig?: () => void;
  onOpenAddTodo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  isDark,
  onToggleTheme,
  isSoundEnabled,
  onToggleSound,
  onOpenAddTodo,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showUserDropdown) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showUserDropdown]);

  return (
    <header className="navbar glass-panel">
      {/* Brand & Title */}
      <div className="navbar-brand">
        <div className="brand-icon-box">
          <CheckSquare size={22} strokeWidth={2.6} />
        </div>
        <div className="brand-text">
          <h1>ZenTask</h1>
          <p className="brand-subtitle">Self & Shared Todo Management</p>
        </div>
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        {/* User Profile & Switcher Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            className="user-selector-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            title="Menu Akun & Pengguna"
            aria-expanded={showUserDropdown}
          >
            <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar" />
            <span className="user-selector-label">{currentUser.name}</span>
            <ChevronDown size={14} className="user-selector-icon" />
          </button>

          {showUserDropdown && (
            <div className="user-profile-menu glass-panel" role="menu">
              {/* Profile Card Header */}
              <div className="profile-menu-header">
                <img src={currentUser.avatar} alt={currentUser.name} className="profile-menu-avatar" />
                <div style={{ overflow: 'hidden' }}>
                  <p className="profile-menu-name">{currentUser.name}</p>
                  <p className="profile-menu-email">{currentUser.email}</p>
                  {currentUser.role && (
                    <span className="profile-menu-role">{currentUser.role}</span>
                  )}
                </div>
              </div>

              <div className="profile-menu-divider" />

              {/* Logout Button */}
              <div style={{ padding: '4px 6px' }}>
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleSound}
          title={isSoundEnabled ? 'Suara aktif (klik untuk mute)' : 'Suara mati (klik untuk aktifkan)'}
          aria-label="Toggle Sound"
        >
          {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleTheme}
          title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Primary CTA: Add Todo */}
        <button type="button" className="btn btn-primary btn-add-todo" onClick={onOpenAddTodo}>
          <Plus size={18} strokeWidth={2.5} />
          <span className="btn-add-todo-label">Tugas Baru</span>
        </button>
      </div>
    </header>
  );
};
