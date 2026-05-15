'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUserWithRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_RT_ID } from '@/lib/database/queries'

export type FaqActionState = { error: string } | undefined

// ─── Auth guard ──────────────────────────────────────────────────────────────

async function assertAdmin(): Promise<void | FaqActionState> {
  const currentUser = await getCurrentUserWithRole()
  if (!currentUser) return { error: 'Tidak ada session aktif. Silakan login kembali.' }
  if (currentUser.role === 'warga') return { error: 'Akses ditolak.' }
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createFaq(
  _prev: FaqActionState,
  formData: FormData
): Promise<FaqActionState> {
  const authError = await assertAdmin()
  if (authError) return authError

  const question = formData.get('question')?.toString().trim() ?? ''
  const answer = formData.get('answer')?.toString().trim() ?? ''
  const category = formData.get('category')?.toString().trim() || null
  const isActive = formData.get('is_active') === 'on'

  if (question.length < 3) return { error: 'Pertanyaan minimal 3 karakter.' }
  if (answer.length < 3) return { error: 'Jawaban minimal 3 karakter.' }

  const supabase = await createClient()
  const { error } = await supabase.from('faqs').insert({
    rt_id: DEFAULT_RT_ID,
    question,
    answer,
    category,
    is_active: isActive,
  })

  if (error) return { error: `Gagal menyimpan FAQ: ${error.message}` }

  revalidatePath('/admin/faqs')
  redirect('/admin/faqs')
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateFaq(
  id: string,
  _prev: FaqActionState,
  formData: FormData
): Promise<FaqActionState> {
  const authError = await assertAdmin()
  if (authError) return authError

  const question = formData.get('question')?.toString().trim() ?? ''
  const answer = formData.get('answer')?.toString().trim() ?? ''
  const category = formData.get('category')?.toString().trim() || null
  const isActive = formData.get('is_active') === 'on'

  if (question.length < 3) return { error: 'Pertanyaan minimal 3 karakter.' }
  if (answer.length < 3) return { error: 'Jawaban minimal 3 karakter.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('faqs')
    .update({
      question,
      answer,
      category,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: `Gagal memperbarui FAQ: ${error.message}` }

  revalidatePath('/admin/faqs')
  redirect('/admin/faqs')
}

// ─── Toggle aktif / nonaktif ─────────────────────────────────────────────────

export async function toggleFaqActive(id: string, newIsActive: boolean): Promise<void> {
  const currentUser = await getCurrentUserWithRole()
  if (!currentUser || currentUser.role === 'warga') return

  const supabase = await createClient()
  await supabase
    .from('faqs')
    .update({ is_active: newIsActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/faqs')
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteFaq(id: string): Promise<void> {
  const currentUser = await getCurrentUserWithRole()
  if (!currentUser || currentUser.role === 'warga') return

  const supabase = await createClient()
  await supabase.from('faqs').delete().eq('id', id)

  revalidatePath('/admin/faqs')
}
