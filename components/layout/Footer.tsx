export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AsistenRT. Platform Administrasi RT/RW berbasis AI.
          </p>
          <p className="text-xs text-gray-400">
            AI membantu, keputusan tetap di tangan pengurus RT.
          </p>
        </div>
      </div>
    </footer>
  )
}
