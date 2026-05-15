import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllFAQs } from '@/lib/database/queries'
import { toggleFaqActive, deleteFaq } from '@/app/admin/faqs/actions'
import FaqActionButtons from '@/components/admin/FaqActionButtons'

export const metadata: Metadata = {
  title: 'FAQ — Admin',
}

export default async function AdminFaqsPage() {
  const faqs = await getAllFAQs()
  const activeCount = faqs.filter((f) => f.is_active).length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="mt-1 text-sm text-gray-500">
            Knowledge base yang digunakan AI untuk menjawab pertanyaan warga
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {activeCount} aktif
          </span>
          <Link
            href="/admin/faqs/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <span aria-hidden="true">+</span> Tambah FAQ
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <span className="mb-4 text-5xl">❓</span>
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Belum ada FAQ</h2>
          <p className="mb-6 max-w-sm text-sm text-gray-500">
            Tambahkan FAQ pertama agar AI bisa mulai menjawab pertanyaan warga.
          </p>
          <Link
            href="/admin/faqs/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <span aria-hidden="true">+</span> Tambah FAQ Pertama
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {faqs.map((faq, index) => {
            const toggleAction = toggleFaqActive.bind(null, faq.id, !faq.is_active)
            const deleteAction = deleteFaq.bind(null, faq.id)

            return (
              <li
                key={faq.id}
                className={`card flex items-start justify-between gap-4 ${
                  !faq.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Nomor + konten */}
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{faq.question}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {faq.category && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {faq.category}
                        </span>
                      )}
                      <Link
                        href={`/admin/faqs/${faq.id}/edit`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Aksi: toggle + hapus */}
                <FaqActionButtons
                  isActive={faq.is_active}
                  toggleAction={toggleAction}
                  deleteAction={deleteAction}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
