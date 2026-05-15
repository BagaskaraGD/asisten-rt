import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFaqById } from '@/lib/database/queries'
import { updateFaq } from '@/app/admin/faqs/actions'
import FaqForm from '@/components/admin/FaqForm'

export const metadata: Metadata = {
  title: 'Edit FAQ — Admin',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminFaqEditPage({ params }: Props) {
  const { id } = await params
  const faq = await getFaqById(id)

  if (!faq) {
    notFound()
  }

  // Bind id ke action agar signature cocok dengan useActionState
  const updateFaqWithId = updateFaq.bind(null, faq.id)

  return (
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/faqs" className="hover:text-gray-700">
          FAQ
        </Link>
        <span>/</span>
        <span className="text-gray-900">Edit FAQ</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit FAQ</h1>
        <p className="mt-1 text-sm text-gray-500">
          Perubahan akan langsung berlaku setelah disimpan.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="card">
          <FaqForm
            action={updateFaqWithId}
            defaultValues={{
              question: faq.question,
              answer: faq.answer,
              category: faq.category,
              is_active: faq.is_active,
            }}
          />
        </div>
      </div>
    </div>
  )
}
