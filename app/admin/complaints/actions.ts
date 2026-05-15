'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUserWithRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const VALID_STATUSES = ['new', 'in_review', 'in_progress', 'resolved', 'rejected']

export async function updateComplaintStatus(id: string, formData: FormData): Promise<void> {
  const currentUser = await getCurrentUserWithRole()
  if (!currentUser || currentUser.role === 'warga') return

  const status = formData.get('status')?.toString() ?? ''
  const notes = formData.get('notes')?.toString().trim() || null

  if (!VALID_STATUSES.includes(status)) return

  const supabase = await createClient()
  await supabase
    .from('complaint_reports')
    .update({ status, admin_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/complaints')
  redirect('/admin/complaints')
}
