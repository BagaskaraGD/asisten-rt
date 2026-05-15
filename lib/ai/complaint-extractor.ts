import type { ComplaintCategory } from '@/types'

export type ComplaintExtraction = {
  category: ComplaintCategory
  urgency: 'tinggi' | 'sedang'
  location: string | null
}

// ─── Kategori — prioritas: keamanan > fasilitas_umum > kebersihan > ... ──────

const CATEGORY_RULES: { category: ComplaintCategory; keywords: string[] }[] = [
  {
    category: 'keamanan',
    keywords: ['maling', 'kehilangan', 'keributan', 'mencurigakan', 'pencurian', 'rampok'],
  },
  {
    category: 'fasilitas_umum',
    keywords: ['lampu', 'jalan', 'portal', 'pos', 'taman', 'got', 'selokan', 'pagar', 'jembatan', 'halte'],
  },
  {
    category: 'kebersihan',
    keywords: ['sampah', 'bau', 'kotor', 'limbah', 'comberan', 'berantakan'],
  },
  {
    category: 'administrasi',
    keywords: ['administrasi', 'iuran', 'tagihan', 'pendataan'],
  },
  {
    category: 'sosial',
    keywords: ['tetangga', 'bising', 'berisik', 'acara', 'parkir', 'kebisingan'],
  },
]

// ─── Urgensi ──────────────────────────────────────────────────────────────────

const URGENCY_HIGH_KEYWORDS = [
  'darurat', 'bahaya', 'kebakaran', 'banjir', 'maling', 'kecelakaan', 'parah',
]

// ─── Lokasi ───────────────────────────────────────────────────────────────────

const NAMED_PLACES = [
  'pos satpam', 'taman', 'gerbang', 'masjid', 'mushola', 'lapangan', 'halte', 'portal',
]

function extractLocation(message: string): string | null {
  // Prioritas 1: pola "blok X" atau "blok B12"
  const blokMatch = message.match(/\bblok\s+([A-Za-z0-9]+)/i)
  if (blokMatch) return `Blok ${blokMatch[1].toUpperCase()}`

  // Prioritas 2: nama tempat umum
  const msgLower = message.toLowerCase()
  for (const place of NAMED_PLACES) {
    if (msgLower.includes(place)) return place
  }

  // Prioritas 3: pola "depan/dekat/belakang X"
  const dirMatch = message.match(/\b(depan|dekat|belakang)\s+([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?)/i)
  if (dirMatch) return `${dirMatch[1]} ${dirMatch[2].trim()}`

  return null
}

// ─── Main extractor ───────────────────────────────────────────────────────────

export function extractComplaint(message: string): ComplaintExtraction {
  const normalized = message.toLowerCase()

  // Kategori
  let category: ComplaintCategory = 'lainnya'
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) {
      category = rule.category
      break
    }
  }

  // Urgensi
  const urgency: 'tinggi' | 'sedang' = URGENCY_HIGH_KEYWORDS.some((kw) =>
    normalized.includes(kw)
  )
    ? 'tinggi'
    : 'sedang'

  // Lokasi
  const location = extractLocation(message)

  return { category, urgency, location }
}
