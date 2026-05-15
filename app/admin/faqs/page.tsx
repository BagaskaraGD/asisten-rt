import type { Metadata } from 'next'
import { getFAQs } from '@/lib/database/queries'

export const metadata: Metadata = {
  title: 'FAQ — Admin',
}

export default async function AdminFaqsPage() {
  const faqs = await getFAQs()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="mt-1 text-sm text-gray-500">
            Knowledge base yang digunakan AI untuk menjawab pertanyaan warga
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {faqs.length} FAQ aktif
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            Read-only
          </span>
        </div>
      </div>

      {faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <span className="mb-4 text-5xl">❓</span>
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Belum ada FAQ</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Pastikan seed SQL sudah dijalankan di Supabase.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {faqs.map((faq, index) => (
            <li key={faq.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{faq.question}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {faq.category && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {faq.category}
                    </span>
                  )}
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Aktif
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
