# Task 03: FAQ Knowledge Base CRUD

## Goal

Mengubah halaman `/admin/faqs` dari tampilan read-only menjadi halaman manajemen
penuh. Admin RT dapat menambah, mengedit, mengaktifkan/menonaktifkan, dan menghapus
FAQ sehingga knowledge base siap dipakai sebelum integrasi AI dimulai.

---

## Context

Task 01 selesai: Supabase database terkoneksi, seed data ada, auth dan role-based
access berfungsi.

Task 02 selesai: Admin dashboard terstruktur, semua route `/admin/**` terlindungi,
sidebar/topbar berfungsi, `/admin/faqs` sudah menampilkan list FAQ secara read-only.

Kondisi `/admin/faqs` saat ini (`app/admin/faqs/page.tsx`):
- Server Component, hanya memanggil `getFAQs()` dan render list.
- Tidak ada tombol tambah, edit, atau hapus.
- Badge "Read-only" di header halaman.
- Hanya menampilkan FAQ dengan `is_active = true`.

Tabel `faqs` di Supabase (dari `supabase/migrations/001_initial_schema.sql`):
```
id          uuid, primary key
rt_id       uuid, FK ke rts(id)
question    text, not null
answer      text, not null
category    text, nullable
is_active   boolean, default true
created_at  timestamptz
updated_at  timestamptz
```

Seed data sudah ada: 4 FAQ aktif untuk RT 03
(`rt_id = '11111111-1111-1111-1111-111111111111'`).

---

## Files to Read Sebelum Implementasi

- `CLAUDE.md` — aturan umum development dan security rules
- `docs/MVP_SCOPE_v1.md` — pastikan fitur masuk dalam scope
- `docs/USER_STORIES.md` — US-002 Manage FAQ
- `docs/DATABASE_SCHEMA.md` — referensi tabel dan enum
- `tasks/03_faq_knowledge_base.md` — task ini sendiri
- `app/admin/faqs/page.tsx` — kondisi halaman saat ini (akan di-overhaul)
- `lib/database/queries.ts` — query helper yang sudah ada
- `lib/database/types.ts` — `FaqRow` yang sudah ada
- `lib/auth.ts` — `getCurrentUserWithRole()` jika diperlukan
- `app/admin/layout.tsx` — auth sudah ditangani layout, page tidak perlu auth check ulang

---

## Requirements

### 1. List FAQ

Tampilkan semua FAQ milik RT (aktif dan nonaktif), bukan hanya yang aktif.
Tampilkan badge status `Aktif` / `Nonaktif` di setiap item.
Urutkan: aktif lebih dulu, lalu berdasarkan `created_at` ascending.

### 2. Tambah FAQ Baru

Sediakan tombol **+ Tambah FAQ** di header halaman.
Form create berisi field:
- `question` — text area, wajib diisi
- `answer` — text area, wajib diisi
- `category` — text input, opsional (contoh: iuran, kebersihan, keamanan, surat)
- `is_active` — checkbox, default `true`

Saat disimpan, `rt_id` diisi otomatis dari `DEFAULT_RT_ID` yang sudah ada di
`lib/database/queries.ts`.

### 3. Edit FAQ

Setiap item FAQ punya tombol **Edit**.
Form edit menampilkan data yang sudah ada dan memperbolehkan perubahan pada:
- `question`
- `answer`
- `category`
- `is_active`

### 4. Toggle Aktif / Nonaktif

Sediakan tombol toggle cepat di setiap item (tanpa perlu buka form edit penuh).
Mengubah `is_active` langsung di database.

### 5. Hapus FAQ

Sediakan tombol **Hapus** di setiap item.
Gunakan konfirmasi sederhana sebelum menghapus (misalnya `window.confirm`).
Hapus permanen (`DELETE`) karena data FAQ tidak memiliki relasi kritis ke tabel lain
di MVP ini. Soft delete (toggle `is_active`) sudah tersedia sebagai alternatif.

### 6. Server Actions

Semua operasi write (create, update, toggle, delete) harus menggunakan
**Next.js Server Actions** (`'use server'`) — bukan API route.

Buat file `app/admin/faqs/actions.ts`:
- `createFaq(formData: FormData)` — insert FAQ baru
- `updateFaq(id: string, formData: FormData)` — update FAQ
- `toggleFaqActive(id: string, isActive: boolean)` — toggle is_active
- `deleteFaq(id: string)` — hapus FAQ

Setiap action harus:
- Memvalidasi session dengan `getCurrentUserWithRole()`.
- Memastikan role adalah `rt_admin` atau `super_admin`.
- Mengembalikan error message jika gagal (jangan crash).
- Memanggil `revalidatePath('/admin/faqs')` setelah operasi berhasil.

### 7. Form UI

Pilihan implementasi form — **gunakan halaman terpisah** (bukan modal) untuk
menghindari kompleksitas state management di Server Component:

- `/admin/faqs/new` — halaman form tambah FAQ baru
- `/admin/faqs/[id]/edit` — halaman form edit FAQ

Halaman form:
- Input validation: `question` dan `answer` wajib diisi (minimal 3 karakter).
- Tampilkan error jika validasi gagal atau action gagal.
- Tombol **Simpan** dan **Batal** (kembali ke `/admin/faqs`).
- Loading state saat form di-submit.

### 8. State & Feedback

Setiap operasi harus punya feedback yang jelas:
- **Loading state** — tombol disabled, spinner kecil.
- **Empty state** — jika belum ada FAQ sama sekali (tampilkan ajakan tambah FAQ).
- **Error state** — pesan error inline jika action gagal.
- **Success feedback** — setelah create/edit/delete, redirect kembali ke list dengan
  data terbaru (via `revalidatePath`).

---

## Acceptance Criteria

- [ ] `rt_admin`/`super_admin` bisa menambah FAQ baru dan FAQ muncul di list.
- [ ] `rt_admin`/`super_admin` bisa mengedit FAQ yang sudah ada.
- [ ] Toggle aktif/nonaktif bekerja dan status FAQ berubah di database.
- [ ] Hapus FAQ menghilangkan item dari list.
- [ ] List FAQ menampilkan data terbaru tanpa perlu refresh manual.
- [ ] FAQ baru terhubung ke `rt_id` yang benar (bukan null).
- [ ] Form validasi menolak `question` atau `answer` yang kosong.
- [ ] Warga tidak bisa mengakses `/admin/faqs` (ditangani layout, tidak berubah).
- [ ] Semua operasi write menggunakan Server Actions, bukan fetch/API route manual.
- [ ] `npm run dev` berjalan tanpa error.
- [ ] `npm run type-check` lulus tanpa error.

---

## Out of Scope

Jangan implementasikan di Task 03:
- AI answering atau RAG (retrieval-augmented generation).
- Embedding atau vector search (pgvector).
- Chat simulator update.
- WhatsApp integration.
- Payment atau iuran.
- Surat atau dokumen.
- Complaint workflow.
- Bulk import atau export CSV.
- Fitur search atau filter FAQ.
- Pagination (data masih sedikit).
- Perubahan schema database — tabel `faqs` sudah cukup untuk task ini.

---

## UI Guidelines

- Gunakan Tailwind CSS yang sudah ada — jangan tambahkan library UI baru.
- Konsisten dengan style `card`, `section-title`, dan badge dari `styles/globals.css`.
- Tombol aksi kecil di setiap baris: Edit, Toggle aktif, Hapus — jangan terlalu ramai.
- Form menggunakan layout satu kolom, sederhana dan mudah dipindai.
- Badge status: `Aktif` → hijau (`bg-green-100 text-green-700`), `Nonaktif` → abu-abu
  (`bg-gray-100 text-gray-500`).
- Gunakan komponen `Button` dari `components/ui/Button.tsx` untuk tombol form.
- Pesan error: merah inline di bawah field atau di atas form.
- Jangan gunakan modal/dialog — gunakan halaman terpisah untuk form.

---

## Test Plan

Lakukan pengujian manual berikut setelah implementasi:

1. **Login sebagai rt_admin**, buka `/admin/faqs`.
2. **Tambah FAQ** — klik "+ Tambah FAQ", isi form, simpan → FAQ muncul di list.
3. **Validasi form** — coba simpan dengan `question` kosong → muncul pesan error.
4. **Edit FAQ** — klik Edit pada salah satu FAQ, ubah jawaban, simpan → perubahan tampil.
5. **Toggle nonaktifkan** — klik toggle pada FAQ aktif → badge berubah jadi "Nonaktif".
6. **Toggle aktifkan kembali** — klik toggle pada FAQ nonaktif → badge kembali "Aktif".
7. **Hapus FAQ** — klik Hapus, konfirmasi → FAQ hilang dari list.
8. **Empty state** — hapus semua FAQ → tampil pesan "Belum ada FAQ" dengan ajakan tambah.
9. **Unauthorized** — login sebagai warga, akses `/admin/faqs` → redirect ke `/unauthorized`.

---

## Status

Completed
