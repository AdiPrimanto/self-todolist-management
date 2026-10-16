# 🌿 ZenTask — Minimalist Self & Shared Todo Management

Aplikasi manajemen tugas pribadi (*self*) dan kolaborasi (*shared*) antar-pengguna dengan antarmuka **Tosca Minimalist**, animasi mikro **GSAP**, dan dukungan integrasi **Supabase Database**.

---

## ✨ Fitur Utama

1. **Autentikasi Lengkap (Login, Register & Logout)**
   - Halaman **Login & Registrasi** mandiri dengan desain minimalis tosca.
   - Mendukung autentikasi database cloud via **Supabase Auth** (`signInWithPassword` & `signUp`).
   - Mode Demo mandiri dengan 2 akun bawaan:
     - **User 1 (Adiprimanto):** `adi@example.com` / `password123`
     - **User 2 (Partner):** `partner@example.com` / `password123`
     - Tombol *1-Click Quick Login* untuk pengujian kilat.
   - Menu profil di navbar dilengkapi tombol **Keluar (Logout)** dan opsi cepat beralih user.

2. **Pengingat Cerdas (*Smart Reminder Banner*)**
   - Banner khusus di menu utama yang mendeteksi tugas **Terlambat (*Overdue*)** dan **Jatuh Tempo Hari Ini**.
   - Tombol filter 1-klik untuk langsung meninjau tugas yang membutuhkan perhatian segera.

3. **Detail & Fleksibilitas Tugas**
   - **Tanggal & Jam:** Dukungan `datetime-local` untuk ketepatan waktu.
   - **Catatan / Instruksi:** Kolom keterangan detail untuk tiap tugas.
   - **Prioritas Tugas:** *Rendah (Low)*, *Sedang (Medium)*, *Tinggi (High)*, *Mendesak (Urgent ⚠️)*.
   - **Tugas Berulang (*Recurring*):** Harian, Mingguan, Bulanan.
   - **Subtasks & Checklist:** Pemecahan tugas ke dalam checklist langkah-langkah kecil. Progress bar otomatis terhitung berdasarkan checklist yang selesai.

4. **Kategori Kustom & Icon Selector**
   - Kategori bawaan: *Pribadi*, *Kerja & Project*, *Belanja & Kebutuhan*, *Ibadah & Doa*, *Rumah Tangga*, *Kesehatan & Habit*.
   - Tambah kategori baru dengan **pilihan icon dinamis (Lucide Icons)** dan palet warna tosca/aksen.

5. **Multi-View: List & Kanban Board**
   - **List View:** Daftar tugas minimalis dengan badge status, assignee, dan subtask.
   - **Kanban Board:** Papan 3 kolom (*Belum Dimulai*, *Sedang Berjalan*, *Selesai*) dengan tombol pemindahan status cepat.

6. **Desain & Micro-Animations**
   - **Palet Warna Tosca:** Deep Teal (`#0d9488`), Mint (`#14b8a6`), Glassmorphism, dan Dark Emerald Mode.
   - **Animasi GSAP:** Transisi halus kartu tugas, pembukaan modal, dan efek checklist.
   - **Perayaan Partikel (*Confetti*):** Semburan partikel warna tosca saat menyelesaikan tugas.
   - **Audio Chime (Web Audio API):** Efek suara harmonic chime yang memuaskan (dapat di-toggle aktif/mute).

7. **Database Supabase + Mode Demo Lokal**
   - Berjalan langsung di browser dengan data demo lokal via `localStorage`.
   - Siap dihubungkan ke **Supabase** kapan saja cukup dengan memasukkan URL & Anon Key di modal pengaturan.
   - Skrip SQL lengkap tersedia di file [`supabase_schema.sql`](file:///Users/adiprimanto/Developer/Project/self-todolist-management/supabase_schema.sql).

---

## 🚀 Cara Menjalankan Project

```bash
# 1. Jalankan development server
npm run dev

# 2. Buka di browser
# http://localhost:5173
```

---

## 🗄️ Menghubungkan ke Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan buat project baru.
2. Masuk ke tab **SQL Editor**, buka file [`supabase_schema.sql`](file:///Users/adiprimanto/Developer/Project/self-todolist-management/supabase_schema.sql), salin kodenya, dan jalankan (Run).
3. Salin **Project URL** dan **Anon API Key** dari menu *Project Settings > API*.
4. Klik tombol status **"Demo Mode (Lokal)"** di navbar aplikasi ZenTask, lalu tempel kredensial Anda dan klik **Simpan & Hubungkan**.
