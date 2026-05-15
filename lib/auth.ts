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

/**
 * Membaca user yang sedang login dari session Supabase.
 * Menggunakan getUser() (bukan getSession()) agar token divalidasi ke server Auth.
 * Mengembalikan null jika tidak ada session aktif.
 */
export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !user.email) return null

  return { id: user.id, email: user.email }
}

/**
 * Membaca role user dari tabel `users` aplikasi berdasarkan email.
 * Role TIDAK dibaca dari metadata auth.users agar lebih aman dan terkontrol.
 * Mengembalikan null jika user tidak ditemukan di tabel `users`.
 */
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

/**
 * Shortcut: dapatkan user dan rolenya sekaligus.
 * Mengembalikan null jika tidak ada session atau user tidak ada di tabel `users`.
 */
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  const user = await getUser()
  if (!user) return null

  const role = await getUserRole(user.email)
  if (!role) return null

  return { user, role }
}
