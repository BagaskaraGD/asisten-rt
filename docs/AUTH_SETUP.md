# Auth Setup Guide

Panduan membuat user test di Supabase Auth dan menghubungkannya ke tabel `users` aplikasi.

---

## Cara Kerja Auth di AsistenRT

AsistenRT menggunakan dua tabel yang terpisah:

- **`auth.users`** (milik Supabase) — menyimpan identitas login (email, password hash, session)
- **`public.users`** (milik aplikasi) — menyimpan profil tambahan dan **role** user

Saat login, sistem membaca email dari `auth.users`, lalu mengambil role dari `public.users`
berdasarkan email yang sama. Jika email tidak ditemukan di `public.users`, akses ditolak.

---

## Langkah 1: Buat User di Supabase Auth

1. Buka Supabase dashboard → **Authentication** → **Users**
2. Klik tombol **Add user** → **Create new user**
3. Isi:
   - **Email**: `admin@rt03.id` (atau email lain sesuai kebutuhan)
   - **Password**: buat password yang kuat (minimal 6 karakter)
   - Pastikan **Auto Confirm User** dicentang agar tidak perlu verifikasi email
4. Klik **Create User**
5. Salin atau catat email yang baru dibuat

---

## Langkah 2: Tambahkan Record di Tabel `users` Aplikasi

Buka **SQL Editor** di Supabase, jalankan query berikut sesuai role yang diinginkan:

### Untuk rt_admin

```sql
insert into users (name, email, role)
values ('Admin RT 03', 'admin@rt03.id', 'rt_admin');
```

### Untuk super_admin

```sql
insert into users (name, email, role)
values ('Super Admin', 'superadmin@asistenrt.id', 'super_admin');
```

### Untuk warga (test akses ditolak)

```sql
insert into users (name, email, role)
values ('Warga Test', 'warga@rt03.id', 'warga');
```

> **Penting**: Email di tabel `users` harus **persis sama** (case-sensitive)
> dengan email yang didaftarkan di Supabase Auth.

---

## Langkah 3: Verifikasi

Buka `http://localhost:3000/login` dan coba login dengan:
- Email: `admin@rt03.id`
- Password: password yang dibuat di Langkah 1

Jika berhasil, akan redirect ke `/admin` dan menampilkan email di header.

---

## Test Skenario

### Test 1: Login sebagai rt_admin

1. Buat user Auth + record `users` dengan role `rt_admin` (lihat Langkah 1 & 2)
2. Buka `/login`, isi email + password yang benar
3. **Ekspektasi**: redirect ke `/admin`, header menampilkan email dan badge role

### Test 2: Login dengan password salah

1. Buka `/login`
2. Isi email yang benar tapi password salah
3. **Ekspektasi**: muncul pesan error "Email atau password salah" — halaman tidak crash

### Test 3: Akses `/admin` tanpa login

1. Pastikan tidak ada session aktif (logout terlebih dahulu)
2. Buka langsung `http://localhost:3000/admin`
3. **Ekspektasi**: otomatis redirect ke `/login`

### Test 4: Unauthorized — login sebagai warga

1. Buat user Auth + record `users` dengan role `warga`
2. Login dengan akun warga tersebut
3. Buka `/admin` (atau klik Masuk Admin)
4. **Ekspektasi**: redirect ke `/unauthorized` — halaman akses ditolak

### Test 5: Logout

1. Login sebagai rt_admin
2. Klik tombol **Logout** di header
3. **Ekspektasi**: session dihapus, redirect ke `/login`

### Test 6: Redirect dari `/login` jika sudah login

1. Login sebagai rt_admin (sudah ada session)
2. Buka langsung `http://localhost:3000/login`
3. **Ekspektasi**: otomatis redirect ke `/admin` — tidak bisa buka login lagi

---

## Troubleshooting

**Login gagal padahal password benar?**
- Pastikan user di Supabase Auth status-nya "Confirmed" (bukan pending)
- Cek apakah "Auto Confirm User" diaktifkan saat membuat user

**Login berhasil tapi redirect ke `/unauthorized`?**
- Pastikan email di tabel `public.users` persis sama dengan email di Supabase Auth
- Cek role di tabel `users` — harus `rt_admin` atau `super_admin` untuk akses `/admin`

**Session tidak terbaca setelah login?**
- Pastikan `middleware.ts` ada di root project (sejajar dengan `app/`)
- Restart dev server: `npm run dev`
