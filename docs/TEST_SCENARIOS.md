# MVP Test Scenarios

## Scenario 1: FAQ Iuran

Input:
"Iuran bulan ini berapa?"

Expected:
AI menjawab nominal iuran berdasarkan FAQ aktif.

Pass Criteria:
- Intent = ask_faq
- Jawaban sesuai knowledge base
- Tidak mengarang informasi tambahan
- Audit log tercatat

## Scenario 2: FAQ Tidak Tersedia

Input:
"Kapan jadwal fogging bulan ini?"

Expected:
AI mengatakan informasi belum tersedia dan akan diteruskan ke pengurus.

Pass Criteria:
- Tidak mengarang tanggal
- Ada fallback response
- Audit log tercatat

## Scenario 3: Request Surat SKCK

Input:
"Saya mau bikin surat pengantar SKCK."

Expected:
AI meminta data wajib.

Pass Criteria:
- Intent = request_letter
- Sistem membuat letter_request
- Status awal collecting_data
- Setelah lengkap status waiting_admin_review

## Scenario 4: Complaint Lampu Jalan

Input:
"Lampu jalan depan blok C mati sejak kemarin malam."

Expected:
Sistem membuat complaint report.

Pass Criteria:
- Intent = submit_complaint
- Category = fasilitas_umum
- Location = Blok C
- Urgency = sedang
- Status = new