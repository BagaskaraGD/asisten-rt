# Task 04: Chat Simulator with Rule-Based Mock AI

## Goal

Mengubah halaman `/chat` dari tampilan placeholder statis menjadi chat simulator
interaktif. Sistem menggunakan rule-based intent classifier sementara — tanpa memanggil
API LLM — agar seluruh workflow percakapan warga bisa diuji dan diverifikasi sebelum
integrasi LLM nyata di task berikutnya.

---

## Context

Task 01 selesai: Supabase database terkoneksi, auth dan role-based access berfungsi,
`/admin` terlindungi.

Task 02 selesai: Admin dashboard terstruktur, route admin lengkap, sidebar/topbar berfungsi.

Task 03 selesai: FAQ Knowledge Base CRUD selesai. Admin bisa mengelola FAQ. Data FAQ
tersimpan di tabel `faqs` Supabase.

Kondisi `/chat` saat ini (`app/chat/page.tsx`):
- Server Component statis — tidak ada interaktivitas.
- Input chat disabled, tombol kirim disabled.
- Seluruh konten adalah placeholder hardcode.
- Sudah pakai global `Header` variant="warga".
- `/chat` saat ini bisa diakses tanpa login (tidak diblokir middleware).

Tabel Supabase yang relevan untuk task ini:
- `chat_sessions` — satu record per sesi chat.
- `chat_messages` — satu record per pesan (user dan assistant).
- `ai_audit_logs` — satu record per respons AI (untuk audit).
- `faqs` — sumber jawaban untuk intent `ask_faq`.

---

## Files to Read Sebelum Implementasi

- `CLAUDE.md` — aturan umum development dan security rules
- `docs/MVP_SCOPE_v1.md` — scope fitur chat simulator
- `docs/USER_STORIES.md` — US-003 Ask FAQ via Chat
- `docs/AI_GUARDRAILS.md` — aturan perilaku AI dan fallback response
- `docs/DATABASE_SCHEMA.md` — struktur tabel chat_sessions, chat_messages, ai_audit_logs
- `docs/TEST_SCENARIOS.md` — 4 skenario test yang harus lulus
- `prompts/system_prompt_asistenrt.md` — karakter dan gaya bahasa AsistenRT
- `prompts/intent_classifier_prompt.md` — format intent yang didukung
- `tasks/04_chat_simulator.md` — task ini sendiri
- `app/chat/page.tsx` — kondisi halaman saat ini (akan di-overhaul)
- `lib/database/queries.ts` — `getFAQs()` yang sudah ada untuk ambil FAQ aktif
- `supabase/migrations/001_initial_schema.sql` — skema chat_sessions, chat_messages

---

## Requirements

### 1. Akses Halaman `/chat`

`/chat` dapat diakses oleh:
- User yang login dengan role `warga`, `rt_admin`, `super_admin`.
- User yang **belum login** (chat publik, sesuai desain MVP awal).

Jangan blokir `/chat` di middleware untuk user yang tidak login.

### 2. UI Chat Interaktif

Overhaul `app/chat/page.tsx` menjadi Client Component (`'use client'`) dengan:
- **Area pesan** — daftar bubble pesan user (kanan) dan assistant (kiri), scrollable.
- **Input area** — textarea untuk menulis pesan + tombol Kirim.
- **Loading state** — tampilkan indikator "sedang mengetik..." saat bot memproses.
- **Suggested questions** — chip pertanyaan yang bisa diklik untuk mengisi input.
- **Auto scroll** — area pesan otomatis scroll ke pesan terbaru setelah ada pesan baru.
- Pesan pertama dari AI adalah greeting selamat datang saat halaman dibuka.

### 3. Rule-Based Intent Classifier

Buat `lib/ai/classifier.ts` — fungsi pure (bukan Server Action, bukan API call):

```typescript
export function classifyIntent(message: string): AiIntent
```

Rule keyword matching (case-insensitive, trim):

| Intent | Keyword trigger |
|---|---|
| `greeting` | halo, hai, hi, selamat pagi, selamat siang, selamat malam, pagi, siang, malam |
| `ask_faq` | iuran, sampah, tamu, domisili, jadwal, ronda, aturan, keamanan, kebersihan |
| `request_letter` | surat, skck, sku, keterangan usaha, pengantar, tidak mampu, domisili, rekomendasi |
| `submit_complaint` | rusak, mati, bocor, selokan, menumpuk, parkir, bau, gelap, banjir, lampu |
| `ask_status` | status, sudah jadi, sampai mana, sudah selesai, kapan selesai, cek |
| `unknown` | semua yang tidak cocok di atas |

Catatan: satu kata bisa trigger lebih dari satu intent — prioritas urutan di atas
(greeting > ask_faq > request_letter > submit_complaint > ask_status > unknown).

### 4. FAQ Keyword Matcher

Buat `lib/ai/faq-matcher.ts` — fungsi pure:

```typescript
export function findFaqAnswer(message: string, faqs: FaqRow[]): FaqRow | null
```

Logika:
- Normalize message dan FAQ question ke lowercase.
- Pecah message menjadi kata-kata (split by spasi).
- Untuk setiap FAQ, hitung berapa kata dari message yang muncul di question atau answer.
- Kembalikan FAQ dengan skor tertinggi jika skor > 0, atau `null` jika tidak ada yang cocok.

### 5. Server Action: Proses Pesan

Buat `app/chat/actions.ts` — Server Action yang dipanggil client saat user kirim pesan:

```typescript
export async function sendMessage(
  message: string,
  sessionId: string | null
): Promise<{ reply: string; intent: AiIntent; sessionId: string }>
```

Alur di dalam action:
1. Classify intent menggunakan `classifyIntent(message)`.
2. Generate reply berdasarkan intent (lihat Requirement 6).
3. Jika Supabase tersedia:
   a. Buat atau reuse `chat_sessions` record.
   b. Insert `chat_messages` untuk pesan user (`sender_type = 'user'`).
   c. Insert `chat_messages` untuk respons AI (`sender_type = 'assistant'`).
   d. Insert `ai_audit_logs` dengan input, intent, dan response.
4. Kembalikan `{ reply, intent, sessionId }` ke client.

Jika Supabase tidak tersedia: lewati langkah 3, kembalikan data tetap (chat berjalan
di local state saja tanpa crash).

### 6. Mock Response per Intent

#### `greeting`
```
Halo! Saya AsistenRT, asisten administrasi RT/RW Anda 👋

Saya bisa membantu:
• Menjawab pertanyaan seputar RT (iuran, jadwal, aturan)
• Memproses permintaan surat pengantar
• Menerima laporan keluhan lingkungan

Ada yang bisa saya bantu hari ini?
```

#### `ask_faq`
- Jalankan `findFaqAnswer(message, activeFaqs)`.
- Jika ditemukan: `"Berdasarkan informasi RT, {faq.answer}"` + tampilkan kategori jika ada.
- Jika tidak ditemukan: gunakan **fallback response** dari `AI_GUARDRAILS.md`:
  `"Maaf, informasi tersebut belum tersedia di data RT. Saya akan teruskan pertanyaan ini ke pengurus agar dapat dikonfirmasi."`

#### `request_letter`
```
Baik, saya siap membantu mengurus surat pengantar 📄

Fitur pembuatan draft surat sedang dalam pengembangan. Setelah aktif, saya akan
memandu Anda mengumpulkan data yang diperlukan (nama lengkap, NIK, keperluan, dll)
dan draft surat akan disiapkan untuk divalidasi oleh Ketua RT.

Untuk saat ini, silakan hubungi pengurus RT secara langsung.
```

#### `submit_complaint`
```
Terima kasih telah melaporkan. Laporan Anda sudah saya catat 📢

Fitur pencatatan laporan otomatis sedang dalam pengembangan. Setelah aktif, laporan
Anda akan langsung masuk ke sistem dan pengurus RT akan menerima notifikasi.

Untuk saat ini, silakan hubungi pengurus RT atau keamanan setempat jika bersifat mendesak.
```

#### `ask_status`
```
Untuk mengecek status permintaan surat atau laporan keluhan Anda, fitur pelacakan
status sedang dalam pengembangan.

Setelah aktif, Anda bisa langsung cek status di sini tanpa perlu menghubungi pengurus
secara manual.
```

#### `unknown`
Gunakan fallback response dari `AI_GUARDRAILS.md`:
```
Maaf, informasi tersebut belum tersedia di data RT. Saya akan teruskan pertanyaan
ini ke pengurus agar dapat dikonfirmasi.
```

### 7. Persistensi ke Supabase

Jika env Supabase tersedia, simpan ke database:

**`chat_sessions`** — buat satu record saat sesi dimulai (pesan pertama dikirim):
```sql
channel = 'web'
rt_id   = DEFAULT_RT_ID
user_id = null  -- belum ada auth di chat untuk MVP
```
Simpan `session_id` di state client, gunakan untuk semua pesan berikutnya dalam sesi yang sama.

**`chat_messages`** — insert untuk setiap pesan:
```sql
session_id   = <session dari atas>
sender_type  = 'user' | 'assistant'
message_text = <isi pesan>
intent       = <intent hasil klasifikasi, hanya untuk assistant>
```

**`ai_audit_logs`** — insert untuk setiap respons AI:
```sql
rt_id           = DEFAULT_RT_ID
input_text      = <pesan user>
detected_intent = <intent>
ai_response     = <reply text>
```

### 8. Graceful Degradation

Jika `isSupabaseConfigured()` mengembalikan `false`:
- Chat tetap berfungsi penuh di local state.
- Tidak ada penyimpanan ke DB.
- Tidak ada error yang muncul ke user.
- Tampilkan banner kecil "Mode offline — percakapan tidak tersimpan" di area chat.

---

## Acceptance Criteria

- [ ] User (login maupun tidak) bisa membuka `/chat` dan chat berfungsi.
- [ ] `rt_admin` dan `super_admin` juga bisa membuka `/chat`.
- [ ] User bisa mengirim pesan dan menerima balasan mock AI.
- [ ] Intent `ask_faq` dengan keyword "iuran" mengembalikan jawaban dari FAQ Supabase.
- [ ] Intent `ask_faq` dengan pertanyaan tidak dikenal mengembalikan fallback response.
- [ ] Intent `greeting` mengembalikan pesan sapaan.
- [ ] Intent `request_letter` mengembalikan response placeholder surat.
- [ ] Intent `submit_complaint` mengembalikan response placeholder keluhan.
- [ ] Intent `unknown` mengembalikan fallback response.
- [ ] Loading state "sedang mengetik..." tampil saat bot memproses.
- [ ] Pesan baru otomatis scroll ke bawah.
- [ ] `chat_messages` tersimpan di Supabase jika env tersedia.
- [ ] `ai_audit_logs` tersimpan di Supabase jika env tersedia.
- [ ] Chat tidak crash jika Supabase env kosong.
- [ ] Tidak ada panggilan ke API LLM (OpenAI, Claude, dll).
- [ ] `npm run dev` berjalan tanpa error.
- [ ] `npm run type-check` lulus tanpa error.

---

## Out of Scope

Jangan implementasikan di Task 04:
- Integrasi LLM (OpenAI, Anthropic Claude, Gemini, dll).
- WhatsApp API.
- Generate draft surat yang sesungguhnya.
- Simpan `letter_requests` ke database — hanya tampilkan placeholder response.
- Simpan `complaint_reports` ke database — hanya tampilkan placeholder response.
- Upload file atau gambar.
- Vector search atau RAG embedding.
- PDF generation.
- Tanda tangan digital.
- Multi-session management (history sesi lama).
- Notifikasi push.

---

## UI Guidelines

- Pertahankan layout dua kolom: area chat (flex-1) + info sidebar (w-64, hidden di mobile).
- Bubble pesan user: `bg-blue-600 text-white`, rata kanan, rounded-tr-none.
- Bubble pesan assistant: `bg-white border border-gray-100 shadow-sm`, rata kiri, rounded-tl-none.
- Avatar bot: lingkaran biru `bg-blue-100` dengan emoji 🤖.
- Avatar user: lingkaran abu `bg-gray-200` dengan emoji 👤.
- Indikator loading: tiga titik animasi di bubble assistant (atau teks "sedang mengetik...").
- Input: textarea satu baris yang bisa expand, border `border-gray-300`, rounded-xl.
- Tombol Kirim: `bg-blue-600`, ikon send, disabled saat loading atau input kosong.
- Suggested question chips: bisa diklik, mengisi input dan langsung kirim.
- Disclaimer di bawah input: "⚖️ Respons AI bersifat informatif. Keputusan resmi tetap di pengurus RT."
- Gunakan Tailwind CSS yang sudah ada — jangan tambahkan library UI baru.

---

## Test Plan

Lakukan pengujian manual berikut setelah implementasi:

1. **Login sebagai warga**, buka `/chat` — pastikan chat UI tampil dan input aktif.
2. Kirim: `"Halo"` → intent `greeting`, tampil pesan sapaan.
3. Kirim: `"Iuran bulanan RT berapa?"` → intent `ask_faq`, jawaban dari FAQ Supabase muncul.
4. Kirim: `"Kapan jadwal sampah?"` → intent `ask_faq`, jawaban dari FAQ Supabase muncul.
5. Kirim: `"Kapan jadwal fogging?"` → intent `ask_faq`, fallback response muncul (tidak ada di FAQ).
6. Kirim: `"Saya mau buat surat SKCK"` → intent `request_letter`, placeholder response muncul.
7. Kirim: `"Lampu jalan blok C mati"` → intent `submit_complaint`, placeholder response muncul.
8. Kirim: `"Status surat saya sudah jadi?"` → intent `ask_status`, placeholder response muncul.
9. Kirim: `"xyz abc tidak jelas"` → intent `unknown`, fallback response muncul.
10. Verifikasi loading state muncul sebelum balasan tampil.
11. Verifikasi Supabase Table Editor: `chat_messages` dan `ai_audit_logs` terisi.
12. **Login sebagai rt_admin**, buka `/chat` — pastikan bisa diakses.
13. **Login sebagai warga**, akses `/admin` — pastikan tetap redirect ke `/unauthorized`.
14. **Matikan Supabase env** (hapus `.env.local` sementara), reload `/chat` — pastikan chat tetap berjalan tanpa crash.

---

## Status

Completed
