# Task 01: Database & Authentication

## Goal

Menghubungkan aplikasi Next.js ke Supabase sebagai backend — mulai dari setup project
Supabase, eksekusi schema migration, seed data awal, hingga autentikasi berbasis role
(super_admin, rt_admin, warga) menggunakan Supabase Auth.

Task ini dibagi dua fase yang **harus dikerjakan secara berurutan**:
- **Task 01A** — Supabase Database Setup
- **Task 01B** — Authentication & Role-Based Access

Task 01B **tidak boleh dimulai** sebelum Task 01A selesai dan lolos acceptance criteria-nya.

---

## Context

- Project Next.js App Router sudah berdiri (Task 00 selesai).
- Schema SQL sudah tersedia di `supabase/migrations/001_initial_schema.sql`.
- Seed data awal sudah tersedia di `supabase/seed.sql`.
- Environment variables sudah didefinisikan di `.env.example`.
- Belum ada koneksi database sama sekali — aplikasi masih full static placeholder.
- Supabase Auth akan digunakan sebagai sumber kebenaran identitas pengguna.
- Tabel `users` aplikasi (bukan `auth.users`) menyimpan profil tambahan dan role.

---

## Phase 01A: Supabase Database Setup

### Tujuan Fase
Membuat Supabase project, menjalankan migration schema, memuat seed data, dan
memverifikasi bahwa semua tabel terbentuk dengan benar di Supabase dashboard.

### Langkah yang Harus Dikerjakan

1. **Buat Supabase project** melalui dashboard Supabase (manual, bukan coding).
2. **Isi environment variables** di `.env.local` sesuai `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Install Supabase client** ke project Next.js:
   - `@supabase/supabase-js`
   - `@supabase/ssr` (untuk integrasi Next.js App Router)
4. **Buat Supabase client utilities** di `lib/supabase/`:
   - `client.ts` — browser client (untuk komponen client-side)
   - `server.ts` — server client (untuk Server Components dan Route Handlers)
5. **Jalankan migration** `supabase/migrations/001_initial_schema.sql` melalui
   Supabase SQL Editor di dashboard.
6. **Jalankan seed** `supabase/seed.sql` melalui Supabase SQL Editor.
7. **Verifikasi** semua tabel terbentuk dan seed data terbaca via Supabase Table Editor.
8. **Test koneksi** dengan membuat satu server-side query sederhana untuk membuktikan
   aplikasi bisa membaca data dari Supabase.

### Tabel yang Harus Ada Setelah Fase Ini

| Tabel | Keterangan |
|---|---|
| `rts` | Profil RT/RW |
| `users` | Data user aplikasi + role |
| `rt_members` | Relasi user–RT |
| `faqs` | Knowledge base FAQ |
| `letter_templates` | Template surat |
| `letter_requests` | Permintaan surat warga |
| `complaint_reports` | Laporan keluhan |
| `chat_sessions` | Sesi chat warga |
| `chat_messages` | Pesan dalam sesi chat |
| `ai_audit_logs` | Log setiap interaksi AI |

### Files yang Akan Dibuat di Fase Ini

```
lib/
  supabase/
    client.ts       ← browser Supabase client
    server.ts       ← server Supabase client (cookies-based)
.env.local          ← dari .env.example, diisi kredensial nyata (tidak di-commit)
```

---

## Phase 01B: Authentication & Role-Based Access

### Tujuan Fase
Mengimplementasikan alur login/logout menggunakan Supabase Auth, menyinkronkan
identitas auth ke tabel `users` aplikasi, dan membatasi akses halaman berdasarkan role.

### Prasyarat
Task 01A harus sudah selesai: koneksi Supabase aktif, semua tabel ada, seed data
terbaca, dan Supabase client sudah terbentuk di `lib/supabase/`.

### Langkah yang Harus Dikerjakan

1. **Aktifkan Email Auth** di Supabase Auth settings (Email provider, konfirmasi email
   bisa dimatikan untuk MVP).
2. **Buat middleware** (`middleware.ts` di root project) untuk:
   - Refresh Supabase session di setiap request.
   - Redirect ke `/login` jika halaman admin diakses tanpa session.
   - Redirect ke `/` jika user sudah login mencoba akses `/login`.
3. **Buat halaman login** di `app/(auth)/login/page.tsx`:
   - Form email + password.
   - Gunakan `supabase.auth.signInWithPassword()`.
   - Redirect ke `/admin` setelah berhasil.
   - Tampilkan error jika gagal.
4. **Implementasikan logout** — action server atau route handler yang memanggil
   `supabase.auth.signOut()` lalu redirect ke `/login`.
5. **Sinkronisasi user ke tabel `users`** — setelah login pertama kali, pastikan
   data user ada di tabel `users` dengan role yang benar.
6. **Buat utility `getUser()`** di `lib/auth.ts` — helper server-side untuk membaca
   session dan role user aktif dari Supabase.
7. **Proteksi route admin** — `/admin` dan semua sub-route hanya bisa diakses oleh
   `rt_admin` dan `super_admin`. Warga yang mencoba akses akan di-redirect.
8. **Proteksi berdasarkan role** — jika user dengan role `warga` mengakses `/admin`,
   redirect ke `/chat`.

### Role & Akses yang Harus Berlaku

| Role | Bisa Akses |
|---|---|
| `super_admin` | `/admin/**`, semua RT |
| `rt_admin` | `/admin/**`, hanya RT miliknya |
| `warga` | `/chat` saja |
| Tidak login | `/` (landing), `/login`, `/chat` (read-only placeholder) |

### Files yang Akan Dibuat di Fase Ini

```
middleware.ts                   ← session refresh + route protection
app/
  (auth)/
    login/
      page.tsx                  ← halaman login
  (auth)/
    layout.tsx                  ← layout minimal untuk halaman auth
lib/
  auth.ts                       ← getUser(), getUserRole() helper
```

### Files yang Akan Dimodifikasi di Fase Ini

```
app/admin/page.tsx              ← tambahkan server-side auth check
components/layout/Header.tsx    ← tambahkan tombol logout jika sudah login
```

---

## Files to Read Sebelum Implementasi

Baca semua file ini sebelum mulai coding:

- `CLAUDE.md` — aturan pengembangan dan security rules
- `supabase/migrations/001_initial_schema.sql` — struktur tabel lengkap
- `supabase/seed.sql` — data awal RT dan FAQ
- `.env.example` — daftar env vars yang dibutuhkan
- `docs/DATABASE_SCHEMA.md` — ringkasan tabel dan enum
- `docs/USER_STORIES.md` — US-001 sampai US-006 untuk konteks fitur
- `tasks/00_project_setup.md` — pastikan Task 00 sudah selesai

---

## Requirements

### Task 01A
- Gunakan `@supabase/supabase-js` dan `@supabase/ssr`.
- Buat dua client terpisah: browser client dan server client (berbeda cara handling cookies).
- Jangan hardcode URL atau key Supabase — selalu dari environment variables.
- Migration dijalankan manual via Supabase SQL Editor, bukan Supabase CLI, untuk MVP.

### Task 01B
- Gunakan Supabase Auth bawaan (Email/Password) — jangan buat sistem auth sendiri.
- Session harus direfresh via middleware di setiap request.
- Role dibaca dari tabel `users` aplikasi, bukan dari `auth.users` metadata (lebih aman).
- Halaman login harus punya loading state dan error state.
- Jangan simpan role di localStorage atau cookie manual — baca dari DB tiap request.

---

## Acceptance Criteria

### Task 01A Selesai Jika:
- [ ] Semua 10 tabel ada di Supabase dan bisa dilihat di Table Editor.
- [ ] Seed data RT 03 dan 4 FAQ awal terbaca di dashboard.
- [ ] `lib/supabase/client.ts` dan `lib/supabase/server.ts` ada dan tidak ada TypeScript error.
- [ ] Aplikasi bisa melakukan query ke Supabase dari Server Component tanpa error.
- [ ] `.env.local` terisi dan `.env.local` ada di `.gitignore`.

### Task 01B Selesai Jika:
- [ ] Halaman `/login` bisa dibuka dan form berfungsi.
- [ ] Login dengan akun admin yang valid berhasil dan redirect ke `/admin`.
- [ ] Login dengan kredensial salah menampilkan pesan error yang jelas.
- [ ] Mengakses `/admin` tanpa login redirect ke `/login`.
- [ ] User dengan role `warga` yang mencoba akses `/admin` di-redirect ke `/chat`.
- [ ] Logout menghapus session dan redirect ke `/login`.
- [ ] `middleware.ts` ada di root project dan session di-refresh tiap request.

---

## Out of Scope

Jangan implementasikan di Task 01:
- Register/signup mandiri oleh warga — untuk MVP, user dibuat manual oleh admin.
- Reset password flow.
- OAuth / social login (Google, dll).
- Verifikasi email.
- Profil user (edit nama, foto, dll) — ini masuk Task 02.
- Row Level Security (RLS) Supabase yang kompleks — bisa ditambahkan setelah MVP berjalan.
- Magic link / OTP login.

---

## Execution Rules

1. **Kerjakan 01A lebih dulu, selesaikan, tes, baru mulai 01B.**
2. Jangan install package yang tidak disebutkan di requirements.
3. Jangan modifikasi `supabase/migrations/001_initial_schema.sql` — jalankan apa adanya.
4. Setiap file TypeScript baru harus bebas dari error (`npm run type-check`).
5. Jangan buat fitur selain yang ada di task ini (tidak ada halaman dashboard lengkap dulu).
6. Setelah setiap fase selesai, jalankan `npm run dev` dan verifikasi tidak ada error di console.
7. Jangan commit `.env.local` ke git.
