/**
 * Utilitas In-flight Request Deduplication & Direct Realtime API Call
 * Menghilangkan latency cache kadaluarsa agar data selalu 100% konsisten secara realtime dengan backend API,
 * namun tetap mencegah duplicate request yang berjalan bersamaan di millisecond yang sama.
 */

const cacheStore = new Map()
const inFlightRequests = new Map()

/**
 * Eksekusi API call secara realtime langsung ke Backend API (No stale cache)
 * @param {string} key - Identifier unik untuk query/request
 * @param {Function} fetcher - Fungsi async yang memanggil API
 * @param {number} _ttlMs - Diabaikan (data selalu realtime dari backend)
 * @param {boolean} _forceRefresh - Diabaikan (selalu fetch langsung)
 */
export async function cachedApiCall(key, fetcher, _ttlMs = 0, _forceRefresh = true) {
  // Jika request dengan key yang sama persis sedang in-flight pada millisecond yang sama, gunakan promise bersama
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }

  const promise = (async () => {
    try {
      const result = await fetcher()
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
 * @param {string} keyPrefix - Prefix key yang ingin di-reset
 */
export function invalidateApiCache(keyPrefix = '') {
  cacheStore.clear()
  if (!keyPrefix) {
    inFlightRequests.clear()
    return
  }
  for (const key of inFlightRequests.keys()) {
    if (key.startsWith(keyPrefix)) {
      inFlightRequests.delete(key)
    }
  }
}
