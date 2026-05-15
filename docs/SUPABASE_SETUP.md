# Supabase Setup Guide

Panduan ini menjelaskan cara menghubungkan AsistenRT ke Supabase
dari awal hingga aplikasi bisa membaca data dari database.

---

## 1. Membuat Project Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login.
2. Klik **New project**.
3. Isi:
   - **Name**: `asistenrt` (atau nama lain sesuai preferensi)
   - **Database Password**: buat password yang kuat, simpan di tempat aman
   - **Region**: pilih yang paling dekat (misalnya Singapore)
4. Klik **Create new project** dan tunggu hingga selesai (~1–2 menit).

---

## 2. Mengisi Environment Variables

Salin file `.env.example` ke `.env.local`:

```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# atau buat manual
```

Buka Supabase dashboard → **Settings** → **API**, lalu isi `.env.local`:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AsistenRT

# Supabase — ambil dari Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LLM (belum dipakai di Phase 01)
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Security
APP_SECRET=

# Feature Flags
ENABLE_AI_CHAT=true
ENABLE_PDF_EXPORT=false
ENABLE_WHATSAPP=false
```

> **Penting**: `.env.local` sudah ada di `.gitignore` — jangan commit file ini.

---

## 3. Menjalankan Migration SQL

1. Di Supabase dashboard, buka **SQL Editor**.
2. Klik **New query**.
3. Salin seluruh isi file `supabase/migrations/001_initial_schema.sql`.
4. Tempel ke SQL Editor.
5. Klik **Run** (atau tekan `Ctrl+Enter`).
6. Pastikan muncul pesan `Success. No rows returned`.

Verifikasi: Buka **Table Editor** → pastikan ada 10 tabel:
`rts`, `users`, `rt_members`, `faqs`, `letter_templates`,
`letter_requests`, `complaint_reports`, `chat_sessions`,
`chat_messages`, `ai_audit_logs`.

---

## 4. Menjalankan Seed SQL

1. Di SQL Editor, klik **New query** (query baru, jangan timpa yang lama).
2. Salin seluruh isi file `supabase/seed.sql`.
3. Tempel ke SQL Editor.
4. Klik **Run**.

Verifikasi: Buka **Table Editor** → tabel `rts` → pastikan ada 1 baris
(RT 03, Perumahan Griya Damai). Tabel `faqs` → pastikan ada 4 baris.

---

## 5. Verifikasi Koneksi dari Aplikasi

Setelah `.env.local` terisi dan migration + seed sudah dijalankan:

```bash
npm run dev
```

Buka `http://localhost:3000/admin`.

**Jika berhasil**, akan tampil:
- Kartu **Profil RT** dengan data RT 03
- Seksi **FAQ Aktif** dengan 4 FAQ dari seed

**Jika gagal**, periksa:
- Apakah URL Supabase sudah benar (tidak ada trailing slash)?
- Apakah Anon Key sudah benar (bukan Service Role Key)?
- Apakah migration sudah dijalankan?

---

## 6. Environment Variables — Referensi Lengkap

| Variable | Sumber | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public | Key untuk client-side (aman dipublish) |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role | Key admin — **jangan expose ke client** |

> `NEXT_PUBLIC_*` otomatis dikirim ke browser. Hanya isi dengan nilai
> yang aman untuk diketahui publik (anon key, bukan service role key).

---

## Catatan Phase 01A

- Migration dijalankan **manual** via SQL Editor — bukan via Supabase CLI.
- Seed dijalankan **manual** via SQL Editor.
- Row Level Security (RLS) belum diaktifkan — semua data terbaca dengan anon key.
  RLS akan ditambahkan setelah MVP berjalan stabil.
- Supabase Auth belum diaktifkan — ini bagian dari Phase 01B.
