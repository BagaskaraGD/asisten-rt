import type { Metadata } from 'next'
import { getAiAuditLogs } from '@/lib/database/queries'
import { formatDateTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'AI Audit Log — Admin',
}

const INTENT_BADGE: Record<string, string> = {
  ask_faq: 'bg-blue-100 text-blue-700',
  request_letter: 'bg-purple-100 text-purple-700',
  submit_complaint: 'bg-orange-100 text-orange-700',
  ask_status: 'bg-gray-100 text-gray-600',
  greeting: 'bg-green-100 text-green-700',
  unknown: 'bg-red-100 text-red-600',
}

const INTENT_LABELS: Record<string, string> = {
  ask_faq: 'Tanya FAQ',
  request_letter: 'Minta Surat',
  submit_complaint: 'Lapor Keluhan',
  ask_status: 'Cek Status',
  greeting: 'Sapaan',
  unknown: 'Tidak Dikenal',
}

export default async function AdminAiAuditLogsPage() {
  const logs = await getAiAuditLogs()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Audit Log</h1>
          <p className="mt-1 text-sm text-gray-500">
            Riwayat seluruh interaksi AI — input warga, intent terdeteksi, dan respons yang diberikan
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {logs.length} entri
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <span className="mb-4 text-5xl">🔍</span>
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Belum ada log AI</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Log interaksi AI akan muncul di sini setelah warga menggunakan fitur chat.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="card">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      INTENT_BADGE[log.detected_intent] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {INTENT_LABELS[log.detected_intent] ?? log.detected_intent}
                  </span>
                  {log.confidence_score !== null && (
                    <span className="text-xs text-gray-400">
                      confidence: {(log.confidence_score * 100).toFixed(0)}%
                    </span>
                  )}
                  {log.sources_used && log.sources_used.length > 0 && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                      {log.sources_used.length} sumber FAQ
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{formatDateTime(log.created_at)}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-400">Input Warga</p>
                  <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800">
                    {log.input_text}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-400">Respons AI</p>
                  <p className="line-clamp-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-gray-800">
                    {log.ai_response}
                  </p>
                </div>
              </div>

              {log.session_id && (
                <p className="mt-2 font-mono text-[10px] text-gray-300">
                  session: {log.session_id.slice(0, 8)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
