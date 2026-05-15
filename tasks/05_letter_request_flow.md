# Task 05: Letter Request Flow

## Goal

Mengimplementasikan workflow permintaan surat dari chat warga hingga admin review.
Warga meminta surat melalui `/chat`, sistem mengumpulkan data wajib secara bertahap
(slot filling), membuat draft teks, lalu admin RT menyetujui atau menolak.
AI/asisten tidak boleh menyetujui surat — keputusan final tetap di admin RT.

---

## Context

Task 01–04 selesai: database terkoneksi, auth berjalan, admin dashboard lengkap,
FAQ CRUD berfungsi, chat simulator aktif dengan rule-based classifier.

Kondisi saat ini yang relevan:
- `app/chat/actions.ts` — intent `request_letter` mengembalikan static placeholder response.
  Ini yang akan diganti dengan slot filling flow yang sesungguhnya.
- `app/admin/letter-requests/page.tsx` — hanya `ComingSoonCard`. Ini yang akan di-overhaul.
- Tabel `letter_templates` ada di schema tapi **belum ada data**. Perlu ditambah seed.
- Tabel `letter_requests` ada di schema, sudah punya semua kolom yang diperlukan.
- `app/chat/ChatInterface.tsx` saat ini track `sessionId` dan `letterRequestId` belum ada.

**Tidak perlu mengubah schema database** — semua kolom yang dibutuhkan sudah tersedia:
`letter_templates.required_fields` (jsonb), `letter_requests.form_data` (jsonb),
`letter_requests.draft_text`, `letter_requests.status`, `letter_requests.admin_notes`.

---

## Files to Read Sebelum Implementasi

- `CLAUDE.md` — aturan development dan security rules
- `docs/MVP_SCOPE_v1.md` — scope fitur surat MVP
- `docs/USER_STORIES.md` — US-004 Request Letter Draft
- `docs/AI_GUARDRAILS.md` — AI tidak boleh approve surat, hanya draft
- `docs/DATABASE_SCHEMA.md` — struktur tabel letter_templates dan letter_requests
- `tasks/05_letter_request_flow.md` — task ini sendiri
- `app/chat/actions.ts` — kondisi action saat ini (akan diextend)
- `app/chat/ChatInterface.tsx` — perlu tambah state `letterRequestId`
- `lib/database/queries.ts` — query helpers yang ada
- `lib/database/types.ts` — tipe DB yang ada
- `app/admin/letter-requests/page.tsx` — halaman yang akan di-overhaul
- `supabase/seed.sql` — lihat format seed, akan ditambah template surat

---

## Requirements

### 1. Seed Data Letter Templates

Tambahkan seed SQL untuk 3 template surat. Jalankan manual via Supabase SQL Editor
(sama seperti seed awal). Simpan juga di `supabase/seed.sql` sebagai dokumentasi.

**Template 1 — Surat Pengantar Domisili**
```
letter_type  : domisili
required_fields: ["nama_lengkap", "nik", "nomor_kk", "alamat", "keperluan"]
template_body  : (lihat Requirement 6)
```

**Template 2 — Surat Pengantar SKCK**
```
letter_type  : skck
required_fields: ["nama_lengkap", "nik", "tempat_lahir", "tanggal_lahir",
                  "jenis_kelamin", "agama", "pekerjaan", "alamat", "keperluan"]
template_body  : (lihat Requirement 6)
```

**Template 3 — Surat Keterangan Usaha (SKU)**
```
letter_type  : sku
required_fields: ["nama_lengkap", "nik", "nama_usaha", "jenis_usaha",
                  "alamat_usaha", "alamat"]
template_body  : (lihat Requirement 6)
```

### 2. State Baru di Chat Client

Tambahkan state `letterRequestId: string | null` di `app/chat/ChatInterface.tsx`,
sejajar dengan `sessionId`. State ini melacak apakah ada permintaan surat aktif dalam
sesi chat. Kirim ke `sendMessage` di setiap pesan, terima kembali dari response.

### 3. Deteksi Jenis Surat dari Chat

Di `app/chat/actions.ts`, saat intent `request_letter`:

1. Periksa apakah sudah ada `letterRequestId` aktif di parameter.
2. Jika belum ada — deteksi jenis surat dari pesan:
   - Pesan mengandung `"domisili"` → `letter_type = 'domisili'`
   - Pesan mengandung `"skck"` → `letter_type = 'skck'`
   - Pesan mengandung `"sku"`, `"usaha"`, atau `"keterangan usaha"` → `letter_type = 'sku'`
   - Tidak jelas → minta warga memilih:
     ```
     Baik, saya siap membantu membuat surat pengantar 📄

     Silakan pilih jenis surat yang Anda butuhkan:
     1. Surat Pengantar Domisili
     2. Surat Pengantar SKCK
     3. Surat Keterangan Usaha (SKU)

     Balas dengan nama jenis surat atau nomornya.
     ```
3. Jika jenis surat terdeteksi — buat record `letter_requests` di Supabase:
   ```
   rt_id    = DEFAULT_RT_ID
   letter_type = <jenis surat>
   status   = 'collecting_data'
   form_data = {}
   ```
   Kembalikan `letterRequestId` ke client.

### 4. Slot Filling Sederhana

Saat `letterRequestId` sudah ada (ada surat aktif), setiap pesan masuk diproses
sebagai pengisian data — bukan re-classify intent.

**Parsing format `key: value`:**
```
nama_lengkap: Budi Santoso
nik: 3578123456780001
alamat: Blok C No. 12
```

Buat fungsi `parseFieldValues(message: string): Record<string, string>` di
`lib/ai/field-parser.ts`. Pecah message per baris, cari pola `key: value` (case
insensitive, trim whitespace). Abaikan baris yang tidak cocok pola.

Setelah parsing:
1. Merge hasil parse ke `form_data` yang sudah ada di `letter_requests`.
2. Update `form_data` di Supabase.
3. Bandingkan `form_data` dengan `required_fields` dari template:
   - Jika masih ada field yang kosong → minta field yang kurang.
   - Jika semua field lengkap → lanjut ke Requirement 5.

Response saat masih ada field kurang:
```
Terima kasih. Masih ada data yang belum saya terima:

• {field_1}
• {field_2}

Silakan kirim dengan format:
{field_1}: [isi di sini]
{field_2}: [isi di sini]
```

### 5. Generate Draft dan Perbarui Status

Saat semua `required_fields` sudah terpenuhi:

1. Ambil `template_body` dari `letter_templates`.
2. Substitusi `{field_name}` dengan nilai dari `form_data`.
3. Tambahkan header/footer standar (tanggal, nama RT, nomor surat placeholder).
4. Simpan hasilnya ke `letter_requests.draft_text`.
5. Update `letter_requests.status` → `'waiting_admin_review'`.

Response ke warga:
```
Draft surat Anda sudah dibuat ✅

Permintaan surat telah diteruskan ke pengurus RT untuk divalidasi.
Pengurus akan meninjau dan menghubungi Anda jika diperlukan.

Status: Menunggu persetujuan admin RT
```

Setelah ini, `letterRequestId` di client di-reset ke `null` (surat selesai dikumpulkan).

### 6. Template Body

Simpan di kolom `template_body` sebagai string dengan placeholder `{field_name}`.

**Domisili:**
```
SURAT KETERANGAN DOMISILI
Nomor: -/-/RT03/RW05/{TAHUN}

Yang bertanda tangan di bawah ini Ketua RT 03 RW 05 Perumahan Griya Damai,
Kelurahan Keputih, Kecamatan Sukolilo, Kota Surabaya, menerangkan bahwa:

Nama Lengkap : {nama_lengkap}
NIK          : {nik}
No. KK       : {nomor_kk}
Alamat       : {alamat}

adalah benar-benar warga RT 03 RW 05 Perumahan Griya Damai.

Surat keterangan ini diberikan untuk keperluan: {keperluan}

Surabaya, {TANGGAL}
Ketua RT 03 RW 05

Bapak Ahmad
```

**SKCK:**
```
SURAT PENGANTAR PERMOHONAN SKCK
Nomor: -/-/RT03/RW05/{TAHUN}

Yang bertanda tangan di bawah ini Ketua RT 03 RW 05 Perumahan Griya Damai
menerangkan bahwa:

Nama Lengkap  : {nama_lengkap}
NIK           : {nik}
Tempat, Tgl Lahir : {tempat_lahir}, {tanggal_lahir}
Jenis Kelamin : {jenis_kelamin}
Agama         : {agama}
Pekerjaan     : {pekerjaan}
Alamat        : {alamat}

adalah warga RT 03 RW 05 Perumahan Griya Damai yang berkelakuan baik dan tidak
pernah terlibat tindak kriminal selama berdomisili di wilayah ini.

Surat ini dibuat untuk keperluan: {keperluan}

Surabaya, {TANGGAL}
Ketua RT 03 RW 05

Bapak Ahmad
```

**SKU:**
```
SURAT KETERANGAN USAHA
Nomor: -/-/RT03/RW05/{TAHUN}

Yang bertanda tangan di bawah ini Ketua RT 03 RW 05 Perumahan Griya Damai
menerangkan bahwa:

Nama Lengkap  : {nama_lengkap}
NIK           : {nik}
Alamat        : {alamat}

adalah benar-benar menjalankan usaha dengan keterangan:

Nama Usaha    : {nama_usaha}
Jenis Usaha   : {jenis_usaha}
Alamat Usaha  : {alamat_usaha}

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.

Surabaya, {TANGGAL}
Ketua RT 03 RW 05

Bapak Ahmad
```

Placeholder `{TANGGAL}` dan `{TAHUN}` diisi otomatis saat generate draft
(`new Date()` diformat ke locale Indonesia).

### 7. Update Signature `sendMessage`

Perpanjang signature di `app/chat/actions.ts`:

```typescript
export async function sendMessage(
  message: string,
  sessionId: string | null,
  letterRequestId: string | null   // ← baru
): Promise<{
  reply: string
  intent: AiIntent
  sessionId: string
  letterRequestId: string | null   // ← baru
}>
```

### 8. Halaman `/admin/letter-requests`

Overhaul `app/admin/letter-requests/page.tsx`:
- Tampilkan list semua `letter_requests` milik RT (semua status).
- Setiap item menampilkan: jenis surat, status badge, waktu dibuat, link ke detail.
- Status badge: `collecting_data` abu, `waiting_admin_review` kuning, `approved` hijau,
  `rejected` merah, `completed` biru.
- Empty state jika belum ada permintaan.

### 9. Halaman Detail `/admin/letter-requests/[id]`

Buat `app/admin/letter-requests/[id]/page.tsx`:
- Tampilkan semua data: jenis surat, status, form_data, draft_text.
- Render `draft_text` dalam box dengan font monospace agar mudah dibaca.
- Jika status `waiting_admin_review`:
  - Tombol **Setujui** → ubah status ke `approved`.
  - Tombol **Tolak** → form dengan textarea untuk `admin_notes`, ubah status ke `rejected`.
- Jika status lain: tampilkan status dan catatan admin jika ada.

### 10. Server Actions Admin

Buat `app/admin/letter-requests/actions.ts`:
- `approveLetter(id: string)` — update status ke `approved`.
- `rejectLetter(id: string, notes: string)` — update status ke `rejected`, simpan `admin_notes`.
- Keduanya harus validasi auth dan memastikan role bukan `warga`.
- Keduanya memanggil `revalidatePath('/admin/letter-requests')` setelah berhasil.

---

## Acceptance Criteria

- [ ] Seed 3 `letter_templates` (domisili, skck, sku) ada di Supabase.
- [ ] Dari `/chat`, kirim "Saya mau buat surat SKCK" → sistem mendeteksi jenis surat SKCK.
- [ ] Sistem membuat record `letter_requests` dengan status `collecting_data`.
- [ ] Sistem meminta field SKCK yang belum diisi satu per satu atau dalam daftar.
- [ ] Setelah semua field diisi → `draft_text` terbentuk dari template + data.
- [ ] Status berubah ke `waiting_admin_review`.
- [ ] `letterRequestId` di-reset di client setelah surat selesai dikumpulkan.
- [ ] Jika jenis surat tidak jelas → sistem meminta warga memilih.
- [ ] `/admin/letter-requests` menampilkan list permintaan surat dengan status badge.
- [ ] `/admin/letter-requests/[id]` menampilkan detail + draft text + tombol approve/reject.
- [ ] Admin bisa approve → status berubah ke `approved`.
- [ ] Admin bisa reject dengan catatan → status berubah ke `rejected`.
- [ ] Warga tidak bisa akses `/admin/letter-requests` (ditangani layout).
- [ ] Tidak ada LLM API dipanggil.
- [ ] Tidak ada PDF generation.
- [ ] `npm run type-check` lulus tanpa error.
- [ ] `npm run dev` berjalan tanpa error.

---

## Out of Scope

Jangan implementasikan di Task 05:
- LLM extraction (Claude/OpenAI/Gemini) untuk parsing data warga.
- WhatsApp API.
- PDF generation atau ekspor dokumen.
- Tanda tangan digital.
- OCR KTP/KK.
- Pembayaran atau iuran.
- Integrasi kelurahan.
- Notifikasi push/email ke warga saat status berubah.
- Complaint workflow (Task 06).
- Perubahan schema database — semua kolom sudah tersedia.

---

## UI Guidelines

- Konsisten dengan dashboard Task 02 — gunakan style `card`, `section-title`, badge.
- Status badge warna: abu (collecting_data), kuning (waiting_admin_review),
  hijau (approved), merah (rejected), biru (completed).
- `draft_text` di halaman detail: tampilkan dalam `<pre>` atau box dengan
  `font-mono text-sm bg-gray-50 border rounded-lg p-4 whitespace-pre-wrap`.
- Form reject: textarea sederhana untuk catatan + tombol konfirmasi.
- Tombol Setujui: `bg-green-600`, tombol Tolak: `bg-red-600`.
- Gunakan empty state dan loading state.

---

## Test Plan

1. **Login sebagai warga**, buka `/chat`.
2. Kirim `"Saya mau buat surat SKCK"` → sistem mendeteksi jenis surat, meminta field pertama.
3. Isi field satu per satu dengan format `key: value`:
   ```
   nama_lengkap: Budi Santoso
   nik: 3578123456780001
   tempat_lahir: Surabaya
   tanggal_lahir: 1995-01-01
   jenis_kelamin: Laki-laki
   agama: Islam
   pekerjaan: Karyawan Swasta
   alamat: Blok C No. 12
   keperluan: Pengurusan SKCK
   ```
4. Setelah semua field → sistem memberi tahu draft selesai, status `waiting_admin_review`.
5. **Login sebagai rt_admin**, buka `/admin/letter-requests` → permintaan Budi muncul.
6. Klik permintaan → halaman detail terbuka, `draft_text` tampil lengkap.
7. Klik **Setujui** → status berubah ke `approved`.
8. Buat permintaan kedua (domisili), buka detail di admin, klik **Tolak** dengan catatan
   "Data NIK tidak sesuai" → status berubah ke `rejected`, catatan tersimpan.
9. Buka `/chat` sebagai warga, kirim "usaha" → sistem mendeteksi jenis surat SKU.
10. **Login sebagai warga**, akses `/admin/letter-requests` → redirect ke `/unauthorized`.

---

## Status

Completed
