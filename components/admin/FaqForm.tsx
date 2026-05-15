'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import type { FaqActionState } from '@/app/admin/faqs/actions'

interface FaqFormProps {
  action: (prevState: FaqActionState, formData: FormData) => Promise<FaqActionState>
  defaultValues?: {
    question: string
    answer: string
    category: string | null
    is_active: boolean
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
    >
      {pending && (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {pending ? 'Menyimpan...' : 'Simpan FAQ'}
    </button>
  )
}

export default function FaqForm({ action, defaultValues }: FaqFormProps) {
  const [state, formAction] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{state.error}</p>
        </div>
      )}

      {/* Pertanyaan */}
      <div>
        <label htmlFor="question" className="mb-1.5 block text-sm font-medium text-gray-700">
          Pertanyaan <span className="text-red-500">*</span>
        </label>
        <textarea
          id="question"
          name="question"
          rows={3}
          required
          minLength={3}
          defaultValue={defaultValues?.question}
          placeholder="Contoh: Berapa iuran bulanan RT?"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Jawaban */}
      <div>
        <label htmlFor="answer" className="mb-1.5 block text-sm font-medium text-gray-700">
          Jawaban <span className="text-red-500">*</span>
        </label>
        <textarea
          id="answer"
          name="answer"
          rows={5}
          required
          minLength={3}
          defaultValue={defaultValues?.answer}
          placeholder="Tulis jawaban selengkap mungkin agar AI bisa menjawab dengan akurat."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Kategori */}
      <div>
        <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-gray-700">
          Kategori <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <input
          id="category"
          name="category"
          type="text"
          defaultValue={defaultValues?.category ?? ''}
          placeholder="Contoh: iuran, kebersihan, keamanan, surat"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Kategori membantu mengelompokkan FAQ di knowledge base.
        </p>
      </div>

      {/* Status aktif */}
      <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={defaultValues?.is_active ?? true}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            FAQ aktif
          </label>
          <p className="mt-0.5 text-xs text-gray-500">
            FAQ yang aktif akan digunakan AI untuk menjawab pertanyaan warga.
            FAQ nonaktif tetap tersimpan tapi tidak dipakai AI.
          </p>
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton />
        <Link
          href="/admin/faqs"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Batal
        </Link>
      </div>
    </form>
  )
}
