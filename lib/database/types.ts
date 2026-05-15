// Tipe-tipe ini mencerminkan kolom SQL secara langsung (snake_case).
// Jangan ubah nama field — harus cocok dengan hasil query Supabase.

export type RtRow = {
  id: string
  name: string
  rw: string | null
  area_name: string | null
  kelurahan: string | null
  kecamatan: string | null
  city: string
  address: string | null
  chairman_name: string | null
  secretary_name: string | null
  treasurer_name: string | null
  security_contact: string | null
  created_at: string
  updated_at: string
}

export type FaqRow = {
  id: string
  rt_id: string
  question: string
  answer: string
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type LetterTemplateRow = {
  id: string
  rt_id: string
  letter_type: string
  required_fields: string[]
  template_body: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type LetterRequestRow = {
  id: string
  rt_id: string
  user_id: string | null
  letter_type: string
  status: string
  form_data: Record<string, string>
  draft_text: string | null
  admin_notes: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export type ComplaintReportRow = {
  id: string
  rt_id: string
  user_id: string | null
  category: string
  description: string
  location: string | null
  urgency: string | null
  status: string
  assigned_to: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}
