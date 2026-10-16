import type { UserProfile } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser extends UserProfile {
  password?: string;
}

export const INITIAL_REGISTERED_USERS: AuthUser[] = [
  {
    id: 'user-1',
    email: 'adi@example.com',
    name: 'Adiprimanto',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'Pemilik (User 1)',
    password: 'password123'
  },
  {
    id: 'user-2',
    email: 'partner@example.com',
    name: 'Partner / Teammate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'Partner (User 2)',
    password: 'password123'
  }
];

class AuthService {
  private usersKey = 'zentask_registered_users_v1';
  private sessionKey = 'zentask_session_user_v1';

  constructor() {
    this.initUsers();
  }

  private initUsers() {
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify(INITIAL_REGISTERED_USERS));
    }
    // Jika belum ada session, set default user 1 agar langsung siap dipakai
    if (!localStorage.getItem(this.sessionKey)) {
      const users = this.getRegisteredUsers();
      if (users.length > 0) {
        localStorage.setItem(this.sessionKey, JSON.stringify(users[0]));
      }
    }
  }

  getRegisteredUsers(): AuthUser[] {
    try {
      const data = localStorage.getItem(this.usersKey);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_REGISTERED_USERS;
  }

  getCurrentUser(): UserProfile | null {
    // 1. Cek dari Supabase jika configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        // Ambil session lokal Supabase
        const sessionData = localStorage.getItem(this.sessionKey);
        if (sessionData) {
          try {
            return JSON.parse(sessionData);
          } catch {
            return null;
          }
        }
      }
    }

    // 2. Cek dari localStorage session
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch {
      // fallback
    }
    return null;
  }

  async login(email: string, password: string): Promise<{ user: UserProfile | null; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Jika Supabase aktif, lakukan auth lewat Supabase
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });

          if (error) {
            return { user: null, error: error.message };
          }

          if (data.user) {
            const userProfile: UserProfile = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
              role: 'User'
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(userProfile));
            return { user: userProfile };
          }
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : 'Gagal login ke Supabase';
          return { user: null, error: errMsg };
        }
      }
    }

    // 2. Mode Demo / Lokal Auth
    const users = this.getRegisteredUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      return { user: null, error: 'Email belum terdaftar. Silakan pilih "Daftar Akun Baru".' };
    }

    if (foundUser.password && foundUser.password !== password) {
      return { user: null, error: 'Password yang Anda masukkan salah.' };
    }

    const { password: _, ...userProfile } = foundUser;
    localStorage.setItem(this.sessionKey, JSON.stringify(userProfile));
    return { user: userProfile };
  }

  async register(email: string, password: string, name: string): Promise<{ user: UserProfile | null; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !password || !cleanName) {
      return { user: null, error: 'Mohon lengkapi semua kolom pendaftaran.' };
    }

    if (password.length < 6) {
      return { user: null, error: 'Password minimal 6 karakter.' };
    }

    // 1. Supabase Register jika aktif
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { name: cleanName }
            }
          });

          if (error) {
            return { user: null, error: error.message };
          }

          if (data.user) {
            const userProfile: UserProfile = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              name: cleanName,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
              role: 'User'
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(userProfile));
            return { user: userProfile };
          }
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : 'Gagal mendaftar ke Supabase';
          return { user: null, error: errMsg };
        }
      }
    }

    // 2. Mode Demo / Lokal Register
    const users = this.getRegisteredUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { user: null, error: 'Email ini sudah terdaftar. Silakan lakukan Login.' };
    }

    const newUser: AuthUser = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      role: 'Member',
      password
    };

    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));

    const { password: _, ...userProfile } = newUser;
    localStorage.setItem(this.sessionKey, JSON.stringify(userProfile));
    return { user: userProfile };
  }

  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
      }
    }
    localStorage.removeItem(this.sessionKey);
  }

  switchDemoUser(targetUserId: string): UserProfile | null {
    const users = this.getRegisteredUsers();
    const target = users.find(u => u.id === targetUserId);
    if (target) {
      const { password: _, ...userProfile } = target;
      localStorage.setItem(this.sessionKey, JSON.stringify(userProfile));
      return userProfile;
    }
    return null;
  }
}

export const authService = new AuthService();
