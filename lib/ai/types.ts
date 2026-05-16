import type { AiIntent } from '@/types'
import type { FaqRow } from '@/lib/database/types'

export type IntentClassificationResult = {
  intent: AiIntent
  confidence: number
  reason: string
  source: 'llm' | 'rule-based'
}

export type ScoredFAQ = {
  faq: FaqRow
  score: number
}

export type FAQAnswerResult = {
  answer: string
  sourceFaqIds: string[]
  usedFallback: boolean
}
