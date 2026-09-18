/**
 * Utilitas In-flight Request Deduplication & Micro-Cache API Call
 * Mengurangi redundansi pemanggilan API berulang (over-fetching) dalam jeda waktu singkat (TTL 3-5 detik),
 * serta menggabungkan request paralel identik dalam satu promise (Single-Flight Deduplication).
 */

const cacheStore = new Map()
const inFlightRequests = new Map()

/**
 * Eksekusi API call dengan deduplikasi in-flight dan micro-caching
 * @param {string} key - Identifier unik untuk query/request
 * @param {Function} fetcher - Fungsi async yang memanggil API
 * @param {number} ttlMs - Waktu kedaluwarsa cache dalam milidetik (default: 4000 ms)
 * @param {boolean} forceRefresh - Jika true, abaikan cache dan paksa fetch dari server
 */
export async function cachedApiCall(key, fetcher, ttlMs = 4000, forceRefresh = false) {
  const now = Date.now()

  // 1. Jika tidak forceRefresh dan cache masih berlaku, kembalikan dari cacheStore
  if (!forceRefresh && ttlMs > 0 && cacheStore.has(key)) {
    const cached = cacheStore.get(key)
    if (cached && cached.expiry > now) {
      return cached.data
    }
    cacheStore.delete(key)
  }

  // 2. Jika request dengan key yang sama persis sedang in-flight, gabungkan ke promise yang sama
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }

  const promise = (async () => {
    try {
      const result = await fetcher()
      if (ttlMs > 0 && result !== undefined) {
        cacheStore.set(key, {
          data: result,
          expiry: Date.now() + ttlMs
        })
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
 * Hapus cache dan reset in-flight registry
 * @param {string} keyPrefix - Prefix key yang ingin di-reset (kosong = bersihkan semua)
 */
export function invalidateApiCache(keyPrefix = '') {
  if (!keyPrefix) {
    cacheStore.clear()
    inFlightRequests.clear()
    return
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(keyPrefix)) {
      cacheStore.delete(key)
    }
  }
  for (const key of inFlightRequests.keys()) {
    if (key.startsWith(keyPrefix)) {
      inFlightRequests.delete(key)
    }
  }
}
