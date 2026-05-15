interface ComingSoonCardProps {
  icon: string
  title: string
  description: string
}

export default function ComingSoonCard({
  icon,
  title,
  description,
}: ComingSoonCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
      <span className="mb-4 text-5xl">{icon}</span>
      <h2 className="mb-2 text-lg font-semibold text-gray-700">{title}</h2>
      <p className="max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
      <p className="mt-4 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-400">
        Fitur ini akan tersedia di task berikutnya
      </p>
    </div>
  )
}
