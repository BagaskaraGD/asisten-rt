import { classifyIntent } from '@/lib/ai/classifier'
import { generateText, isGeminiConfigured } from '@/lib/ai/llm'
import type { IntentClassificationResult } from '@/lib/ai/types'
import type { AiIntent } from '@/types'

const VALID_INTENTS: AiIntent[] = [
  'ask_faq',
  'request_letter',
  'submit_complaint',
  'ask_status',
  'greeting',
  'unknown',
]

// Prompt yang sama persis dengan prompts/intent_classifier_prompt.md
const INTENT_SYSTEM_PROMPT = `Klasifikasikan pesan warga ke salah satu intent berikut:
- ask_faq
- request_letter
- submit_complaint
- ask_status
- greeting
- unknown

Kembalikan JSON valid saja tanpa backtick, tanpa markdown, tanpa penjelasan.

Format:
{"intent": "", "confidence": 0.0, "reason": ""}

Contoh:
Pesan: "Saya mau bikin surat pengantar SKCK"
Output:
{"intent": "request_letter", "confidence": 0.95, "reason": "Warga meminta pembuatan surat pengantar"}`

function parseIntentOutput(raw: string): {
  intent: AiIntent
  confidence: number
  reason: string
} | null {
  try {
    // Bersihkan wrapping markdown yang kadang ditambahkan Gemini
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()

    const obj = JSON.parse(cleaned) as Record<string, unknown>

    if (
      typeof obj.intent === 'string' &&
      VALID_INTENTS.includes(obj.intent as AiIntent) &&
      typeof obj.confidence === 'number'
    ) {
      return {
        intent: obj.intent as AiIntent,
        confidence: Math.min(1, Math.max(0, obj.confidence)),
        reason: typeof obj.reason === 'string' ? obj.reason : '',
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Klasifikasi intent pesan.
 * Jika ENABLE_LLM_INTENT=true dan Gemini tersedia → pakai LLM.
 * Jika tidak → fallback ke rule-based classifier.
 * Jika LLM error atau confidence < 0.5 → fallback ke rule-based.
 */
export async function resolveIntent(
  message: string
): Promise<IntentClassificationResult> {
  const fallback = (): IntentClassificationResult => ({
    intent: classifyIntent(message),
    confidence: 1.0,
    reason: 'Rule-based classification',
    source: 'rule-based',
  })

  if (process.env.ENABLE_LLM_INTENT !== 'true' || !isGeminiConfigured()) {
    return fallback()
  }

  try {
    const raw = await generateText(
      `Pesan warga: "${message}"`,
      INTENT_SYSTEM_PROMPT
    )
    const parsed = parseIntentOutput(raw)

    if (!parsed || parsed.confidence < 0.5) {
      return fallback()
    }

    return { ...parsed, source: 'llm' }
  } catch (err) {
    console.error('[resolveIntent] Gemini error, fallback ke rule-based:', err)
    return fallback()
  }
}
