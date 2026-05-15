'use client'

interface FaqActionButtonsProps {
  isActive: boolean
  toggleAction: () => Promise<void>
  deleteAction: () => Promise<void>
}

export default function FaqActionButtons({
  isActive,
  toggleAction,
  deleteAction,
}: FaqActionButtonsProps) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      {/* Toggle aktif / nonaktif */}
      <form action={toggleAction}>
        <button
          type="submit"
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
            isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {isActive ? 'Aktif' : 'Nonaktif'}
        </button>
      </form>

      {/* Hapus dengan konfirmasi */}
      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!window.confirm('Hapus FAQ ini? Tindakan ini tidak bisa dibatalkan.')) {
            e.preventDefault()
          }
        }}
      >
        <button
          type="submit"
          className="rounded px-2 py-0.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700"
        >
          Hapus
        </button>
      </form>
    </div>
  )
}
