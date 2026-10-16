import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const AVAILABLE_ICONS = [
  { name: 'User', label: 'Pribadi' },
  { name: 'Briefcase', label: 'Kerja' },
  { name: 'ShoppingCart', label: 'Belanja' },
  { name: 'Sparkles', label: 'Ibadah' },
  { name: 'Home', label: 'Rumah' },
  { name: 'Heart', label: 'Kesehatan' },
  { name: 'BookOpen', label: 'Belajar' },
  { name: 'Coffee', label: 'Santai' },
  { name: 'Flame', label: 'Fokus' },
  { name: 'Dumbbell', label: 'Olahraga' },
  { name: 'DollarSign', label: 'Keuangan' },
  { name: 'Star', label: 'Penting' },
  { name: 'Laptop', label: 'Teknologi' },
  { name: 'Folder', label: 'Arsip' },
  { name: 'Calendar', label: 'Jadwal' },
  { name: 'Music', label: 'Musik' },
  { name: 'Utensils', label: 'Makanan' },
  { name: 'Gift', label: 'Kado' },
  { name: 'Compass', label: 'Wisata' },
  { name: 'CheckCircle2', label: 'Umum' }
];

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = '', size = 18, color }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as Record<string, any>)[name] || Icons.Folder;
  return <IconComponent className={className} size={size} color={color} />;
};
