'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

// Metadata tidak bisa diekspor dari Client Component — letakkan di layout atau
// gunakan generateMetadata di server component wrapper jika diperlukan.
// Judul halaman sudah dihandle oleh (auth)/layout.tsx.

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabaseReady = isSupabaseConfigured()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabaseReady) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email atau password salah. Periksa kembali.'
          : 'Terjadi kesalahan saat login. Coba lagi.'
      )
      setIsLoading(false)
      return
    }

    // Refresh server components agar session terbaca, lalu navigasi ke /admin.
    router.refresh()
    router.push('/admin')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">Masuk ke Panel Admin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Khusus pengurus RT yang terdaftar
          </p>
        </div>

        {/* Supabase belum dikonfigurasi */}
        {!supabaseReady && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-800">Database belum dikonfigurasi</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Isi environment variable Supabase di <code>.env.local</code> terlebih dahulu.
            </p>
          </div>
        )}

        {/* Error login */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || !supabaseReady}
              placeholder="admin@rt03.id"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || !supabaseReady}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !supabaseReady}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Belum punya akun? Hubungi pengurus sistem untuk mendaftarkan akun admin.
        </p>
      </div>
    </div>
  )
}
