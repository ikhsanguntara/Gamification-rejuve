/**
 * Utilitas In-memory Cache & In-flight Request Deduplication
 * Mencegah duplikasi hit API saat perpindahan menu yang cepat (Fast Navigation)
 * serta menghemat bandwidth dan mengurangi latensi jaringan.
 */

const cacheStore = new Map()
const inFlightRequests = new Map()

/**
 * Eksekusi API call dengan cache TTL dan deduplikasi in-flight promise
 * @param {string} key - Identifier unik untuk query/request
 * @param {Function} fetcher - Fungsi async yang memanggil API
 * @param {number} ttlMs - Waktu kadaluarsa cache dalam milidetik (default: 30 detik)
 * @param {boolean} forceRefresh - Paksa fetch ulang abaikan cache
 */
export async function cachedApiCall(key, fetcher, ttlMs = 30000, forceRefresh = false) {
  const now = Date.now()

  // 1. Cek cache yang masih valid
  if (!forceRefresh && cacheStore.has(key)) {
    const cached = cacheStore.get(key)
    if (now - cached.timestamp < ttlMs) {
      return cached.data
    }
  }

  // 2. Jika request dengan key yang sama sedang berjalan (in-flight), tumpangi promise tersebut
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }

  // 3. Eksekusi request baru dan simpan promise ke registry in-flight
  const promise = (async () => {
    try {
      const result = await fetcher()
      if (result !== undefined && result !== null) {
        cacheStore.set(key, { data: result, timestamp: Date.now() })
      }
      return result
    } finally {
      inFlightRequests.delete(key)
    }
  })()

  inFlightRequests.set(key, promise)
  return promise
}

/**
 * Hapus cache berdasarkan prefix key atau hapus seluruh cache jika keyPrefix kosong
 * @param {string} keyPrefix - Prefix key cache yang ingin di-invalidate (misal: 'batches', 'users')
 */
export function invalidateApiCache(keyPrefix = '') {
  if (!keyPrefix) {
    cacheStore.clear()
    return
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(keyPrefix)) {
      cacheStore.delete(key)
    }
  }
}
