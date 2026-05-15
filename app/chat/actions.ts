'use server'

import { classifyIntent } from '@/lib/ai/classifier'
import { findFaqAnswer } from '@/lib/ai/faq-matcher'
import { parseFieldValues } from '@/lib/ai/field-parser'
import { extractComplaint } from '@/lib/ai/complaint-extractor'
import {
  getFAQs,
  getLetterTemplate,
  getLetterRequest,
  DEFAULT_RT_ID,
} from '@/lib/database/queries'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/server'
import type { AiIntent } from '@/types'

// ─── Response teks ────────────────────────────────────────────────────────────

const FALLBACK =
  'Maaf, informasi tersebut belum tersedia di data RT. Saya akan teruskan pertanyaan ini ke pengurus agar dapat dikonfirmasi.'

const GREETING = `Halo! Saya AsistenRT, asisten administrasi RT/RW Anda 👋

Saya bisa membantu:
• Menjawab pertanyaan seputar RT (iuran, jadwal, aturan)
• Memproses permintaan surat pengantar
• Menerima laporan keluhan lingkungan

Ada yang bisa saya bantu hari ini?`

const LETTER_CHOOSE = `Baik, saya siap membantu membuat surat pengantar 📄

Silakan pilih jenis surat yang Anda butuhkan:
1. Surat Keterangan Domisili
2. Surat Pengantar SKCK
3. Surat Keterangan Usaha (SKU)

Balas dengan nama jenis surat atau nomornya.`

const LETTER_COMPLETE = `Draft surat Anda sudah dibuat ✅

Permintaan surat telah diteruskan ke pengurus RT untuk divalidasi.
Pengurus akan meninjau dan menghubungi Anda jika diperlukan.

Status: Menunggu persetujuan admin RT`

const COMPLAINT_OFFLINE = `Laporan Anda telah kami catat sementara 📢

Untuk keperluan mendesak, silakan hubungi pengurus RT atau keamanan setempat
secara langsung di 0812-0000-0000.`

const CATEGORY_LABELS: Record<string, string> = {
  fasilitas_umum: 'Fasilitas Umum',
  keamanan: 'Keamanan',
  kebersihan: 'Kebersihan',
  administrasi: 'Administrasi',
  sosial: 'Sosial',
  lainnya: 'Lainnya',
}

const STATUS_RESPONSE = `Untuk mengecek status permintaan surat atau laporan keluhan Anda,
fitur pelacakan status sedang dalam pengembangan.

Setelah aktif, Anda bisa langsung cek status di sini tanpa perlu menghubungi pengurus
secara manual.`

// ─── Label field ─────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  nama_lengkap: 'Nama Lengkap',
  nik: 'NIK (16 digit)',
  nomor_kk: 'Nomor KK (Kartu Keluarga)',
  alamat: 'Alamat Lengkap',
  keperluan: 'Keperluan Surat',
  tempat_lahir: 'Tempat Lahir',
  tanggal_lahir: 'Tanggal Lahir (YYYY-MM-DD)',
  jenis_kelamin: 'Jenis Kelamin',
  agama: 'Agama',
  pekerjaan: 'Pekerjaan',
  nama_usaha: 'Nama Usaha',
  jenis_usaha: 'Jenis Usaha',
  alamat_usaha: 'Alamat Usaha',
}

const LETTER_TYPE_LABELS: Record<string, string> = {
  domisili: 'Surat Keterangan Domisili',
  skck: 'Surat Pengantar SKCK',
  sku: 'Surat Keterangan Usaha (SKU)',
}

function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/_/g, ' ')
}

function buildMissingFieldsResponse(
  missingFields: string[],
  letterType: string
): string {
  const typeName = LETTER_TYPE_LABELS[letterType] ?? letterType
  const bulletList = missingFields.map((f) => `• ${fieldLabel(f)}`).join('\n')
  const formatHint = missingFields.map((f) => `${f}: [isi di sini]`).join('\n')

  return `Untuk ${typeName}, masih ada data yang belum saya terima:

${bulletList}

Silakan kirim dengan format:
${formatHint}`
}

function buildInitialFieldRequest(
  requiredFields: string[],
  letterType: string
): string {
  const typeName = LETTER_TYPE_LABELS[letterType] ?? letterType
  const formatHint = requiredFields.map((f) => `${f}: [isi di sini]`).join('\n')

  return `Baik, saya akan membantu membuat ${typeName} 📄

Silakan kirim data berikut (bisa sekaligus atau satu per satu):
${formatHint}`
}

// ─── Deteksi jenis surat ──────────────────────────────────────────────────────

function detectLetterType(message: string): string | null {
  const msg = message.toLowerCase()
  if (msg.includes('domisili')) return 'domisili'
  if (msg.includes('skck')) return 'skck'
  if (msg.includes('sku') || msg.includes('keterangan usaha') || msg.includes('usaha')) return 'sku'
  // Pilihan berupa angka
  if (msg.trim() === '1') return 'domisili'
  if (msg.trim() === '2') return 'skck'
  if (msg.trim() === '3') return 'sku'
  return null
}

// ─── Generate draft text ──────────────────────────────────────────────────────

function generateDraftText(
  templateBody: string,
  formData: Record<string, string>
): string {
  const now = new Date()
  const tanggal = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const tahun = now.getFullYear().toString()

  let text = templateBody
  text = text.replace(/\{TANGGAL\}/g, tanggal)
  text = text.replace(/\{TAHUN\}/g, tahun)

  for (const [key, value] of Object.entries(formData)) {
    text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }

  return text
}

// ─── Supabase: letter request operations ─────────────────────────────────────

async function createLetterRequestRecord(letterType: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return crypto.randomUUID()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('letter_requests')
    .insert({
      rt_id: DEFAULT_RT_ID,
      letter_type: letterType,
      status: 'collecting_data',
      form_data: {},
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[createLetterRequestRecord] error:', error?.message)
    return null
  }

  return data.id
}

async function updateLetterFormData(
  id: string,
  formData: Record<string, string>
): Promise<void> {
  if (!isSupabaseConfigured()) return

  const supabase = await createClient()
  await supabase
    .from('letter_requests')
    .update({ form_data: formData, updated_at: new Date().toISOString() })
    .eq('id', id)
}

async function finalizeLetterDraft(id: string, draftText: string): Promise<void> {
  if (!isSupabaseConfigured()) return

  const supabase = await createClient()
  await supabase
    .from('letter_requests')
    .update({
      draft_text: draftText,
      status: 'waiting_admin_review',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
}

// ─── Supabase: chat persistence ───────────────────────────────────────────────

async function getOrCreateSession(sessionId: string | null): Promise<string> {
  if (!isSupabaseConfigured() || sessionId) {
    return sessionId ?? crypto.randomUUID()
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ rt_id: DEFAULT_RT_ID, channel: 'web', user_id: null })
    .select('id')
    .single()

  if (error || !data) return crypto.randomUUID()
  return data.id
}

async function persistMessages(
  sessionId: string,
  userMessage: string,
  aiReply: string,
  intent: AiIntent
): Promise<void> {
  if (!isSupabaseConfigured()) return

  const supabase = await createClient()
  await Promise.all([
    supabase.from('chat_messages').insert({
      session_id: sessionId,
      sender_type: 'user',
      message_text: userMessage,
    }),
    supabase.from('chat_messages').insert({
      session_id: sessionId,
      sender_type: 'assistant',
      message_text: aiReply,
      intent,
    }),
    supabase.from('ai_audit_logs').insert({
      rt_id: DEFAULT_RT_ID,
      input_text: userMessage,
      detected_intent: intent,
      ai_response: aiReply,
      sources_used: [],
    }),
  ])
}

// ─── Letter flow handlers ─────────────────────────────────────────────────────

async function handleNewLetterRequest(message: string): Promise<{
  reply: string
  letterRequestId: string | null
}> {
  const letterType = detectLetterType(message)

  if (!letterType) {
    return { reply: LETTER_CHOOSE, letterRequestId: null }
  }

  const template = await getLetterTemplate(letterType)
  if (!template) {
    return {
      reply: 'Maaf, template surat tidak ditemukan. Silakan hubungi pengurus RT secara langsung.',
      letterRequestId: null,
    }
  }

  const requestId = await createLetterRequestRecord(letterType)
  if (!requestId) {
    return {
      reply: 'Maaf, terjadi kesalahan saat membuat permintaan surat. Silakan coba lagi.',
      letterRequestId: null,
    }
  }

  const reply = buildInitialFieldRequest(template.required_fields, letterType)
  return { reply, letterRequestId: requestId }
}

async function handleSlotFilling(
  message: string,
  letterRequestId: string
): Promise<{ reply: string; completed: boolean }> {
  const request = await getLetterRequest(letterRequestId)
  if (!request) {
    return {
      reply: 'Maaf, sesi surat tidak ditemukan. Silakan mulai kembali.',
      completed: true,
    }
  }

  const newValues = parseFieldValues(message)
  const updatedFormData: Record<string, string> = { ...request.form_data, ...newValues }

  const template = await getLetterTemplate(request.letter_type)
  if (!template) {
    return { reply: 'Maaf, template surat tidak ditemukan.', completed: true }
  }

  const missingFields = template.required_fields.filter((f) => !updatedFormData[f])

  await updateLetterFormData(letterRequestId, updatedFormData)

  if (missingFields.length > 0) {
    const reply = buildMissingFieldsResponse(missingFields, request.letter_type)
    return { reply, completed: false }
  }

  // Semua field lengkap — generate draft
  const draftText = generateDraftText(template.template_body, updatedFormData)
  await finalizeLetterDraft(letterRequestId, draftText)

  return { reply: LETTER_COMPLETE, completed: true }
}

// ─── Complaint handler ────────────────────────────────────────────────────────

async function handleComplaint(message: string): Promise<string> {
  const { category, urgency, location } = extractComplaint(message)

  const categoryLabel = CATEGORY_LABELS[category] ?? category
  const urgencyLabel = urgency === 'tinggi' ? 'Tinggi 🔴' : 'Sedang 🟡'
  const locationDisplay = location ?? 'Tidak disebutkan'

  if (!isSupabaseConfigured()) return COMPLAINT_OFFLINE

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('complaint_reports')
    .insert({
      rt_id: DEFAULT_RT_ID,
      user_id: null,
      category,
      description: message,
      location,
      urgency,
      status: 'new',
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[handleComplaint] error:', error?.message)
    return COMPLAINT_OFFLINE
  }

  const shortId = data.id.slice(0, 8).toUpperCase()

  return `Laporan Anda telah kami terima dan dicatat 📢

Ringkasan laporan:
• Kategori  : ${categoryLabel}
• Lokasi    : ${locationDisplay}
• Urgensi   : ${urgencyLabel}

Laporan ini akan segera ditinjau oleh pengurus RT.
Untuk keperluan mendesak, hubungi keamanan di 0812-0000-0000.

ID Laporan : ${shortId}`
}

// ─── Generate reply untuk intent lain ────────────────────────────────────────

async function generateReply(intent: AiIntent, message: string): Promise<string> {
  switch (intent) {
    case 'greeting':
      return GREETING

    case 'ask_faq': {
      const faqs = await getFAQs()
      const matched = findFaqAnswer(message, faqs)
      if (matched) {
        let response = `Berdasarkan informasi RT, ${matched.answer}`
        if (matched.category) response += `\n\n📂 Kategori: ${matched.category}`
        return response
      }
      return FALLBACK
    }

    case 'submit_complaint':
      return handleComplaint(message)

    case 'ask_status':
      return STATUS_RESPONSE

    default:
      return FALLBACK
  }
}

// ─── Public action ────────────────────────────────────────────────────────────

export async function sendMessage(
  message: string,
  sessionId: string | null,
  letterRequestId: string | null
): Promise<{
  reply: string
  intent: AiIntent
  sessionId: string
  letterRequestId: string | null
}> {
  const activeSessionId = await getOrCreateSession(sessionId)

  let reply: string
  let intent: AiIntent
  let newLetterRequestId = letterRequestId

  if (letterRequestId) {
    // Ada surat aktif — proses sebagai slot filling
    intent = 'request_letter'
    const result = await handleSlotFilling(message, letterRequestId)
    reply = result.reply
    if (result.completed) newLetterRequestId = null
  } else {
    intent = classifyIntent(message)

    if (intent === 'request_letter') {
      const result = await handleNewLetterRequest(message)
      reply = result.reply
      newLetterRequestId = result.letterRequestId
    } else {
      reply = await generateReply(intent, message)
    }
  }

  await persistMessages(activeSessionId, message, reply, intent)

  return { reply, intent, sessionId: activeSessionId, letterRequestId: newLetterRequestId }
}
