# Task 06: Complaint Workflow

## Goal

Mengimplementasikan workflow laporan keluhan warga dari chat hingga admin menindaklanjuti.
Saat warga mengirim keluhan di `/chat`, sistem mengekstrak kategori, lokasi, dan urgensi
secara rule-based (tanpa LLM), lalu menyimpan ke `complaint_reports`. Admin RT dapat
melihat list laporan, membuka detail, dan mengubah status secara manual. AI mencatat
laporan secara netral — tidak menyalahkan pihak tertentu, tidak mengambil keputusan final.

---

## Context

Task 01–05 selesai: database, auth, dashboard, FAQ CRUD, chat simulator, dan letter
request flow semuanya berfungsi.

Kondisi saat ini yang relevan:
- `app/chat/actions.ts` — intent `submit_complaint` masih mengembalikan static placeholder
  `COMPLAINT_RESPONSE`. Ini yang akan diganti dengan pembuatan `complaint_reports` sungguhan.
- `app/admin/complaints/page.tsx` — hanya `ComingSoonCard`. Ini yang akan di-overhaul.
- Tabel `complaint_reports` ada di schema dengan semua kolom yang dibutuhkan:
  `category`, `description`, `location`, `urgency`, `status`, `admin_notes`, `user_id`.
- `ComplaintReportRow` sudah ada di `lib/database/types.ts`.
- `getComplaintReports()` sudah ada di `lib/database/queries.ts` — perlu tambah
  `getComplaintReport(id)` untuk detail dan pastikan `getComplaintReports` mengembalikan
  semua status (saat ini sudah tanpa filter status).

**Tidak perlu mengubah schema database** — semua kolom sudah tersedia.

Perbedaan utama dengan letter flow (Task 05):
- Complaint adalah **single-turn** — satu pesan sudah cukup untuk membuat laporan.
- Tidak perlu state `complaintId` di ChatInterface (tidak ada multi-turn data collection).
- Complaint dibuat langsung saat intent terdeteksi, bukan menunggu data lengkap.
- Jika lokasi tidak terdeteksi, complaint tetap dibuat dengan `location = null`.

---

## Files to Read Sebelum Implementasi

- `CLAUDE.md` — aturan development, terutama AI harus netral
- `docs/MVP_SCOPE_v1.md` — scope fitur complaint MVP
- `docs/USER_STORIES.md` — US-005 Submit Complaint
- `docs/AI_GUARDRAILS.md` — AI tidak boleh menyalahkan pihak tertentu
- `docs/DATABASE_SCHEMA.md` — struktur tabel complaint_reports dan enum
- `tasks/06_complaint_flow.md` — task ini sendiri
- `app/chat/actions.ts` — kondisi saat ini, bagian `submit_complaint` (akan diganti)
- `lib/database/types.ts` — `ComplaintReportRow` yang sudah ada
- `lib/database/queries.ts` — `getComplaintReports()` yang sudah ada
- `app/admin/complaints/page.tsx` — halaman yang akan di-overhaul
- `lib/ai/classifier.ts` — referensi pola rule-based yang sudah ada

---

## Requirements

### 1. Rule-Based Complaint Extractor

Buat `lib/ai/complaint-extractor.ts` — fungsi pure, tidak ada DB/API call:

```typescript
export type ComplaintExtraction = {
  category: ComplaintCategory
  urgency: 'tinggi' | 'sedang'
  location: string | null
}

export function extractComplaint(message: string): ComplaintExtraction
```

**Rule kategori** (case-insensitive, cek keyword dalam pesan):

| Kategori | Keywords |
|---|---|
| `fasilitas_umum` | lampu, jalan, portal, pos, taman, got, selokan, pagar, jembatan, halte |
| `keamanan` | maling, kehilangan, satpam, keributan, mencurigakan, pencurian, rampok |
| `kebersihan` | sampah, bau, kotor, limbah, comberan, berantakan |
| `administrasi` | administrasi, data, iuran, tagihan, pendataan |
| `sosial` | tetangga, bising, berisik, acara, parkir, kebisingan |
| `lainnya` | tidak cocok di atas |

Prioritas kategori: `keamanan > fasilitas_umum > kebersihan > administrasi > sosial > lainnya`.

**Rule urgency:**
- `tinggi` — pesan mengandung: darurat, bahaya, kebakaran, banjir, maling, kecelakaan, parah
- `sedang` — default untuk semua kasus lain

**Rule location extraction** (gunakan regex sederhana):
- Cocokkan pola `blok [A-Z0-9]+` (case-insensitive) → ambil sebagai location
- Cocokkan pola `depan \w+`, `belakang \w+`, `dekat \w+`, `di \w+` → ambil frasa sebagai location
- Tangkap nama tempat umum: "pos satpam", "taman", "gerbang", "masjid"
- Jika tidak ada yang cocok → `location = null`

### 2. Chat Flow: Complaint Submission

Di `app/chat/actions.ts`, ganti static `COMPLAINT_RESPONSE` dengan handler sungguhan
saat intent `submit_complaint` terdeteksi:

1. Panggil `extractComplaint(message)` untuk dapatkan `category`, `urgency`, `location`.
2. Buat record `complaint_reports` di Supabase:
   ```
   rt_id       = DEFAULT_RT_ID
   user_id     = null (MVP: belum ada auth di chat)
   category    = <hasil ekstraksi>
   description = <pesan asli warga>
   location    = <hasil ekstraksi, atau null>
   urgency     = <hasil ekstraksi>
   status      = 'new'
   ```
3. Jika Supabase tidak tersedia: catat sebagai pesan lokal saja, jangan crash.
4. Kembalikan response konfirmasi ke warga (lihat Requirement 3).
5. Simpan `chat_messages` dan `ai_audit_logs` seperti biasa.

### 3. Response Konfirmasi ke Warga

Setelah laporan berhasil dibuat:

```
Laporan Anda telah kami terima dan dicatat 📢

Ringkasan laporan:
• Kategori  : {kategori_label}
• Lokasi    : {lokasi atau "Tidak disebutkan"}
• Urgensi   : {urgensi_label}

Laporan ini akan segera ditinjau oleh pengurus RT.
Untuk keperluan mendesak, hubungi keamanan di 0812-0000-0000.

ID Laporan : {8 karakter pertama UUID complaint}
```

Jika Supabase tidak tersedia (mode offline):

```
Laporan Anda telah kami catat sementara 📢

Untuk keperluan mendesak, silakan hubungi pengurus RT atau
keamanan setempat secara langsung di 0812-0000-0000.
```

Nada respons harus **netral** — tidak menyebut nama pihak yang dilaporkan, tidak
menyatakan laporan benar atau salah, tidak berjanji penyelesaian dalam waktu tertentu.

### 4. Tambah Query Helper

Tambahkan `getComplaintReport(id: string)` di `lib/database/queries.ts` untuk
halaman detail admin. (Fungsi `getComplaintReports()` sudah ada, tidak perlu diubah.)

### 5. Halaman `/admin/complaints`

Overhaul `app/admin/complaints/page.tsx` menjadi list view:
- Tampilkan semua `complaint_reports` milik RT, urut terbaru di atas.
- Setiap baris: kategori, urgency badge, lokasi (atau "—"), status badge, waktu masuk, link detail.
- Filter visual: tampilkan berapa laporan berstatus `new` di header (badge kuning).
- Empty state jika belum ada laporan.

**Badge urgency:** `tinggi` → merah, `sedang` → kuning, `rendah` → abu.
**Badge status:** `new` kuning, `in_review` biru-muda, `in_progress` biru, `resolved` hijau, `rejected` merah.

### 6. Halaman Detail `/admin/complaints/[id]`

Buat `app/admin/complaints/[id]/page.tsx`:
- Tampilkan semua field: kategori, urgensi, lokasi, deskripsi lengkap, status, waktu, catatan admin.
- Tampilkan `description` dalam box teks yang mudah dibaca (bukan satu baris).
- Jika status bukan `resolved` dan bukan `rejected`:
  - Form update status: `<select>` dengan semua pilihan status.
  - Textarea untuk `admin_notes` (opsional).
  - Tombol **Simpan** → update status dan notes ke Supabase.
- Jika sudah `resolved` atau `rejected`: tampilkan status final dan catatan admin.

### 7. Server Action Admin

Buat `app/admin/complaints/actions.ts`:

```typescript
export async function updateComplaintStatus(
  id: string,
  formData: FormData
): Promise<void>
```

- Ambil `status` dan `admin_notes` dari `formData`.
- Validasi auth: hanya `rt_admin` dan `super_admin`.
- Update `complaint_reports` di Supabase.
- Panggil `revalidatePath('/admin/complaints')`.
- Redirect ke `/admin/complaints`.

### 8. Label Tampilan

Gunakan label Indonesia untuk kategori dan status:

| Kategori DB | Label Tampilan |
|---|---|
| `fasilitas_umum` | Fasilitas Umum |
| `keamanan` | Keamanan |
| `kebersihan` | Kebersihan |
| `administrasi` | Administrasi |
| `sosial` | Sosial |
| `lainnya` | Lainnya |

| Status DB | Label Tampilan |
|---|---|
| `new` | Laporan Baru |
| `in_review` | Sedang Ditinjau |
| `in_progress` | Sedang Diproses |
| `resolved` | Selesai |
| `rejected` | Ditolak |

---

## Acceptance Criteria

- [ ] Kirim "Lampu jalan blok C mati" → complaint dibuat, kategori `fasilitas_umum`.
- [ ] Kirim "Sampah menumpuk di depan pos" → kategori `kebersihan`.
- [ ] Kirim "Ada maling di blok B" → kategori `keamanan`, urgency `tinggi`.
- [ ] `complaint_reports` tersimpan di Supabase dengan status `new`.
- [ ] Response konfirmasi tampil di chat dengan ringkasan laporan.
- [ ] Jika Supabase tidak tersedia, chat tidak crash — muncul response offline.
- [ ] `/admin/complaints` menampilkan list laporan dengan badge status dan urgency.
- [ ] `/admin/complaints/[id]` menampilkan detail lengkap termasuk deskripsi asli.
- [ ] Admin bisa ubah status laporan dari `new` ke `in_progress`.
- [ ] Admin bisa ubah status ke `resolved` dengan catatan.
- [ ] `admin_notes` tersimpan dan tampil di halaman detail.
- [ ] Warga tidak bisa akses `/admin/complaints` (ditangani layout).
- [ ] Tidak ada LLM API.
- [ ] Tidak ada ChatInterface state baru (`complaintId` tidak diperlukan).
- [ ] `npm run type-check` lulus tanpa error.
- [ ] `npm run dev` berjalan tanpa error.

---

## Out of Scope

Jangan implementasikan di Task 06:
- LLM extraction (Claude/OpenAI/Gemini).
- WhatsApp API.
- Push notification atau email otomatis ke warga.
- Upload foto laporan.
- Geolocation atau map.
- Assignment laporan ke petugas tertentu.
- SLA atau deadline otomatis.
- Pembayaran atau iuran.
- Surat atau dokumen.
- PDF generation.
- Multi-turn complaint collection (kecuali implementasinya sederhana).
- Perubahan schema database — semua kolom sudah tersedia.

---

## UI Guidelines

- Konsisten dengan dashboard Task 02 — gunakan style `card`, badge, dan tabel.
- Badge urgency: `tinggi` merah (`bg-red-100 text-red-800`), `sedang` kuning (`bg-yellow-100 text-yellow-800`).
- Badge status: `new` kuning, `in_review` biru-muda, `in_progress` biru, `resolved` hijau, `rejected` merah.
- `description` di halaman detail: tampilkan dalam box `bg-gray-50 rounded-lg p-4 text-sm` agar mudah dibaca.
- Form update status: `<select>` dropdown + textarea notes + tombol Simpan biru.
- Jangan gunakan modal — form update status inline di halaman detail.

---

## Test Plan

1. **Login sebagai warga**, buka `/chat`.
2. Kirim `"Lampu jalan blok C mati sejak kemarin malam"` → muncul konfirmasi laporan dengan kategori Fasilitas Umum, lokasi Blok C.
3. Kirim `"Sampah menumpuk di depan rumah blok B12"` → konfirmasi dengan kategori Kebersihan.
4. Kirim `"Ada orang mencurigakan dekat pos satpam"` → kategori Keamanan, urgency Tinggi.
5. Kirim `"Ada keributan di rumah tetangga"` → kategori Sosial.
6. Verifikasi Supabase Table Editor: `complaint_reports` berisi record baru dengan status `new`.
7. **Login sebagai rt_admin**, buka `/admin/complaints` → list laporan muncul, badge "X Laporan Baru".
8. Klik laporan lampu → detail terbuka, deskripsi asli tampil lengkap.
9. Ubah status ke `in_review`, tambah catatan "Akan dicek besok" → klik Simpan → kembali ke list.
10. Buka laporan lagi → status sudah `in_review`, catatan tersimpan.
11. Ubah status ke `resolved` → kembali ke list, badge laporan baru berkurang.
12. **Login sebagai warga**, akses `/admin/complaints` → redirect ke `/unauthorized`.

---

## Status

Completed
