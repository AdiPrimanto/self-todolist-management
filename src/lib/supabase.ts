import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Ambil config dari environment variables atau localStorage (memudahkan input via UI)
const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem('zentask_supabase_url') || localStorage.getItem('toscatask_supabase_url');
  const localKey = localStorage.getItem('zentask_supabase_anon_key') || localStorage.getItem('toscatask_supabase_anon_key');

  const supabaseUrl = envUrl || localUrl;
  const supabaseAnonKey = envKey || localKey;

  return { supabaseUrl, supabaseAnonKey };
};

export const isSupabaseConfigured = (): boolean => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;

  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
  if (supabaseUrl && supabaseAnonKey && isSupabaseConfigured()) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey);
      return clientInstance;
    } catch (e) {
      console.warn('Gagal menginisialisasi Supabase client:', e);
      return null;
    }
  }
  return null;
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('zentask_supabase_url', url.trim());
  localStorage.setItem('zentask_supabase_anon_key', key.trim());
  clientInstance = null; // Reset cache agar ter-create ulang
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('zentask_supabase_url');
  localStorage.removeItem('zentask_supabase_anon_key');
  localStorage.removeItem('toscatask_supabase_url');
  localStorage.removeItem('toscatask_supabase_anon_key');
  clientInstance = null;
};
