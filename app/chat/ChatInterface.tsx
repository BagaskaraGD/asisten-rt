'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { sendMessage } from './actions'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import type { AiIntent } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  intent?: AiIntent
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Halo! Saya AsistenRT, asisten administrasi RT/RW Anda 👋

Saya bisa membantu:
• Menjawab pertanyaan seputar RT (iuran, jadwal, aturan)
• Memproses permintaan surat pengantar
• Menerima laporan keluhan lingkungan

Ada yang bisa saya bantu hari ini?`,
}

const SUGGESTED_QUESTIONS = [
  'Iuran bulan ini berapa?',
  'Kapan jadwal pengambilan sampah?',
  'Bagaimana aturan tamu menginap?',
  'Saya mau buat surat SKCK',
  'Lampu jalan blok C mati',
]

// ─── Sub-komponen ──────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <span className="text-sm">🤖</span>
      </div>
      <div className="rounded-2xl rounded-tl-none border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2">
        <div className="max-w-[75%] rounded-2xl rounded-tr-none bg-blue-600 px-4 py-3">
          <p className="text-sm leading-relaxed text-white" style={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <span className="text-sm">👤</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <span className="text-sm">🤖</span>
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-tl-none border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm leading-relaxed text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </p>
        {message.intent && message.intent !== 'unknown' && message.id !== 'welcome' && (
          <p className="mt-1.5 text-[11px] text-gray-400">
            intent: {message.intent}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [letterRequestId, setLetterRequestId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isOffline = !isSupabaseConfigured()

  const hasUserMessages = messages.some((m) => m.role === 'user')

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback(async (text?: string) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const result = await sendMessage(trimmed, sessionId, letterRequestId)
      setSessionId(result.sessionId)
      setLetterRequestId(result.letterRequestId)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.reply,
          intent: result.intent,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan sistem. Silakan coba lagi.',
        },
      ])
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }, [input, isLoading, sessionId, letterRequestId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">RT</span>
          </div>
          <span className="text-lg font-bold text-gray-900">AsistenRT</span>
        </Link>
        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
          Kembali ke Beranda
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Area Chat */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Bot header */}
          <div className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-lg">🤖</span>
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">AsistenRT</p>
                <p className="text-xs text-gray-400">
                  {isOffline ? 'Mode offline — percakapan tidak tersimpan' : 'Online · Siap membantu'}
                </p>
              </div>
            </div>
          </div>

          {/* Offline banner */}
          {isOffline && (
            <div className="border-b border-amber-200 bg-amber-50 px-6 py-2">
              <p className="text-xs text-amber-700">
                ⚠️ Mode offline — percakapan tidak tersimpan ke database.
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isLoading && <TypingIndicator />}

              {/* Suggested questions — hanya tampil sebelum ada pesan dari user */}
              {!hasUserMessages && !isLoading && (
                <div className="pt-2">
                  <p className="mb-2 text-center text-xs text-gray-400">
                    Pertanyaan yang sering diajukan:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Ketik pesan Anda... (Enter untuk kirim)"
                  className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  aria-label="Kirim pesan"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">
                ⚖️ Respons AI bersifat informatif. Keputusan resmi tetap di pengurus RT.
              </p>
            </div>
          </div>
        </main>

        {/* Info sidebar */}
        <aside className="hidden w-64 shrink-0 border-l border-gray-200 bg-white p-5 lg:block">
          <p className="section-title mb-4">Informasi</p>

          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-1.5 text-xs font-semibold text-gray-700">Yang bisa saya bantu:</p>
              <ul className="space-y-1.5">
                {[
                  '❓ Tanya FAQ RT',
                  '📄 Minta draft surat',
                  '📢 Lapor keluhan',
                  '🔍 Cek status pengajuan',
                ].map((item) => (
                  <li key={item} className="text-xs text-gray-500">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-amber-50 p-3">
              <p className="mb-1 text-xs font-semibold text-amber-800">⚠️ Perlu diingat:</p>
              <p className="text-xs leading-relaxed text-amber-700">
                AI hanya membantu. Surat dan keputusan resmi tetap memerlukan persetujuan pengurus RT.
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-gray-600">Jenis surat tersedia:</p>
              <ul className="space-y-1">
                {['Keterangan Domisili', 'Pengantar SKCK', 'Keterangan Tidak Mampu', 'Pengantar Nikah'].map(
                  (item) => (
                    <li key={item} className="text-xs text-gray-400">
                      • {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {sessionId && !isOffline && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-xs font-semibold text-green-800">✅ Percakapan tersimpan</p>
                <p className="mt-0.5 text-[10px] text-green-600 font-mono break-all">
                  {sessionId.slice(0, 8)}...
                </p>
              </div>
            )}

            {letterRequestId && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-800">📄 Permintaan surat aktif</p>
                <p className="mt-0.5 text-[10px] text-blue-600">
                  Sedang mengumpulkan data surat. Balas dengan format key: value.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
