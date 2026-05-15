// User roles
export type UserRole = 'super_admin' | 'rt_admin' | 'warga'

// Letter statuses
export type LetterStatus =
  | 'collecting_data'
  | 'waiting_admin_review'
  | 'approved'
  | 'rejected'
  | 'completed'

// Complaint statuses
export type ComplaintStatus =
  | 'new'
  | 'in_review'
  | 'in_progress'
  | 'resolved'
  | 'rejected'

// Complaint categories
export type ComplaintCategory =
  | 'fasilitas_umum'
  | 'keamanan'
  | 'kebersihan'
  | 'administrasi'
  | 'sosial'
  | 'lainnya'

// AI intent types
export type AiIntent =
  | 'ask_faq'
  | 'request_letter'
  | 'submit_complaint'
  | 'ask_status'
  | 'greeting'
  | 'unknown'

// RT Profile
export interface RtProfile {
  id: string
  name: string
  rtNumber: string
  rwNumber: string
  kelurahan: string
  kecamatan: string
  kota: string
  province: string
  contactKetua?: string
  contactSekretaris?: string
  contactBendahara?: string
  createdAt: string
  updatedAt: string
}

// User
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  rtId?: string
  phone?: string
  address?: string
  createdAt: string
}

// FAQ
export interface Faq {
  id: string
  rtId: string
  question: string
  answer: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Chat message
export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

// Letter request
export interface LetterRequest {
  id: string
  rtId: string
  residentId: string
  templateId: string
  status: LetterStatus
  draftContent?: string
  collectedData: Record<string, string>
  adminNote?: string
  createdAt: string
  updatedAt: string
}

// Complaint report
export interface ComplaintReport {
  id: string
  rtId: string
  residentId: string
  rawText: string
  category: ComplaintCategory
  location?: string
  urgency?: 'rendah' | 'sedang' | 'tinggi'
  status: ComplaintStatus
  adminNote?: string
  createdAt: string
  updatedAt: string
}

// AI Audit Log
export interface AiAuditLog {
  id: string
  sessionId?: string
  userId?: string
  intent: AiIntent
  userInput: string
  aiResponse: string
  sourceFaqIds?: string[]
  modelUsed: string
  createdAt: string
}

// Navigation item
export interface NavItem {
  label: string
  href: string
  icon?: string
}
