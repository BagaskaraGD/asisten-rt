# AI Setup Guide — Google Gemini

Panduan mengaktifkan fitur AI berbasis Gemini di AsistenRT.
Semua fitur AI **opt-in** via feature flag — aplikasi tetap berjalan tanpa API key.

---

## 1. Dapatkan Gemini API Key

1. Buka [Google AI Studio](https://aistudio.google.com)
2. Login dengan akun Google
3. Klik **Get API key** → **Create API key**
4. Salin API key yang dihasilkan

---

## 2. Isi `.env.local`

Tambahkan atau perbarui baris berikut di `.env.local`:

```env
# Gemini — server-side only
GEMINI_API_KEY=AIza...isi_key_anda...
GEMINI_MODEL=gemini-2.0-flash

# Aktifkan fitur AI
ENABLE_LLM_INTENT=true
ENABLE_LLM_FAQ_RAG=true
```

> **Penting**: Jangan gunakan prefix `NEXT_PUBLIC_` untuk `GEMINI_API_KEY`.
> Key ini hanya boleh dipakai server-side dan tidak boleh di-expose ke browser.

---

## 3. Model yang Tersedia

| Model | Keterangan |
|---|---|
| `gemini-2.0-flash` | Stabil, ringan, direkomendasikan untuk MVP |
| `gemini-2.5-flash` | Lebih canggih, mungkin tersedia di regional tertentu |
| `gemini-1.5-flash` | Alternatif jika model di atas tidak tersedia |

Set model via env: `GEMINI_MODEL=gemini-2.0-flash`

---

## 4. Feature Flags

| Flag | Default | Keterangan |
|---|---|---|
| `ENABLE_LLM_INTENT` | `false` | Gunakan Gemini untuk intent classification |
| `ENABLE_LLM_FAQ_RAG` | `false` | Gunakan Gemini untuk menjawab FAQ via RAG |

Keduanya bisa diaktifkan secara independen:
- Hanya `ENABLE_LLM_INTENT=true` → Gemini classify intent, FAQ masih keyword matching
- Hanya `ENABLE_LLM_FAQ_RAG=true` → Intent masih rule-based, tapi FAQ dijawab Gemini

---

## 5. Cara Test Bahwa Gemini Berjalan

1. Isi `.env.local` dengan API key dan set kedua flag ke `true`
2. Restart dev server: `npm run dev`
3. Buka `/chat`, kirim pesan: **"Iuran bulanan RT berapa?"**
4. Buka Supabase Table Editor → tabel `ai_audit_logs`
5. Periksa record terbaru:
   - `detected_intent` harus `ask_faq`
   - `confidence_score` harus ada (angka dari Gemini)
   - `sources_used` harus berisi array ID FAQ yang digunakan

---

## 6. Fallback Behavior

Jika Gemini tidak tersedia atau terjadi error, sistem **otomatis fallback** ke rule-based:

| Kondisi | Behavior |
|---|---|
| `GEMINI_API_KEY` kosong | Rule-based classifier + keyword FAQ matching |
| `ENABLE_LLM_INTENT=false` | Rule-based classifier |
| `ENABLE_LLM_FAQ_RAG=false` | Keyword FAQ matching (top-1) |
| Gemini API error/timeout | Fallback ke rule-based, chat tidak crash |
| Output JSON invalid | Fallback ke rule-based |
| Confidence Gemini < 0.5 | Fallback ke rule-based |

---

## 7. Guardrails

Gemini dikonfigurasi dengan guardrails ketat:
- Menjawab **hanya** berdasarkan FAQ yang ada di Supabase
- Tidak mengarang informasi yang tidak ada di knowledge base
- Tidak membuat keputusan administratif (approve surat, dll)
- Tidak menyalahkan pihak tertentu dalam laporan keluhan
- Fallback ke admin jika tidak tahu
