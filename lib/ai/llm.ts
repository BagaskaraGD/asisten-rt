// Server-side only — jangan import file ini di komponen 'use client'.
// GEMINI_API_KEY tidak boleh di-expose ke browser.

import { GoogleGenerativeAI } from '@google/generative-ai'

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

/**
 * Generate teks dari Gemini.
 * Throws jika API key tidak ada atau request timeout.
 * Caller bertanggung jawab menangkap error dan melakukan fallback.
 */
export async function generateText(
  userPrompt: string,
  systemPrompt?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY tidak dikonfigurasi.')

  const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'
  const genAI = new GoogleGenerativeAI(apiKey)

  const model = genAI.getGenerativeModel(
    systemPrompt
      ? { model: modelName, systemInstruction: systemPrompt }
      : { model: modelName }
  )

  // Timeout 15 detik — mencegah request yang menggantung
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API timeout setelah 15 detik')), 15_000)
  )

  const result = await Promise.race([
    model.generateContent(userPrompt),
    timeoutPromise,
  ])

  return result.response.text()
}
