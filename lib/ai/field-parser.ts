/**
 * Mem-parse pesan chat warga dalam format "key: value" per baris.
 * Mengabaikan baris yang tidak cocok pola.
 *
 * Contoh input:
 *   nama_lengkap: Budi Santoso
 *   nik: 3578123456780001
 *   alamat: Blok C No. 12
 *
 * Contoh output:
 *   { nama_lengkap: "Budi Santoso", nik: "3578123456780001", alamat: "Blok C No. 12" }
 */
export function parseFieldValues(message: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = message.split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const rawKey = line.slice(0, colonIndex).trim().toLowerCase()
    const value = line.slice(colonIndex + 1).trim()

    if (!rawKey || !value) continue

    // Normalisasi key: spasi → underscore
    const key = rawKey.replace(/\s+/g, '_')
    result[key] = value
  }

  return result
}
