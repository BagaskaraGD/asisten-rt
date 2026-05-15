'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUserWithRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin(): Promise<void> {
  const currentUser = await getCurrentUserWithRole()
  if (!currentUser || currentUser.role === 'warga') {
    throw new Error('Akses ditolak.')
  }
}

export async function approveLetter(id: string): Promise<void> {
  await assertAdmin()

  const supabase = await createClient()
  await supabase
    .from('letter_requests')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/letter-requests')
  redirect('/admin/letter-requests')
}

export async function rejectLetter(id: string, formData: FormData): Promise<void> {
  await assertAdmin()

  const notes = formData.get('notes')?.toString().trim() ?? ''

  const supabase = await createClient()
  await supabase
    .from('letter_requests')
    .update({
      status: 'rejected',
      admin_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/admin/letter-requests')
  redirect('/admin/letter-requests')
}
