# MVP Test Report — AsistenRT v1

Tanggal review: 2026-05-16
Reviewer: Code audit (Task 08)
Branch: v1

---

## Ringkasan

| Area | Status | Catatan |
|---|---|---|
| Auth & role protection | PASS | Layout-level guard, redirect ke /login dan /unauthorized |
| Admin routes | PASS | Semua route berjalan tanpa crash |
| FAQ CRUD | PASS | Create, read, update, toggle aktif, delete |
| Chat / FAQ answering | PASS | Rule-based fallback + RAG Gemini jika aktif |
| Letter request flow | PASS | Slot filling → waiting_admin_review → approve/reject |
| Complaint flow | PASS | Submit → tersimpan → admin update status + notes |
| AI audit logs | PASS (setelah fix) | Halaman sebelumnya ComingSoonCard, sudah diimplementasikan |
| Fallback tanpa Gemini | PASS | Feature flag off → rule-based aktif, app tidak crash |
| API key exposure | PASS | GEMINI_API_KEY server-side only, tidak ada NEXT_PUBLIC_ |
| README | PASS (setelah fix) | Sebelumnya kosong, sudah diupdate |
| Out-of-scope features | PASS | Tidak ada fitur di luar MVP yang terimplementasi |

---

## A. Auth Test

### A1. Tanpa login → /admin
- **Ekspektasi**: redirect ke /login
- **Implementasi**: `app/admin/layout.tsx:13` — `if (!currentUser) redirect('/login')`
- **Status**: PASS

### A2. Login sebagai warga → /admin
- **Ekspektasi**: redirect ke /unauthorized
- **Implementasi**: `app/admin/layout.tsx:17` — `if (currentUser.role === 'warga') redirect('/unauthorized')`
- **Status**: PASS

### A3. Login sebagai rt_admin → /admin
- **Ekspektasi**: masuk dashboard
- **Implementasi**: role selain 'warga' diizinkan masuk
- **Status**: PASS

### A4. /chat tanpa login
- **Ekspektasi**: dapat diakses (by design — MVP chat terbuka)
- **Status**: PASS (intentional)

---

## B. Admin Route Test

| Route | Komponen | Empty State | Error State | Status |
|---|---|---|---|---|
| /admin | `app/admin/page.tsx` | N/A (dashboard summary) | N/A | PASS |
| /admin/profile | `app/admin/profile/page.tsx` | ✅ "Data RT tidak ditemukan" | N/A | PASS |
| /admin/faqs | `app/admin/faqs/page.tsx` | ✅ "Belum ada FAQ" | N/A | PASS |
| /admin/faqs/new | `app/admin/faqs/new/page.tsx` | N/A (form) | ✅ error state | PASS |
| /admin/faqs/[id]/edit | `app/admin/faqs/[id]/edit/page.tsx` | N/A | ✅ notFound() | PASS |
| /admin/letter-templates | `app/admin/letter-templates/page.tsx` | ✅ | N/A | PASS |
| /admin/letter-requests | `app/admin/letter-requests/page.tsx` | ✅ "Belum ada permintaan surat" | N/A | PASS |
| /admin/letter-requests/[id] | `app/admin/letter-requests/[id]/page.tsx` | N/A | ✅ notFound() | PASS |
| /admin/complaints | `app/admin/complaints/page.tsx` | ✅ "Belum ada laporan keluhan" | N/A | PASS |
| /admin/complaints/[id] | `app/admin/complaints/[id]/page.tsx` | N/A | ✅ notFound() | PASS |
| /admin/ai-audit-logs | `app/admin/ai-audit-logs/page.tsx` | ✅ "Belum ada log AI" | N/A | PASS (setelah fix) |

---

## C. FAQ CRUD Test

| Operasi | Action | Auth Guard | Status |
|---|---|---|---|
| Create | `createFaq()` | ✅ assertAdmin() | PASS |
| Read (all) | `getAllFAQs()` | Layout guard | PASS |
| Read (by id) | `getFaqById()` | Layout guard | PASS |
| Update | `updateFaq()` | ✅ assertAdmin() | PASS |
| Toggle aktif | `toggleFaqActive()` | ✅ role check | PASS |
| Delete | `deleteFaq()` | ✅ role check | PASS |

---

## D. Chat / RAG Test

### D1. Intent classification
- Rule-based: `classifier.ts` — keyword matching, 5 intent categories
- LLM (opsional): `classify-intent.ts` — Gemini JSON output dengan fallback
- Fallback chain: LLM error / confidence < 0.5 → rule-based
- **Status**: PASS

### D2. FAQ answering
- Rule-based: `faq-matcher.ts` — keyword scoring, top-1 match
- RAG: `rag-retriever.ts` (top-3) → `faq-rag-answer.ts` (Gemini grounded generation)
- Aktif jika: `ENABLE_LLM_FAQ_RAG=true` AND `GEMINI_API_KEY` valid
- **Status**: PASS

### D3. Fallback response
- Pertanyaan tidak ada di knowledge base → fallback ke pengurus RT
- App tidak crash tanpa GEMINI_API_KEY
- **Status**: PASS

### Skenario dari TEST_SCENARIOS.md

| Skenario | Input | Expected Intent | Status |
|---|---|---|---|
| FAQ Iuran | "Iuran bulan ini berapa?" | ask_faq | PASS |
| FAQ Tidak Tersedia | "Kapan jadwal fogging?" | ask_faq → fallback | PASS |
| Request SKCK | "Saya mau bikin surat pengantar SKCK" | request_letter | PASS |
| Complaint Lampu | "Lampu jalan depan blok C mati sejak kemarin malam" | submit_complaint | PASS |

---

## E. Letter Request Flow Test

| Step | Implementasi | Status |
|---|---|---|
| Deteksi intent request_letter | `classifier.ts` / `classify-intent.ts` | PASS |
| Deteksi jenis surat | `detectLetterType()` di actions.ts | PASS |
| Buat letter_request record (status: collecting_data) | `createLetterRequestRecord()` | PASS |
| Slot filling multi-turn | `handleSlotFilling()` + `parseFieldValues()` | PASS |
| Generate draft surat | `generateDraftText()` dengan template body | PASS |
| Status → waiting_admin_review | `finalizeLetterDraft()` | PASS |
| Admin approve | `approveLetter()` dengan auth guard | PASS |
| Admin reject + notes | `rejectLetter()` dengan auth guard | PASS |

---

## F. Complaint Flow Test

| Step | Implementasi | Status |
|---|---|---|
| Deteksi intent submit_complaint | `classifier.ts` / `classify-intent.ts` | PASS |
| Ekstrak kategori, lokasi, urgensi | `extractComplaint()` | PASS |
| Simpan ke complaint_reports (status: new) | Supabase insert di `handleComplaint()` | PASS |
| Admin lihat daftar laporan | `/admin/complaints` | PASS |
| Admin update status | `updateComplaintStatus()` dengan validasi enum | PASS |
| Admin isi admin_notes | Form textarea di detail page | PASS |
| Final status (resolved/rejected) → read-only | `isFinal` check di detail page | PASS |

---

## G. AI Fallback Test

| Kondisi | Expected | Status |
|---|---|---|
| `ENABLE_LLM_INTENT=false` | Rule-based classifier aktif | PASS |
| `ENABLE_LLM_FAQ_RAG=false` | `findFaqAnswer()` aktif | PASS |
| `GEMINI_API_KEY` kosong | `isGeminiConfigured()` → false, fallback | PASS |
| `GEMINI_API_KEY` invalid | Error ditangkap, fallback ke rule-based | PASS |
| Gemini timeout (>15 detik) | `timeoutPromise` reject, fallback | PASS |
| Output JSON invalid | `parseIntentOutput()` → null → fallback | PASS |

---

## H. AI Audit Log Test

| Field | Tersimpan | Status |
|---|---|---|
| `input_text` | ✅ | PASS |
| `detected_intent` | ✅ | PASS |
| `ai_response` | ✅ | PASS |
| `confidence_score` | ✅ (null jika rule-based) | PASS |
| `sources_used` | ✅ (array FAQ ID jika RAG) | PASS |
| `session_id` | ✅ | PASS |
| API key tidak tersimpan | ✅ (tidak ada di saveAuditLog) | PASS |

---

## Bug yang Ditemukan dan Diperbaiki

### Bug #1 — /admin/ai-audit-logs masih ComingSoonCard
- **File**: `app/admin/ai-audit-logs/page.tsx`
- **Dampak**: Admin tidak bisa melihat log interaksi AI (acceptance criteria gagal)
- **Fix**: Implementasi halaman dengan query `getAiAuditLogs()` dari Supabase
- **Files diubah**: 
  - `app/admin/ai-audit-logs/page.tsx` — halaman baru dengan tabel log
  - `lib/database/types.ts` — tambah `AiAuditLogRow`
  - `lib/database/queries.ts` — tambah `getAiAuditLogs()`

### Bug #2 — Sidebar chat menampilkan surat yang tidak didukung
- **File**: `app/chat/ChatInterface.tsx`
- **Dampak**: Warga melihat "Keterangan Tidak Mampu" dan "Pengantar Nikah" yang tidak ada di sistem
- **Fix**: Ganti daftar surat menjadi 3 jenis yang benar (Domisili, SKCK, SKU)
- **Files diubah**: `app/chat/ChatInterface.tsx`

### Bug #3 — README.md kosong
- **File**: `README.md`
- **Dampak**: Developer baru tidak bisa setup project
- **Fix**: Tulis README lengkap dengan setup, env vars, user roles, fitur, dan batasan
- **Files diubah**: `README.md`

---

## Known Limitations MVP

1. **Chat tidak memerlukan login** — by design untuk MVP. Implikasi: tidak ada asosiasi antara pesan chat dan akun warga tertentu (`user_id = null` di chat_messages).

2. **Tidak ada middleware.ts** — route protection dilakukan di layout level. Cukup untuk MVP karena Next.js Server Components menjalankan layout sebelum page.

3. **DEFAULT_RT_ID hardcoded** — semua data terikat ke satu RT seed (`11111111-1111-1111-1111-111111111111`). Multi-RT belum didukung.

4. **RAG masih keyword-based** — retrieval menggunakan keyword scoring, bukan semantic/vector search. Akurasi bergantung pada kecocokan kata eksak.

5. **Latency chat dengan Gemini aktif** — setiap pesan membutuhkan 1-2 call ke Gemini API (intent + RAG), total 3-8 detik. Normal untuk MVP tapi perlu dioptimalkan untuk production.

6. **Audit log halaman** — menampilkan 100 entri terbaru saja, tanpa pagination.

7. **Letter request tidak terhubung ke warga** — `user_id = null`, admin tidak tahu siapa pemohonnya kecuali dari data form yang diisi warga.
