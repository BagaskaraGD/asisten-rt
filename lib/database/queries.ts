import { isSupabaseConfigured, createClient } from '@/lib/supabase/server'
import type {
  RtRow,
  FaqRow,
  LetterTemplateRow,
  LetterRequestRow,
  ComplaintReportRow,
} from '@/lib/database/types'

// ID RT default dari seed data.
export const DEFAULT_RT_ID = '11111111-1111-1111-1111-111111111111'

/**
 * Mengambil profil RT berdasarkan ID.
 * Mengembalikan null jika Supabase belum dikonfigurasi atau data tidak ditemukan.
 */
export async function getRTProfile(rtId: string = DEFAULT_RT_ID): Promise<RtRow | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rts')
    .select('*')
    .eq('id', rtId)
    .single()

  if (error) {
    console.error('[getRTProfile] error:', error.message)
    return null
  }

  return data as RtRow
}

/**
 * Mengambil semua FAQ aktif untuk satu RT (dipakai AI dan chat warga).
 * Mengembalikan array kosong jika Supabase belum dikonfigurasi.
 */
export async function getFAQs(rtId: string = DEFAULT_RT_ID): Promise<FaqRow[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('rt_id', rtId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getFAQs] error:', error.message)
    return []
  }

  return (data ?? []) as FaqRow[]
}

/**
 * Mengambil SEMUA FAQ (aktif dan nonaktif) untuk keperluan admin CRUD.
 * Diurutkan: aktif lebih dulu, lalu created_at ascending.
 */
export async function getAllFAQs(rtId: string = DEFAULT_RT_ID): Promise<FaqRow[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('rt_id', rtId)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getAllFAQs] error:', error.message)
    return []
  }

  return (data ?? []) as FaqRow[]
}

/**
 * Mengambil satu FAQ berdasarkan ID (untuk halaman edit).
 * Mengembalikan null jika tidak ditemukan.
 */
export async function getFaqById(id: string): Promise<FaqRow | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getFaqById] error:', error.message)
    return null
  }

  return data as FaqRow
}

/**
 * Mengambil semua template surat aktif untuk satu RT.
 * Mengembalikan array kosong jika Supabase belum dikonfigurasi.
 */
export async function getLetterTemplates(
  rtId: string = DEFAULT_RT_ID
): Promise<LetterTemplateRow[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('letter_templates')
    .select('*')
    .eq('rt_id', rtId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getLetterTemplates] error:', error.message)
    return []
  }

  return (data ?? []) as LetterTemplateRow[]
}

/**
 * Mengambil semua laporan keluhan untuk satu RT.
 * Mengembalikan array kosong jika Supabase belum dikonfigurasi.
 */
export async function getComplaintReports(
  rtId: string = DEFAULT_RT_ID
): Promise<ComplaintReportRow[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('complaint_reports')
    .select('*')
    .eq('rt_id', rtId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getComplaintReports] error:', error.message)
    return []
  }

  return (data ?? []) as ComplaintReportRow[]
}

// ─── Letter Templates ─────────────────────────────────────────────────────────

export async function getLetterTemplate(
  letterType: string,
  rtId: string = DEFAULT_RT_ID
): Promise<LetterTemplateRow | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('letter_templates')
    .select('*')
    .eq('rt_id', rtId)
    .eq('letter_type', letterType)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('[getLetterTemplate] error:', error.message)
    return null
  }

  return data as LetterTemplateRow
}

// ─── Letter Requests ──────────────────────────────────────────────────────────

export async function getLetterRequest(id: string): Promise<LetterRequestRow | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('letter_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getLetterRequest] error:', error.message)
    return null
  }

  return data as LetterRequestRow
}

export async function getAllLetterRequests(
  rtId: string = DEFAULT_RT_ID
): Promise<LetterRequestRow[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('letter_requests')
    .select('*')
    .eq('rt_id', rtId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getAllLetterRequests] error:', error.message)
    return []
  }

  return (data ?? []) as LetterRequestRow[]
}
