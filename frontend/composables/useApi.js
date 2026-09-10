import { useLoading } from './useLoading.js'

/**
 * Composable useApi: REST API Client Universal untuk Rejuve Gamification
 * Bekerja sempurna di Nuxt 3 (Browser/SSR) maupun Node.js standalone test scripts.
 */

let memoryToken = ''

export function getApiBaseUrl() {
  let url = 'https://cagelike-flukily-niels.ngrok-free.dev/api'
  if (typeof window !== 'undefined') {
    try {
      const config = useRuntimeConfig?.()
      if (config?.public?.apiBase) url = config.public.apiBase
    } catch {
      // Fallback outside Nuxt reactive context
    }
    const saved = localStorage.getItem('rejuve_api_base')
    if (saved) url = saved
  } else {
    url = process.env.NUXT_PUBLIC_API_BASE || url
  }

  let clean = url.replace(/\/$/, '')
  if (!clean.endsWith('/api')) clean += '/api'
  return clean
}

export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rejuve_token') || localStorage.getItem('token') || memoryToken
  }
  return memoryToken || process.env.REJUVE_API_TOKEN || ''
}

export function setAuthToken(token) {
  memoryToken = token || ''
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('rejuve_token', token)
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('rejuve_token')
      localStorage.removeItem('token')
    }
  }
}

/**
 * Universal fetch wrapper untuk REST API
 */
export async function apiFetch(path, options = {}) {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '')
  let cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // Format query params jika ada
  if (options.params && typeof options.params === 'object') {
    const query = new URLSearchParams()
    for (const [key, val] of Object.entries(options.params)) {
      if (val !== undefined && val !== null) query.append(key, val)
    }
    const qStr = query.toString()
    if (qStr) {
      cleanPath += (cleanPath.includes('?') ? '&' : '?') + qStr
    }
  }

  const url = cleanPath.startsWith('http') ? cleanPath : `${baseUrl}${cleanPath}`
  const token = options.token || getAuthToken()
  const method = (options.method || 'GET').toUpperCase()
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  const shouldShowLoading = options.showLoading !== false && (options.showLoading === true || isMutation) && typeof window !== 'undefined'

  let loadingHelper = null
  if (shouldShowLoading) {
    try {
      loadingHelper = useLoading()
      let msg = options.loadingMessage || 'Memproses permintaan...'
      let sub = options.loadingSubmessage || 'Harap tunggu, sistem sedang memproses data.'

      if (!options.loadingMessage) {
        if (method === 'POST') {
          msg = 'Menyimpan data...'
          sub = 'Harap tunggu, data sedang dikirim dan diproses server.'
        } else if (method === 'PUT' || method === 'PATCH') {
          msg = 'Memperbarui data...'
          sub = 'Harap tunggu, perubahan sedang disimpan ke server.'
        } else if (method === 'DELETE') {
          msg = 'Menghapus data...'
          sub = 'Harap tunggu, penghapusan data sedang diproses.'
        }
      }

      loadingHelper.startLoading(msg, sub)
    } catch {
      loadingHelper = null
    }
  }

  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...(options.responseType === 'blob' ? {} : { 'Accept': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  // Handle request body
  let requestBody = options.body
  if (requestBody && !(requestBody instanceof FormData) && typeof requestBody === 'object') {
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
    requestBody = JSON.stringify(requestBody)
  }

  try {
    // Gunakan $fetch jika tersedia (Nuxt), atau fallback ke global fetch
    if (typeof $fetch !== 'undefined') {
      try {
        const fetchOptions = {
          method,
          body: options.body,
          headers
        }
        if (options.responseType) {
          fetchOptions.responseType = options.responseType
        }
        const res = await $fetch(url, fetchOptions)
        return res
      } catch (err) {
        const errData = err.data || {}
        const errorMessage = errData.message || err.message || 'Terjadi kesalahan saat menghubungi server API.'
        const statusCode = err.status || err.statusCode || errData.statusCode || 500
        
        const customError = new Error(errorMessage)
        customError.statusCode = statusCode
        customError.data = errData
        throw customError
      }
    } else {
      // Native fetch untuk Node.js environment
      const response = await fetch(url, {
        method,
        headers,
        body: requestBody
      })

      if (options.responseType === 'blob') {
        if (!response.ok) {
          const err = new Error(`HTTP error ${response.status}`)
          err.statusCode = response.status
          throw err
        }
        return await response.blob()
      }

      const contentType = response.headers.get('content-type') || ''
      let data = null
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        const msg = (data && data.message) ? data.message : `HTTP error ${response.status}`
        const err = new Error(msg)
        err.statusCode = response.status
        err.data = data
        throw err
      }

      return data
    }
  } finally {
    if (loadingHelper) {
      loadingHelper.stopLoading()
    }
  }
}

export const useApi = () => {
  return {
    getApiBaseUrl,
    getAuthToken,
    setAuthToken,
    apiFetch
  }
}
