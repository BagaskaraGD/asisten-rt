# AsistenRT

Aplikasi web MVP untuk membantu administrasi RT/RW berbasis AI. Warga dapat bertanya FAQ, meminta draft surat pengantar, dan melaporkan keluhan melalui chat. Admin RT dapat mengelola FAQ, mereview permintaan surat, dan menangani laporan keluhan.

---

## Tech Stack

- **Frontend/Backend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **AI**: Google Gemini API (`gemini-2.0-flash` / `gemini-2.5-flash`)
- **Deployment**: Vercel

---

## Prasyarat

- Node.js 20+
- Akun Supabase (project baru)
- Google AI Studio API Key (untuk fitur AI/RAG)

---

## Setup

### 1. Clone dan install dependensi

```bash
git clone <repo-url>
cd asistenrt-ai
npm install
```

### 2. Konfigurasi environment

Salin `.env.example` menjadi `.env.local` dan isi nilai berikut:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Google Gemini (server-side only — jangan pakai NEXT_PUBLIC_)
GEMINI_API_KEY=<api-key-dari-aistudio.google.com>
GEMINI_MODEL=gemini-2.0-flash

# Feature Flags (set ke true untuk mengaktifkan AI)
ENABLE_LLM_INTENT=true
ENABLE_LLM_FAQ_RAG=true
```

> `GEMINI_API_KEY` didapat dari [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Setup Supabase

Jalankan SQL migration berikut di Supabase SQL Editor (urutan penting):

1. `supabase/migrations/001_initial_schema.sql` — buat semua tabel dan enum
2. `supabase/migrations/002_seed.sql` — isi data awal (RT, user test, FAQ, template surat)

> Pastikan Row Level Security (RLS) dikonfigurasi sesuai file migration.

### 4. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## User Test Roles

| Email | Role | Akses |
|---|---|---|
| `admin@rt.test` | `rt_admin` | `/admin/*`, `/chat` |
| `warga@rt.test` | `warga` | `/chat` saja |
| `super@rt.test` | `super_admin` | `/admin/*`, `/chat` |

> Password default ada di seed SQL. Ganti sebelum pilot nyata.

---

## Fitur MVP

| Fitur | Route | Keterangan |
|---|---|---|
| Chat Warga | `/chat` | Tanya FAQ, minta surat, lapor keluhan |
| Admin Dashboard | `/admin` | Overview |
| Profil RT | `/admin/profile` | Data RT dan kontak pengurus |
| FAQ CRUD | `/admin/faqs` | Kelola knowledge base AI |
| Template Surat | `/admin/letter-templates` | Lihat template surat tersedia |
| Permintaan Surat | `/admin/letter-requests` | Review dan approve/reject draft surat |
| Laporan Keluhan | `/admin/complaints` | Kelola laporan warga |
| AI Audit Log | `/admin/ai-audit-logs` | Riwayat interaksi AI |

### Jenis surat yang didukung

- Surat Keterangan Domisili
- Surat Pengantar SKCK
- Surat Keterangan Usaha (SKU)

### Intent chat yang didukung

- `ask_faq` — tanya informasi RT berdasarkan knowledge base
- `request_letter` — minta draft surat pengantar
- `submit_complaint` — lapor keluhan lingkungan
- `ask_status` — cek status pengajuan
- `greeting` — sapaan

---

## Batasan MVP

Fitur berikut **tidak** tersedia di MVP ini:

- WhatsApp / notifikasi otomatis
- PDF generation / cetak surat
- Tanda tangan digital
- OCR KTP/KK
- Pembayaran / iuran warga
- Vector embedding / semantic search
- Mobile native app
- Multi-RT / multi-tenant

---

## Scripts

```bash
npm run dev        # jalankan development server
npm run build      # build production
npm run lint       # cek linting
npm run type-check # cek TypeScript
```

---

## AI Behavior

- AI hanya menjawab berdasarkan FAQ yang ada di database (grounded generation).
- AI tidak pernah approve/reject surat atau membuat keputusan resmi.
- Jika informasi tidak tersedia, AI mengarahkan ke pengurus RT.
- Semua interaksi AI dicatat di tabel `ai_audit_logs`.
- Chat tetap berfungsi tanpa `GEMINI_API_KEY` (fallback ke rule-based classifier).
