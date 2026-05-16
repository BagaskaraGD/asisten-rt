import { isSupabaseConfigured, createClient } from '@/lib/supabase/server'
import { DEFAULT_RT_ID } from '@/lib/database/queries'
import type { AiIntent } from '@/types'

interface AuditLogParams {
  sessionId: string
  inputText: string
  intent: AiIntent
  aiResponse: string
  sourceFaqIds?: string[]
  confidenceScore?: number
}

/**
 * Menyimpan log interaksi AI ke tabel ai_audit_logs.
 * Menyimpan sources_used (FAQ IDs) dan confidence_score jika tersedia.
 * Graceful: tidak crash jika Supabase tidak tersedia.
 * Tidak menyimpan API key atau data sensitif lain.
 */
export async function saveAuditLog(params: AuditLogParams): Promise<void> {
  if (!isSupabaseConfigured()) return

  try {
    const supabase = await createClient()
    await supabase.from('ai_audit_logs').insert({
      rt_id: DEFAULT_RT_ID,
      input_text: params.inputText,
      detected_intent: params.intent,
      ai_response: params.aiResponse,
      sources_used: params.sourceFaqIds ?? [],
      confidence_score: params.confidenceScore ?? null,
    })
  } catch (err) {
    // Audit log failure tidak boleh menghentikan response ke user
    console.error('[saveAuditLog] error:', err)
  }
}
