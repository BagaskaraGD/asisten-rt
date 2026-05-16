import type { FaqRow } from '@/lib/database/types'
import type { ScoredFAQ } from '@/lib/ai/types'

/**
 * Mengambil top N FAQ yang paling relevan berdasarkan keyword scoring.
 * Setiap kata dari pesan dicek kemunculannya di question + answer FAQ.
 * Skor = jumlah kata yang cocok.
 *
 * Perluasan dari faq-matcher.ts — mengembalikan top N, bukan hanya top 1,
 * untuk dipakai sebagai konteks dalam RAG.
 */
export function retrieveTopFAQs(
  message: string,
  faqs: FaqRow[],
  topN: number = 3
): ScoredFAQ[] {
  const normalized = message.toLowerCase().trim()

  const words = normalized
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 1) // abaikan kata 1 huruf

  if (words.length === 0 || faqs.length === 0) return []

  return faqs
    .map((faq) => {
      const searchText = `${faq.question} ${faq.answer}`.toLowerCase()
      const score = words.filter((w) => searchText.includes(w)).length
      return { faq, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}
