import type { FaqRow } from '@/lib/database/types'

export function findFaqAnswer(message: string, faqs: FaqRow[]): FaqRow | null {
  const normalized = message.toLowerCase().trim()

  // Pecah menjadi kata, bersihkan tanda baca, filter kosong
  const words = normalized
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 0)

  if (words.length === 0 || faqs.length === 0) return null

  let bestFaq: FaqRow | null = null
  let bestScore = 0

  for (const faq of faqs) {
    const searchText = `${faq.question} ${faq.answer}`.toLowerCase()
    const score = words.filter((word) => searchText.includes(word)).length

    if (score > bestScore) {
      bestScore = score
      bestFaq = faq
    }
  }

  return bestScore > 0 ? bestFaq : null
}
