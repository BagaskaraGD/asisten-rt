# Task 08: MVP Testing, Hardening, and Readiness

## Goal

Melakukan testing end-to-end, memperbaiki bug kecil, merapikan error/loading/empty state,
dan memastikan MVP AsistenRT siap untuk demo/pilot terbatas.

---

## Context

Task 01 selesai:
- Supabase database terkoneksi
- Auth dan role-based access berfungsi
- /admin terlindungi

Task 02 selesai:
- Admin dashboard structure selesai
- Route admin lengkap

Task 03 selesai:
- FAQ Knowledge Base CRUD selesai

Task 04 selesai:
- Chat simulator /chat berjalan
- Rule-based intent classifier berjalan
- FAQ matching dari Supabase berjalan
- chat_messages dan ai_audit_logs tersimpan

Task 05 selesai:
- Letter request flow berjalan
- Warga bisa membuat permintaan surat dari chat
- Slot filling sederhana berbasis required_fields berjalan
- Admin bisa approve/reject permintaan surat

Task 06 selesai:
- Complaint workflow berjalan
- Warga bisa membuat laporan dari chat
- Admin bisa melihat, update status, dan memberi admin_notes

Task 07 selesai:
- Gemini integration berjalan
- Intent Router aktif
- Simple RAG FAQ aktif
- Fallback chain aman
- ai_audit_logs berjalan
- Tidak ada autonomous agent bebas

---

## Files to Read

- `CLAUDE.md` — aturan development dan security rules
- `docs/MVP_SCOPE_v1.md` — scope MVP yang disepakati
- `docs/USER_STORIES.md` — user stories sebagai acuan skenario test
- `docs/AI_GUARDRAILS.md` — aturan AI yang harus dipatuhi
- `docs/DATABASE_SCHEMA.md` — struktur tabel untuk verifikasi data
- `docs/TEST_SCENARIOS.md` — skenario test yang sudah didefinisikan
- `tasks/08_mvp_testing.md` — task ini sendiri

---

## Test Scope

1. Authentication & role access
2. Admin dashboard navigation
3. FAQ CRUD
4. Chat simulator
5. Simple RAG FAQ answering
6. Letter request flow
7. Complaint workflow
8. AI audit logs
9. Fallback behavior
10. Basic UI/UX readiness

---

## Requirements

### 1. MVP Test Report
Buat checklist testing MVP di `docs/MVP_TEST_REPORT.md`.

### 2. Out-of-scope Review
Jalankan review kode untuk memastikan tidak ada fitur di luar MVP yang terimplementasi.

### 3. Route Protection
Pastikan route protection berjalan sesuai role:
- User belum login tidak bisa akses `/admin`
- Warga tidak bisa akses `/admin`
- `rt_admin` dan `super_admin` bisa akses `/admin`
- `/chat` bisa diakses role yang diizinkan

### 4. Admin Routes
Pastikan semua route admin berjalan tanpa crash:
- `/admin`
- `/admin/profile`
- `/admin/faqs`
- `/admin/letter-templates`
- `/admin/letter-requests`
- `/admin/complaints`
- `/admin/ai-audit-logs`

### 5. FAQ CRUD
Pastikan semua operasi FAQ berjalan:
- Create
- Read
- Update
- Activate/deactivate

### 6. Chat FAQ
Pastikan:
- Pertanyaan yang cocok dijawab dari Supabase/RAG
- Pertanyaan yang tidak tersedia fallback ke admin (tidak mengarang)

### 7. Letter Request Flow
Pastikan alur berjalan end-to-end:
- Warga membuat request surat dari chat
- Required fields terkumpul via slot filling
- Status menjadi `waiting_admin_review`
- Admin bisa approve atau reject

### 8. Complaint Flow
Pastikan alur berjalan end-to-end:
- Warga membuat laporan dari chat
- `complaint_reports` tersimpan di Supabase
- Admin bisa update status dan mengisi `admin_notes`

### 9. AI Integration Safety
Pastikan:
- Tanpa `GEMINI_API_KEY`, app tidak crash
- `ENABLE_LLM_INTENT=false` → fallback ke rule-based classifier
- `ENABLE_LLM_FAQ_RAG=false` → fallback ke `findFaqAnswer()` existing
- Dengan Gemini aktif, RAG tetap grounded (tidak mengarang)

### 10. AI Audit Logs
Pastikan `ai_audit_logs` mencatat:
- `input_text`
- `detected_intent`
- `ai_response`
- `confidence_score` jika tersedia
- `sources_used` untuk FAQ RAG jika ada

### 11. Bug Fixes
Perbaiki bug kecil yang ditemukan selama testing sesuai Bug Fix Rules.

### 12. UI/UX States
Tambahkan atau rapikan empty state, loading state, dan error state jika masih kurang.

### 13. README
Update `README.md` dengan:
- Cara menjalankan project
- Env variables yang diperlukan
- Urutan setup Supabase
- User test roles
- Fitur MVP
- Batasan MVP

### 14. No New Features
Jangan menambah fitur baru di luar scope MVP.

---

## Acceptance Criteria

- [ ] Semua skenario utama MVP berhasil dites dan didokumentasikan di `docs/MVP_TEST_REPORT.md`.
- [ ] `README.md` diperbarui.
- [ ] Tidak ada route utama yang crash.
- [ ] Auth dan role protection berjalan.
- [ ] FAQ CRUD berjalan.
- [ ] Chat FAQ/RAG berjalan.
- [ ] Letter request flow berjalan end-to-end.
- [ ] Complaint flow berjalan end-to-end.
- [ ] Audit log mencatat data yang benar.
- [ ] Fallback tanpa Gemini berjalan.
- [ ] Tidak ada API key yang terekspos ke client bundle.
- [ ] Tidak ada service role key di client.
- [ ] Tidak ada fitur baru di luar MVP.

---

## Out of Scope

Jangan implementasikan di Task 08:
- WhatsApp integration
- PDF generation
- Digital signature
- OCR KTP/KK
- Payment/iuran
- Notification automation
- Vector embedding/pgvector
- Mobile native app
- Multi-RT billing
- Advanced analytics
- Production deployment hardening penuh

---

## Test Plan

### A. Auth Test
1. Buka `/admin` tanpa login → harus redirect ke `/login`.
2. Login sebagai warga → `/admin` harus unauthorized.
3. Login sebagai `rt_admin` → `/admin` berhasil masuk.
4. Logout → kembali ke `/login`.

### B. Admin Route Test
1. Buka semua route admin satu per satu.
2. Pastikan tidak ada yang crash.
3. Pastikan sidebar/topbar tetap berfungsi di semua halaman.

### C. FAQ Test
1. Tambah FAQ baru.
2. Edit FAQ yang sudah ada.
3. Nonaktifkan FAQ.
4. Aktifkan kembali FAQ.
5. Pastikan FAQ yang aktif bisa dipakai di chat/RAG.

### D. Chat/RAG Test
1. Kirim: `"Berapa iuran bulanan RT?"` → jawab dari FAQ Supabase.
2. Kirim: `"Kapan jadwal sampah?"` → jawab dari FAQ Supabase.
3. Kirim: `"Boleh bikin helipad di rumah?"` → fallback, tidak mengarang.
4. Periksa `ai_audit_logs` di Supabase — pastikan ada record dengan `sources_used`.

### E. Letter Request Test
1. Kirim: `"Saya mau buat surat SKCK"`.
2. Isi field wajib satu per satu.
3. Pastikan status berubah ke `waiting_admin_review`.
4. Admin approve surat pertama.
5. Buat request kedua → admin reject dengan `admin_notes`.

### F. Complaint Test
1. Kirim: `"Lampu jalan blok C mati sejak kemarin malam"`.
2. Pastikan complaint tersimpan di tabel `complaint_reports`.
3. Admin ubah status ke `in_progress`.
4. Admin isi `admin_notes`.
5. Admin ubah status ke `resolved`.

### G. AI Fallback Test
1. Set `ENABLE_LLM_INTENT=false` → test chat tetap berjalan normal.
2. Kosongkan `GEMINI_API_KEY` → test app tidak crash.
3. Isi `GEMINI_API_KEY` dengan nilai invalid → pastikan fallback ke rule-based.

### H. Audit Log Test
1. Buka `/admin/ai-audit-logs`.
2. Pastikan log muncul setelah chat aktif.
3. Pastikan `sources_used` terisi untuk pertanyaan FAQ dengan RAG aktif.

---

## Bug Fix Rules

- Hanya perbaiki bug yang menghalangi acceptance criteria.
- Jangan menambah fitur baru.
- Jangan refactor besar tanpa alasan yang jelas.
- Jangan ubah schema database kecuali benar-benar perlu.
- Jika perlu mengubah schema, jelaskan dulu sebelum eksekusi.
- Prioritaskan stabilitas MVP.

---

## Status

Completed
