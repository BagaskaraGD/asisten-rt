'use server'

import { classifyIntent } from '@/lib/ai/classifier'
import { findFaqAnswer } from '@/lib/ai/faq-matcher'
import { getFAQs, DEFAULT_RT_ID } from '@/lib/database/queries'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/server'
import type { AiIntent } from '@/types'

// ─── Teks respons mock per intent ────────────────────────────────────────────

const FALLBACK =
  'Maaf, informasi tersebut belum tersedia di data RT. Saya akan teruskan pertanyaan ini ke pengurus agar dapat dikonfirmasi.'

const GREETING = `Halo! Saya AsistenRT, asisten administrasi RT/RW Anda 👋

Saya bisa membantu:
• Menjawab pertanyaan seputar RT (iuran, jadwal, aturan)
• Memproses permintaan surat pengantar
• Menerima laporan keluhan lingkungan

Ada yang bisa saya bantu hari ini?`

const LETTER_RESPONSE = `Baik, saya siap membantu mengurus surat pengantar 📄

Fitur pembuatan draft surat sedang dalam pengembangan. Setelah aktif, saya akan memandu Anda mengumpulkan data yang diperlukan (nama lengkap, NIK, keperluan, dll) dan draft surat akan disiapkan untuk divalidasi oleh Ketua RT.

Untuk saat ini, silakan hubungi pengurus RT secara langsung.`

const COMPLAINT_RESPONSE = `Terima kasih telah melaporkan. Laporan Anda sudah saya catat 📢

Fitur pencatatan laporan otomatis sedang dalam pengembangan. Setelah aktif, laporan Anda akan langsung masuk ke sistem dan pengurus RT akan menerima notifikasi.

Untuk saat ini, silakan hubungi pengurus RT atau keamanan setempat jika bersifat mendesak.`

const STATUS_RESPONSE = `Untuk mengecek status permintaan surat atau laporan keluhan Anda, fitur pelacakan status sedang dalam pengembangan.

Setelah aktif, Anda bisa langsung cek status di sini tanpa perlu menghubungi pengurus secara manual.`

// ─── Generate reply ───────────────────────────────────────────────────────────

async function generateReply(intent: AiIntent, message: string): Promise<string> {
  switch (intent) {
    case 'greeting':
      return GREETING

    case 'ask_faq': {
      const faqs = await getFAQs()
      const matched = findFaqAnswer(message, faqs)
      if (matched) {
        let response = `Berdasarkan informasi RT, ${matched.answer}`
        if (matched.category) {
          response += `\n\n📂 Kategori: ${matched.category}`
        }
        return response
      }
      return FALLBACK
    }

    case 'request_letter':
      return LETTER_RESPONSE

    case 'submit_complaint':
      return COMPLAINT_RESPONSE

    case 'ask_status':
      return STATUS_RESPONSE

    default:
      return FALLBACK
  }
}

// ─── Supabase persistence ─────────────────────────────────────────────────────

async function getOrCreateSession(sessionId: string | null): Promise<string> {
  // Jika Supabase tidak dikonfigurasi atau session sudah ada, tidak perlu ke DB
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

// ─── Public action ────────────────────────────────────────────────────────────

export async function sendMessage(
  message: string,
  sessionId: string | null
): Promise<{ reply: string; intent: AiIntent; sessionId: string }> {
  const intent = classifyIntent(message)
  const reply = await generateReply(intent, message)
  const activeSessionId = await getOrCreateSession(sessionId)

  // Persistensi dijalankan non-blocking — tidak menghambat respons ke user
  await persistMessages(activeSessionId, message, reply, intent)

  return { reply, intent, sessionId: activeSessionId }
}
