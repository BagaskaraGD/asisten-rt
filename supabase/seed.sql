insert into rts (
  id,
  name,
  rw,
  area_name,
  kelurahan,
  kecamatan,
  city,
  address,
  chairman_name,
  secretary_name,
  treasurer_name,
  security_contact
) values (
  '11111111-1111-1111-1111-111111111111',
  'RT 03',
  'RW 05',
  'Perumahan Griya Damai',
  'Keputih',
  'Sukolilo',
  'Surabaya',
  'Perumahan Griya Damai, Keputih, Sukolilo, Surabaya',
  'Bapak Ahmad',
  'Ibu Rina',
  'Bapak Dedi',
  '0812-0000-0000'
);

insert into faqs (rt_id, question, answer, category) values
(
  '11111111-1111-1111-1111-111111111111',
  'Berapa iuran bulanan RT?',
  'Iuran bulanan RT 03 adalah Rp75.000 per rumah dan dibayarkan maksimal tanggal 10 setiap bulan.',
  'iuran'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Kapan jadwal pengambilan sampah?',
  'Pengambilan sampah dilakukan setiap Senin, Rabu, dan Jumat sekitar pukul 06.00.',
  'kebersihan'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Bagaimana aturan tamu menginap?',
  'Tamu yang menginap lebih dari 1x24 jam wajib dilaporkan kepada pengurus RT.',
  'keamanan'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Bagaimana cara membuat surat pengantar domisili?',
  'Warga perlu mengirim nama lengkap, NIK, nomor KK, alamat, dan keperluan surat. Draft akan dibuat oleh sistem dan divalidasi oleh Ketua RT atau Sekretaris.',
  'surat'
);

-- ─── Letter Templates ──────────────────────────────────────────────────────────
-- Jalankan bagian ini di Supabase SQL Editor jika letter_templates masih kosong.

insert into letter_templates (rt_id, letter_type, required_fields, template_body, is_active) values
(
  '11111111-1111-1111-1111-111111111111',
  'domisili',
  '["nama_lengkap", "nik", "nomor_kk", "alamat", "keperluan"]',
  $$SURAT KETERANGAN DOMISILI
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

Bapak Ahmad$$,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'skck',
  '["nama_lengkap", "nik", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "agama", "pekerjaan", "alamat", "keperluan"]',
  $$SURAT PENGANTAR PERMOHONAN SKCK
Nomor: -/-/RT03/RW05/{TAHUN}

Yang bertanda tangan di bawah ini Ketua RT 03 RW 05 Perumahan Griya Damai
menerangkan bahwa:

Nama Lengkap      : {nama_lengkap}
NIK               : {nik}
Tempat, Tgl Lahir : {tempat_lahir}, {tanggal_lahir}
Jenis Kelamin     : {jenis_kelamin}
Agama             : {agama}
Pekerjaan         : {pekerjaan}
Alamat            : {alamat}

adalah warga RT 03 RW 05 Perumahan Griya Damai yang berkelakuan baik dan tidak
pernah terlibat tindak kriminal selama berdomisili di wilayah ini.

Surat ini dibuat untuk keperluan: {keperluan}

Surabaya, {TANGGAL}
Ketua RT 03 RW 05

Bapak Ahmad$$,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'sku',
  '["nama_lengkap", "nik", "nama_usaha", "jenis_usaha", "alamat_usaha", "alamat"]',
  $$SURAT KETERANGAN USAHA
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

Bapak Ahmad$$,
  true
);