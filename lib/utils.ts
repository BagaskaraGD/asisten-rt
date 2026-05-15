import type { ComplaintStatus, LetterStatus, ComplaintCategory } from '@/types'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function getComplaintStatusLabel(status: ComplaintStatus): string {
  const labels: Record<ComplaintStatus, string> = {
    new: 'Baru',
    in_review: 'Sedang Ditinjau',
    in_progress: 'Diproses',
    resolved: 'Selesai',
    rejected: 'Ditolak',
  }
  return labels[status]
}

export function getLetterStatusLabel(status: LetterStatus): string {
  const labels: Record<LetterStatus, string> = {
    collecting_data: 'Mengumpulkan Data',
    waiting_admin_review: 'Menunggu Persetujuan',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    completed: 'Selesai',
  }
  return labels[status]
}

export function getComplaintCategoryLabel(category: ComplaintCategory): string {
  const labels: Record<ComplaintCategory, string> = {
    fasilitas_umum: 'Fasilitas Umum',
    keamanan: 'Keamanan',
    kebersihan: 'Kebersihan',
    administrasi: 'Administrasi',
    sosial: 'Sosial',
    lainnya: 'Lainnya',
  }
  return labels[category]
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
