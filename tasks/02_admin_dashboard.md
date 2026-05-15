# Task 02: Admin Dashboard Structure

## Goal

Merapikan struktur dan navigasi panel admin. Buat route-route admin beserta halaman
placeholder read-only yang terstruktur, sidebar navigasi yang aktif sesuai halaman,
dan topbar yang menampilkan informasi user yang sedang login.

---

## Context

Task 01 (Database & Authentication) sudah selesai dengan kondisi berikut:
- Supabase database terkoneksi, semua 10 tabel terbentuk, seed data terbaca.
- Login/logout berfungsi dengan Supabase Auth (Email/Password).
- Session direfresh via `middleware.ts` di setiap request.
- Role dibaca dari tabel `public.users` (bukan metadata auth).
- `/admin` terlindungi — redirect ke `/login` jika belum login.
- Role `warga` diarahkan ke `/unauthorized` jika mencoba akses `/admin`.

Kondisi `app/admin/page.tsx` saat ini:
- Satu halaman monolitik yang memuat profil RT, FAQ, dan stats sekaligus.
- Sidebar navigation belum fungsional (semua item disabled/placeholder).
- Header global (`components/layout/Header.tsx`) dipakai untuk admin — topbar belum
  spesifik untuk admin (tidak ada nama user, role, atau logout yang menonjol).
- Belum ada sub-route admin (`/admin/faqs`, `/admin/profile`, dll).

Task 02 menyelesaikan struktur ini tanpa menambahkan CRUD atau logika AI.

---

## Files to Read Sebelum Implementasi

Baca semua file ini sebelum mulai coding:

- `CLAUDE.md` — aturan umum development
- `tasks/01_database_auth.md` — pastikan Task 01 benar-benar selesai
- `app/admin/page.tsx` — kondisi halaman admin saat ini
- `components/layout/Header.tsx` — header yang akan direfaktor
- `lib/auth.ts` — helper `getCurrentUserWithRole()` yang akan dipakai di layout admin
- `lib/database/queries.ts` — `getRTProfile()` dan `getFAQs()` yang sudah ada
- `lib/database/types.ts` — tipe baris DB yang sudah ada
- `docs/DATABASE_SCHEMA.md` — referensi tabel dan enum

---

## Requirements

### 1. Layout Admin Terpusat

Buat `app/admin/layout.tsx` sebagai layout khusus untuk semua route `/admin/**`.
Layout ini menangani:
- Auth check (`getCurrentUserWithRole()`) — redirect ke `/login` jika tidak ada session,
  redirect ke `/unauthorized` jika role `warga`.
- Render sidebar + topbar yang konsisten di semua halaman admin.
- Tidak perlu auth check ulang di masing-masing halaman child (cukup di layout).

### 2. Topbar Admin

Buat komponen `components/admin/AdminTopbar.tsx`:
- Logo / nama aplikasi di kiri (link ke `/admin`).
- Email user yang sedang login.
- Badge role (`rt_admin` / `super_admin`).
- Tombol Logout (gunakan server action `app/actions/auth.ts` yang sudah ada).

### 3. Sidebar Navigasi

Buat komponen `components/admin/AdminSidebar.tsx`:
- Navigasi ke semua route admin.
- Item aktif ditandai secara visual (background/warna berbeda).
- Gunakan `usePathname()` dari `next/navigation` untuk deteksi active route.
- Item navigasi:

| Label | Icon | Route |
|---|---|---|
| Overview | 🏠 | `/admin` |
| Profil RT | 🏘️ | `/admin/profile` |
| FAQ | ❓ | `/admin/faqs` |
| Template Surat | 📋 | `/admin/letter-templates` |
| Permintaan Surat | 📄 | `/admin/letter-requests` |
| Laporan Keluhan | 📢 | `/admin/complaints` |
| AI Audit Log | 🔍 | `/admin/ai-audit-logs` |

### 4. Route dan Halaman Admin

Buat halaman untuk setiap route berikut:

| Route | File | Konten |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Overview: stats ringkasan, info user login |
| `/admin/profile` | `app/admin/profile/page.tsx` | Data profil RT dari Supabase (read-only) |
| `/admin/faqs` | `app/admin/faqs/page.tsx` | List FAQ aktif dari Supabase (read-only) |
| `/admin/letter-templates` | `app/admin/letter-templates/page.tsx` | Empty state placeholder |
| `/admin/letter-requests` | `app/admin/letter-requests/page.tsx` | Empty state placeholder |
| `/admin/complaints` | `app/admin/complaints/page.tsx` | Empty state placeholder |
| `/admin/ai-audit-logs` | `app/admin/ai-audit-logs/page.tsx` | Empty state placeholder |

### 5. Halaman Overview (`/admin`)

Tampilkan:
- Sapaan: "Selamat datang, {email}" dengan badge role.
- Grid stats: FAQ Aktif (angka nyata dari DB), Surat Menunggu (—), Keluhan Baru (—),
  Chat Hari Ini (—).
- Shortcut cards ke setiap sub-halaman (menggantikan "coming soon" cards).

### 6. Halaman Profil RT (`/admin/profile`)

Tampilkan data profil RT dari Supabase secara read-only:
- Informasi RT: nama, RW, area, kelurahan, kecamatan, kota, alamat.
- Kontak pengurus: ketua, sekretaris, bendahara, keamanan.
- Empty state jika data tidak ditemukan.
- Tidak ada form edit.

### 7. Halaman FAQ (`/admin/faqs`)

Tampilkan list FAQ aktif dari Supabase secara read-only:
- Setiap item menampilkan: pertanyaan, jawaban, kategori, status aktif.
- Empty state jika belum ada FAQ.
- Tidak ada tombol tambah/edit/hapus.
- Badge kategori untuk setiap FAQ.

### 8. Halaman Placeholder Lainnya

Untuk `/admin/letter-templates`, `/admin/letter-requests`, `/admin/complaints`,
dan `/admin/ai-audit-logs`:
- Tampilkan empty state dengan ikon, judul, dan keterangan singkat.
- Sertakan pesan "Fitur ini akan tersedia di task berikutnya."
- Tidak ada data, tidak ada form.

---

## Acceptance Criteria

- [ ] `app/admin/layout.tsx` ada dan menangani auth check serta render layout.
- [ ] Sidebar menampilkan semua 7 item navigasi.
- [ ] Item navigasi aktif ditandai secara visual sesuai halaman yang sedang dibuka.
- [ ] Topbar menampilkan email user, badge role, dan tombol logout yang berfungsi.
- [ ] Semua 7 route admin bisa dibuka tanpa error.
- [ ] Role `warga` tetap tidak bisa mengakses `/admin` dan semua sub-route-nya.
- [ ] `/admin/profile` menampilkan data RT dari Supabase (bukan hardcode).
- [ ] `/admin/faqs` menampilkan list FAQ dari Supabase (bukan hardcode).
- [ ] Halaman placeholder menampilkan empty state yang informatif.
- [ ] Logout dari topbar berfungsi dan redirect ke `/login`.
- [ ] `npm run dev` berjalan tanpa error.
- [ ] `npm run type-check` lulus tanpa error.

---

## Out of Scope

Jangan implementasikan di Task 02:
- Create / edit / delete data apapun (profil RT, FAQ, surat, keluhan).
- Form input apapun.
- Logika AI atau chat simulator.
- PDF atau ekspor dokumen.
- Complaint workflow (status update, assign, dll).
- Perubahan schema database atau migration baru.
- Fitur search atau filter.
- Pagination — tampilkan semua data yang ada, jumlahnya masih sedikit.
- Mobile responsive yang kompleks — cukup fungsional di desktop.

---

## UI Guidelines

- Gunakan Tailwind CSS yang sudah ada — jangan tambahkan library UI baru.
- Sidebar lebar **240px**, fixed di kiri, full height.
- Topbar tinggi **64px**, sticky di atas, full width.
- Konten utama mengisi sisa ruang di kanan sidebar, di bawah topbar.
- Warna active sidebar item: `bg-blue-50 text-blue-700`.
- Warna default sidebar item: `text-gray-600 hover:bg-gray-100`.
- Gunakan komponen `Button` yang sudah ada di `components/ui/Button.tsx` jika diperlukan.
- Pertahankan style `card`, `section-title`, dan badge yang sudah ada di `styles/globals.css`.
- Tidak perlu animasi atau transisi — prioritaskan kesederhanaan.

---

## Test Plan

Setelah implementasi, lakukan pengujian berikut secara manual:

1. **Navigasi sidebar** — klik setiap item, pastikan route benar dan item aktif ter-highlight.
2. **Proteksi route** — logout, lalu akses `/admin/faqs` langsung → harus redirect ke `/login`.
3. **Role warga** — login sebagai warga, akses `/admin/profile` → harus redirect ke `/unauthorized`.
4. **Data nyata** — `/admin/profile` dan `/admin/faqs` menampilkan data dari Supabase (bukan placeholder hardcode).
5. **Logout** — klik logout di topbar → redirect ke `/login`, session terhapus.
6. **Empty state** — buka `/admin/letter-requests` → tampil empty state yang bersih.

---

## Status

Completed
