import type { AiIntent } from '@/types'

// Prioritas: greeting → ask_faq → request_letter → submit_complaint → ask_status → unknown
const RULES: { intent: AiIntent; keywords: string[] }[] = [
  {
    intent: 'greeting',
    keywords: ['halo', 'hai', 'hi', 'pagi', 'siang', 'malam', 'selamat pagi', 'selamat siang', 'selamat malam'],
  },
  {
    intent: 'ask_faq',
    keywords: ['iuran', 'sampah', 'tamu', 'domisili', 'jadwal', 'ronda', 'aturan', 'keamanan', 'kebersihan'],
  },
  {
    intent: 'request_letter',
    keywords: ['surat', 'skck', 'sku', 'pengantar', 'tidak mampu', 'rekomendasi', 'keterangan usaha'],
  },
  {
    intent: 'submit_complaint',
    keywords: ['rusak', 'mati', 'bocor', 'selokan', 'menumpuk', 'parkir', 'bau', 'gelap', 'banjir', 'lampu'],
  },
  {
    intent: 'ask_status',
    keywords: ['status', 'sudah jadi', 'sampai mana', 'sudah selesai', 'kapan selesai', 'cek'],
  },
]

export function classifyIntent(message: string): AiIntent {
  const normalized = message.toLowerCase().trim()

  for (const rule of RULES) {
    const matched = rule.keywords.some((keyword) => normalized.includes(keyword))
    if (matched) return rule.intent
  }

  return 'unknown'
}
