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