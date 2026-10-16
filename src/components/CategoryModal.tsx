import React, { useState, useRef, useEffect } from 'react';
import { X, FolderPlus } from 'lucide-react';
import type { Category } from '../types';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';
import { animateModalEnter } from '../utils/animations';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id'>) => void;
}

const PRESET_COLORS = [
  '#0d9488', // Tosca Teal
  '#059669', // Emerald
  '#0f766e', // Deep Teal
  '#14b8a6', // Light Mint
  '#0284c7', // Sky Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#e11d48', // Rose Red
  '#ea580c', // Orange
  '#ca8a04'  // Gold / Amber
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [selectedColor, setSelectedColor] = useState('#0d9488');

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSelectedIcon('Folder');
      setSelectedColor('#0d9488');
      if (modalRef.current) {
        animateModalEnter(modalRef.current, overlayRef.current || undefined);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      is_default: false
    });

    onClose();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={e => e.target === overlayRef.current && onClose()}>
      <div className="modal-content" ref={modalRef} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={20} color="var(--tosca-600)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Tambah Kategori Baru</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Category Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="cat-name-input">Nama Kategori *</label>
              <input
                id="cat-name-input"
                type="text"
                className="form-input"
                placeholder="Misal: Finansial, Belajar, Liburan..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Live Preview */}
            <div className="form-group">
              <label className="form-label">Preview Tampilan</label>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: selectedColor,
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                <CategoryIcon name={selectedIcon} size={18} color={selectedColor} />
                <span>{name || 'Nama Kategori'}</span>
              </div>
            </div>

            {/* Icon Picker */}
            <div className="form-group">
              <label className="form-label">Pilih Icon</label>
              <div className="icon-picker-grid">
                {AVAILABLE_ICONS.map(item => (
                  <button
                    key={item.name}
                    type="button"
                    className={`icon-picker-item ${selectedIcon === item.name ? 'selected' : ''}`}
                    onClick={() => setSelectedIcon(item.name)}
                    title={item.label}
                  >
                    <CategoryIcon name={item.name} size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="form-group">
              <label className="form-label">Pilih Warna Aksen</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: color,
                      border: selectedColor === color ? '3px solid #ffffff' : '2px solid transparent',
                      boxShadow: selectedColor === color ? `0 0 0 2px ${color}` : 'none',
                      transition: 'transform 0.15s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Kategori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
