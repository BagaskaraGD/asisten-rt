# CLAUDE.md

## Project
AsistenRT adalah MVP aplikasi web untuk membantu administrasi RT/RW berbasis AI.

## Core Principle
AI hanya membantu, bukan mengambil keputusan resmi. Semua surat, data warga, dan tindakan administratif tetap harus divalidasi admin RT.

## Tech Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase pgvector, optional untuk RAG
- LLM abstraction layer
- Deployment target: Vercel

## MVP Scope
Fitur MVP v1:
1. Admin membuat dan mengelola profil RT.
2. Admin mengelola FAQ/knowledge base.
3. Warga menggunakan web chat simulator.
4. AI menjawab FAQ berdasarkan knowledge base.
5. Warga meminta draft surat.
6. Admin approve/reject draft surat.
7. Warga melaporkan keluhan.
8. Admin mengubah status keluhan.
9. Sistem menyimpan chat log dan AI audit log.

## Out of Scope
Jangan implementasikan dulu:
- WhatsApp API
- pembayaran iuran
- tanda tangan digital
- mobile native app
- OCR KTP/KK
- integrasi kelurahan
- sistem kas lengkap
- multi-tenant kompleks tingkat lanjut

## Development Rules
- Kerjakan task secara bertahap.
- Jangan membuat fitur di luar MVP.
- Selalu update tipe TypeScript.
- Gunakan komponen sederhana dan jelas.
- Setiap fitur harus punya loading state, empty state, dan error state.
- Semua AI response harus tercatat di ai_audit_logs.
- Semua surat harus berstatus draft sebelum admin approve.

## Security Rules
- Jangan tampilkan data pribadi warga lain.
- Jangan hardcode API key.
- Gunakan environment variables.
- Batasi akses berdasarkan role.
- Jangan simpan scan KTP/KK untuk MVP.
- 