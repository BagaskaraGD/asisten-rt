# User Stories

## US-001: Create RT Profile

Sebagai super admin, saya ingin membuat profil RT agar sistem memiliki data lingkungan.

Acceptance Criteria:
- Bisa input nama RT, RW, area, kelurahan, kecamatan, kota.
- Bisa input kontak ketua, sekretaris, bendahara.
- Data tersimpan di database.
- Admin RT bisa melihat profil RT.

## US-002: Manage FAQ

Sebagai admin RT, saya ingin mengelola FAQ agar AI dapat menjawab pertanyaan warga.

Acceptance Criteria:
- Admin bisa tambah FAQ.
- Admin bisa edit FAQ.
- Admin bisa nonaktifkan FAQ.
- AI hanya memakai FAQ aktif.

## US-003: Ask FAQ via Chat

Sebagai warga, saya ingin bertanya lewat chat agar mendapat jawaban cepat.

Acceptance Criteria:
- Warga mengetik pertanyaan.
- Sistem mendeteksi intent `ask_faq`.
- AI menjawab berdasarkan FAQ.
- Jika tidak ada jawaban, AI eskalasi ke admin.

## US-004: Request Letter Draft

Sebagai warga, saya ingin meminta draft surat pengantar.

Acceptance Criteria:
- Warga memilih atau mengetik jenis surat.
- Sistem meminta data wajib.
- Jika data lengkap, draft dibuat.
- Status menjadi `waiting_admin_review`.
- Admin bisa approve/reject.

## US-005: Submit Complaint

Sebagai warga, saya ingin melaporkan keluhan lingkungan.

Acceptance Criteria:
- Warga mengirim laporan bebas.
- AI mengekstrak kategori, lokasi, urgensi.
- Laporan tersimpan sebagai tiket.
- Admin bisa update status.

## US-006: AI Audit Log

Sebagai pemilik sistem, saya ingin semua interaksi AI tercatat untuk debugging.

Acceptance Criteria:
- Input user tersimpan.
- Intent tersimpan.
- Response AI tersimpan.
- Sources/FAQ yang digunakan tersimpan jika ada.