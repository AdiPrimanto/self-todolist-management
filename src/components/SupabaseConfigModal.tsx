import React, { useState, useEffect, useRef } from 'react';
import { X, Database, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  isSupabaseConfigured
} from '../lib/supabase';
import { animateModalEnter } from '../utils/animations';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(localStorage.getItem('zentask_supabase_url') || localStorage.getItem('toscatask_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '');
      setKey(localStorage.getItem('zentask_supabase_anon_key') || localStorage.getItem('toscatask_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
      setSavedSuccess(false);

      if (modalRef.current) {
        animateModalEnter(modalRef.current, overlayRef.current || undefined);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLive = isSupabaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) return;

    saveSupabaseCredentials(url, key);
    setSavedSuccess(true);
    setTimeout(() => {
      onConfigSaved();
      onClose();
    }, 800);
  };

  const handleReset = () => {
    clearSupabaseCredentials();
    setUrl('');
    setKey('');
    onConfigSaved();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={e => e.target === overlayRef.current && onClose()}>
      <div className="modal-content" ref={modalRef} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--tosca-600)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Koneksi Supabase Database</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Status box */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: isLive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(20, 184, 166, 0.1)',
                border: `1px solid ${isLive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(20, 184, 166, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {isLive ? <CheckCircle2 size={20} color="#10b981" /> : <AlertTriangle size={20} color="var(--tosca-600)" />}
              <div>
                <p style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                  {isLive ? 'Terhubung ke Supabase' : 'Saat ini berjalan di Demo Mode (Lokal)'}
                </p>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {isLive
                    ? 'Data tersinkronisasi langsung dengan cloud database Supabase Anda.'
                    : 'Aplikasi berjalan lancar menggunakan penyimpanan browser (localStorage).'}
                </p>
              </div>
            </div>

            {/* Supabase URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="supabase-url-input">Project URL (Supabase)</label>
              <input
                id="supabase-url-input"
                type="url"
                className="form-input"
                placeholder="https://xyzproject.supabase.co"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>

            {/* Supabase Anon Key */}
            <div className="form-group">
              <label className="form-label" htmlFor="supabase-key-input">Anon / Public API Key</label>
              <input
                id="supabase-key-input"
                type="password"
                className="form-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={key}
                onChange={e => setKey(e.target.value)}
              />
            </div>

            {/* Guide */}
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                background: 'var(--bg-subtle)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <p style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                💡 Cara Menyiapkan Database Supabase:
              </p>
              <ol style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <li>Buka project Supabase Anda di web browser.</li>
                <li>Masuk ke menu <strong>SQL Editor</strong>.</li>
                <li>Jalankan skrip yang sudah kami siapkan di file: <code>supabase_schema.sql</code>.</li>
                <li>Salin <strong>URL</strong> dan <strong>anon key</strong> dari menu Project Settings &gt; API.</li>
              </ol>
            </div>

            {savedSuccess && (
              <p style={{ color: '#10b981', fontSize: '0.84rem', fontWeight: 700, textAlign: 'center' }}>
                ✓ Pengaturan berhasil disimpan! Menyegarkan data...
              </p>
            )}
          </div>

          <div className="modal-footer config-modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleReset}
              style={{ fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} />
              <span>Reset ke Demo</span>
            </button>

            <div className="config-footer-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Tutup
              </button>
              <button type="submit" className="btn btn-primary">
                Simpan & Hubungkan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
