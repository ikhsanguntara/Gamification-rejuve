/**
 * Helper Utilitas Pemetaan Data Master Template BUDDY (Rapor New Hire Re.juve)
 * Kategori Khusus Buddy:
 * 1. Product Knowledge
 * 2. Customer Service
 * 3. Sales & Upselling
 * 4. Cashier Operation
 * 5. Store Operation
 * 6. Food Safety & Quality
 * 7. Teamwork & Attitude
 */

export const BUDDY_CATEGORIES = [
  { value: 'Product Knowledge', label: 'Product Knowledge', enumVal: 'TECHNICAL' },
  { value: 'Customer Service', label: 'Customer Service', enumVal: 'SOFT_SKILL' },
  { value: 'Sales & Upselling', label: 'Sales & Upselling', enumVal: 'SOFT_SKILL' },
  { value: 'Cashier Operation', label: 'Cashier Operation', enumVal: 'TECHNICAL' },
  { value: 'Store Operation', label: 'Store Operation', enumVal: 'TECHNICAL' },
  { value: 'Food Safety & Quality', label: 'Food Safety & Quality', enumVal: 'TECHNICAL' },
  { value: 'Teamwork & Attitude', label: 'Teamwork & Attitude', enumVal: 'SOFT_SKILL' }
]

export const DEFAULT_BUDDY_INDICATORS = [
  // 1. Product Knowledge
  { name: 'Menjelaskan produk & ingredients*', category: 'Product Knowledge', isStar: true, description: 'Mampu menjelaskan bahan alami 100% #CleanLabel tanpa tambahan air, gula, atau pengawet.' },
  { name: 'Menjelaskan manfaat produk', category: 'Product Knowledge', isStar: false, description: 'Mampu menjelaskan khasiat fungsional cold-pressed juice, shot, dan nut milk ke konsumen.' },
  { name: 'Memberikan rekomendasi sesuai kebutuhan customer', category: 'Product Knowledge', isStar: false, description: 'Mampu menganalisis preferensi rasa/kesehatan konsumen dan memberi saran varian yang tepat.' },

  // 2. Customer Service
  { name: 'Menyapa customer sesuai standard', category: 'Customer Service', isStar: false, description: 'Greeting hangat dalam 3 detik dengan senyum, kontak mata, dan intonasi ramah.' },
  { name: 'Menggali kebutuhan customer', category: 'Customer Service', isStar: false, description: 'Mengajukan pertanyaan terbuka untuk memahami kebutuhan spesifik konsumen.' },
  { name: 'Memberikan pelayanan sesuai Service Standard Re.juve', category: 'Customer Service', isStar: false, description: 'Mematuhi seluruh alur pelayanan counter mulai dari kedatangan hingga ucapan terima kasih.' },

  // 3. Sales & Upselling
  { name: 'Melakukan upselling paket juice/qty juice', category: 'Sales & Upselling', isStar: false, description: 'Menawarkan upgrade ukuran botol atau paket bundling promo harian.' },
  { name: 'Melakukan cross-selling produk food', category: 'Sales & Upselling', isStar: false, description: 'Menawarkan pendamping camilan sehat, sandwich, atau plant-based snack.' },
  { name: 'Menawarkan membership secara konsisten', category: 'Sales & Upselling', isStar: false, description: 'Mengajak setiap konsumen mendaftarkan nomor telepon untuk poin loyalty Re.juve Club.' },

  // 4. Cashier Operation
  { name: 'Melakukan transaksi di EDC dengan benar', category: 'Cashier Operation', isStar: false, description: 'Mengoperasikan mesin EDC kartu debit/kredit tanpa kendala koneksi atau salah nominal.' },
  { name: 'Melakukan repeat order & payment dengan benar', category: 'Cashier Operation', isStar: false, description: 'Mengulang pesanan dan nominal pembayaran dengan jelas sebelum memproses kasir.' },
  { name: 'Melakukan proses pembayaran di cashier tanpa kesalahan', category: 'Cashier Operation', isStar: false, description: 'Akurasi cetak struk, settlement QRIS, dan kerapian penyerahan struk & produk.' },

  // 5. Store Operation
  { name: 'Memahami proses opening & closing sesuai SOP*', category: 'Store Operation', isStar: true, description: 'Mengetahui checklist persiapan gerai pagi dan prosedur serah terima shift malam.' },
  { name: 'Melakukan cleaning & refill produk sesuai standard', category: 'Store Operation', isStar: false, description: 'Mengisi ulang display chiller dan membersihkan area bar secara berkala.' },
  { name: 'Melakukan penerimaan kedatangan barang dengan baik*', category: 'Store Operation', isStar: true, description: 'Memeriksa surat jalan, fisik segel botol, dan suhu logistik saat barang tiba dari central kitchen.' },
  { name: 'Menjaga area kerja sesuai standard', category: 'Store Operation', isStar: false, description: 'Memastikan clean area dan wash area tertata rapi, kering, dan bebas kontaminasi.' },

  // 6. Food Safety & Quality
  { name: 'Menjalankan standard hygiene', category: 'Food Safety & Quality', isStar: false, description: 'Kepatuhan cuci tangan 6 langkah, pemakaian sarung tangan food-grade, hairnet, dan masker.' },
  { name: 'Melakukan handling produk dengan benar', category: 'Food Safety & Quality', isStar: false, description: 'Memperlakukan botol jus dingin dengan hati-hati, tidak membiarkan botol di suhu ruang > 15 menit.' },
  { name: 'Menjalankan FIFO/FEFO', category: 'Food Safety & Quality', isStar: false, description: 'Memeriksa tanggal kedaluwarsa botol dan meletakkan tanggal terdekat di barisan terdepan.' },

  // 7. Teamwork & Attitude
  { name: 'Menunjukkan sikap positif & disiplin', category: 'Teamwork & Attitude', isStar: false, description: 'Hadir tepat waktu, berpakaian rapi sesuai standar grooming, dan bersemangat belajar.' },
  { name: 'Berkomunikasi dengan baik', category: 'Teamwork & Attitude', isStar: false, description: 'Menyampaikan informasi dengan jelas dan sopan kepada sesama rekan kerja dan Store Leader.' },
  { name: 'Mengikuti arahan atasan', category: 'Teamwork & Attitude', isStar: false, description: 'Menerima masukan dan menjalankan instruksi kerja dari Store Captain / Store Leader secara sigap.' }
]

/**
 * Petakan nama kategori Buddy ke enum resmi Prisma Backend (TECHNICAL / SOFT_SKILL)
 */
export function mapBuddyCategoryToEnum(catName) {
  const found = BUDDY_CATEGORIES.find(c => c.value.toLowerCase() === String(catName).toLowerCase())
  if (found) return found.enumVal
  const upper = String(catName).toUpperCase()
  if (upper.includes('SOFT') || upper.includes('SERVICE') || upper.includes('SALES') || upper.includes('ATTITUDE') || upper.includes('TEAM')) {
    return 'SOFT_SKILL'
  }
  return 'TECHNICAL'
}

/**
 * Normalisasi list details dari database/store menjadi list indikator yang siap dirender
 */
export function normalizeBuddyDetails(details = []) {
  if (!Array.isArray(details) || details.length === 0) {
    return []
  }

  return details.map((d, idx) => {
    const sc = d.scaleConfig || {}
    const titleStr = d.missionTitle || d.title || ''
    const isStar = sc.isStar !== undefined ? Boolean(sc.isStar) : titleStr.includes('*')

    let catName = sc.categoryName || sc.competency
    if (!catName) {
      const match = DEFAULT_BUDDY_INDICATORS.find(def =>
        titleStr.toLowerCase().includes(def.name.replace('*', '').trim().toLowerCase())
      )
      if (match) {
        catName = match.category
      } else {
        catName = d.category === 'SOFT_SKILL' ? 'Customer Service' : 'Product Knowledge'
      }
    }

    return {
      id: d.tplMissionDetailId || d.id || `ind-${idx}`,
      tempId: d.tplMissionDetailId || d.id || `ind-${idx}`,
      name: titleStr,
      category: catName,
      isStar,
      description: d.description || '',
      durationNumber: 1,
      inputType: d.inputType || 'RADIO',
      options: sc.options || ['Belum Menguasai', 'Butuh Pendampingan', 'Kompeten']
    }
  })
}

/**
 * Kompilasi list indikator menjadi flat details array untuk dikirim ke POST/PUT /api/templates
 */
export function compileBuddyDetailsForApi(indicators = []) {
  const details = []

  indicators.forEach(ind => {
    const title = ind.name ? ind.name.trim() : ''
    if (!title) return

    const isStar = Boolean(ind.isStar || title.includes('*'))
    const cleanTitle = isStar && !title.includes('*') ? `${title}*` : title
    const categoryName = ind.category || 'Product Knowledge'
    const backendEnum = mapBuddyCategoryToEnum(categoryName)

    details.push({
      missionTitle: cleanTitle,
      category: backendEnum, // Sesuai valid enum Prisma (TECHNICAL / SOFT_SKILL)
      durationNumber: 1,      // Sesuai aturan bisnis: Buddy durationNumber cuma 1
      inputType: 'RADIO',
      description: ind.description?.trim() || null,
      scaleConfig: {
        categoryName,
        competency: categoryName,
        isStar,
        options: ['Belum Menguasai', 'Butuh Pendampingan', 'Kompeten']
      }
    })
  })

  return details
}
