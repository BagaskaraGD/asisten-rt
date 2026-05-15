import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

export type AuthUser = {
  id: string
  email: string
}

export type UserWithRole = {
  user: AuthUser
  role: UserRole
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !user.email) return null

  return { id: user.id, email: user.email }
}

export async function getUserRole(email: string): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .single()

  if (error || !data) return null

  return data.role as UserRole
}

// cache() deduplicates calls dalam satu request RSC tree.
// Layout dan page child bisa memanggil ini tanpa double round-trip ke Supabase.
export const getCurrentUserWithRole = cache(
  async (): Promise<UserWithRole | null> => {
    const user = await getUser()
    if (!user) return null

    const role = await getUserRole(user.email)
    if (!role) return null

    return { user, role }
  }
)
