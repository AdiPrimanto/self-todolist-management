import React, { useState } from 'react';
import { CheckSquare, LogIn, UserPlus, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { authService, INITIAL_REGISTERED_USERS } from '../services/authService';
import type { UserProfile } from '../types';
import { soundManager } from '../utils/audio';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  isSupabaseLive?: boolean;
  onOpenConfig?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  isSupabaseLive,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await authService.login(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          soundManager.playSuccess();
          onLoginSuccess(res.user);
        }
      } else {
        const res = await authService.register(email, password, name);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          soundManager.playSuccess();
          onLoginSuccess(res.user);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
    setIsLoading(true);
    const res = await authService.login(demoEmail, demoPass);
    setIsLoading(false);
    if (res.user) {
      soundManager.playSuccess();
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card glass-panel">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="brand-icon-box" style={{ width: '48px', height: '48px', margin: '0 auto 12px' }}>
            <CheckSquare size={26} strokeWidth={2.6} />
          </div>
          <h1 className="auth-brand-title">ZenTask</h1>
          <p className="auth-brand-subtitle">
            Minimalist Self & Shared Todo Management
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
          >
            <LogIn size={16} />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
          >
            <UserPlus size={16} />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="auth-error-alert" role="alert">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name-input">Nama Lengkap</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  id="auth-name-input"
                  type="text"
                  className="form-input auth-input"
                  placeholder="Nama panggilan atau lengkap"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email-input">Alamat Email</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email-input"
                type="email"
                className="form-input auth-input"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password-input">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password-input"
                type="password"
                className="form-input auth-input"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Masuk ke ZenTask' : 'Buat Akun Sekarang'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Accounts Selection */}
        <div className="auth-demo-section">
          <p className="auth-demo-title">
            <Sparkles size={14} color="var(--tosca-500)" />
            <span>Pilihan Akun Uji Coba Cepat (2 User):</span>
          </p>
          <div className="auth-demo-grid">
            {INITIAL_REGISTERED_USERS.map((u, idx) => (
              <button
                key={u.id}
                type="button"
                className="auth-demo-card"
                onClick={() => handleQuickDemoLogin(u.email, u.password || 'password123')}
              >
                <img src={u.avatar} alt={u.name} className="auth-demo-avatar" />
                <div style={{ textAlign: 'left' }}>
                  <p className="auth-demo-name">{u.name}</p>
                  <p className="auth-demo-email">{u.email}</p>
                </div>
                <span className="auth-demo-tag">User {idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Footer */}
        <div className="auth-footer-bar" style={{ justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--tosca-600)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {isSupabaseLive ? 'Tersinkronisasi Cloud Supabase' : 'Mode Penyimpanan Lokal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
