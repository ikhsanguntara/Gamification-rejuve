/**
 * Utilitas Kompresi Gambar Client-Side (Frontend)
 * Mengurangi ukuran file foto jepretan kamera sebelum dikirim ke API/Store.
 */

/**
 * Mengompresi file gambar (File / Blob) menjadi data base64 atau Blob terkompresi.
 * @param {File|Blob} file - Objek file gambar asli
 * @param {Object} options - Opsi kompresi (maxWidth, maxHeight, quality)
 * @returns {Promise<{ dataUrl: string, blob: Blob, originalSize: number, compressedSize: number }>}
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.8,
    outputType = 'image/jpeg'
  } = options

  if (!file || (file.type && !file.type.startsWith('image/'))) {
    throw new Error('Berkas harus berupa gambar (image/jpeg, image/png, image/webp)')
  }

  // Jika di lingkungan node / non-browser (misal saat test)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      dataUrl: typeof file === 'string' ? file : 'data:image/jpeg;base64,mock',
      blob: file,
      originalSize: file.size || 1024,
      compressedSize: file.size || 1024
    }
  }

  return new Promise((resolve, reject) => {
    const originalSize = file.size
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img

        // Hitung aspek rasio baru jika melebihi batas dimensi
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        // Gambar ke canvas untuk kompresi
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL(outputType, quality)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                dataUrl,
                blob: file,
                originalSize,
                compressedSize: originalSize
              })
              return
            }

            resolve({
              dataUrl,
              blob,
              originalSize,
              compressedSize: blob.size
            })
          },
          outputType,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Gagal memuat format berkas gambar'))
      }

      img.src = event.target.result
    }

    reader.onerror = () => {
      reject(new Error('Gagal membaca file gambar'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Validasi apakah file berupa gambar dan ukurannya memenuhi batas
 * @param {File} file
 * @param {number} maxBytes - Ukuran maks dalam bytes (default: 10MB)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file, maxBytes = 10 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan' }
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (file.type && !validTypes.includes(file.type)) {
    return { valid: false, error: 'Format berkas harus berupa JPG, PNG, atau WebP' }
  }

  if (file.size && file.size > maxBytes) {
    return { valid: false, error: `Ukuran berkas melebihi batas maksimal (${(maxBytes / (1024 * 1024)).toFixed(0)}MB)` }
  }

  return { valid: true }
}
