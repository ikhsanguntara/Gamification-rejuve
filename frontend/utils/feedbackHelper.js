/**
 * Helper Utilitas Pemetaan Data Master Template FEEDBACK (Survei Onboarding 1 Bulan Re.juve)
 * Sesuai Dokumen Microsoft Forms Evaluasi Kru Baru 1 Bulan:
 * - 16 Pertanyaan Skala 0-10 (Sangat Tidak Setuju s/d Sangat Setuju)
 * - 1 Pertanyaan Esai Masukan Kualitatif
 */

export const DEFAULT_FEEDBACK_QUESTIONS = [
  {
    question: 'Training mudah dipahami, membantu saya mengenal produk serta budaya kerja Rejuve',
    topic: 'Training & Culture',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Setelah mengikuti training, saya merasa lebih siap untuk mulai bekerja di store.',
    topic: 'Kesiapan Kerja',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Buddy memperkenalkan saya kepada anggota tim di store.',
    topic: 'Peran Buddy',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Buddy memberikan arahan dan contoh kerja dengan jelas.',
    topic: 'Peran Buddy',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Buddy memberikan kesempatan kepada saya untuk bertanya.',
    topic: 'Peran Buddy',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Buddy bersedia membantu ketika saya mengalami kesulitan.',
    topic: 'Peran Buddy',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Buddy memberikan masukan (feedback) yang membantu saya berkembang.',
    topic: 'Peran Buddy',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Saya merasa nyaman berdiskusi dengan buddy selama proses onboarding.',
    topic: 'Peran Buddy',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Saya memperoleh pengalaman onboarding yang positif saat pertama kali bergabung di store.',
    topic: 'Lingkungan Store',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Saya mendapatkan penjelasan mengenai target kinerja, tata tertib, standar operasional (SOP), serta tugas dan tanggung jawab di store',
    topic: 'SOP & Kinerja',
    inputType: 'SCALE',
    category: 'TECHNICAL'
  },
  {
    question: 'Saya mengetahui kepada siapa saya dapat bertanya jika mengalami kesulitan.',
    topic: 'Dukungan Store',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Team Store membantu saya beradaptasi dengan lingkungan kerja dengan memberikan arahan yang jelas dan dukungan selama masa onboarding.',
    topic: 'Teamwork',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Rekan kerja di store bersedia membantu ketika saya membutuhkan bantuan.',
    topic: 'Teamwork',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Saya merasa diterima sebagai bagian dari tim, mendapat kesempatan untuk belajar langsung, dan memahami arahan selama OJT.',
    topic: 'Adaptasi OJT',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Saya memahami ekspektasi, target, serta dapat beradaptasi dengan lingkungan dan budaya kerja perusahaan.',
    topic: 'Budaya Perusahaan',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Saya merasa nyaman bekerja di store saya.',
    topic: 'Kepuasan Kerja',
    inputType: 'SCALE',
    category: 'SOFT_SKILL'
  },
  {
    question: 'Apa bagian onboarding yang paling membantu Anda, apa yang perlu diperbaiki agar karyawan baru lebih cepat beradaptasi, dan apa yang akan Anda lakukan berbeda jika menjadi buddy lagi?',
    topic: 'Feedback Kualitatif',
    inputType: 'TEXT',
    category: 'SOFT_SKILL'
  }
]

export const FEEDBACK_TOPIC_OPTIONS = [
  'Training & Culture',
  'Kesiapan Kerja',
  'Peran Buddy',
  'Lingkungan Store',
  'SOP & Kinerja',
  'Dukungan Store',
  'Teamwork',
  'Adaptasi OJT',
  'Budaya Perusahaan',
  'Kepuasan Kerja',
  'Feedback Kualitatif',
  'Umum'
]

/**
 * Normalisasi list details dari database/store menjadi list pertanyaan yang siap dirender di form list
 */
export function normalizeFeedbackDetails(details = []) {
  if (!Array.isArray(details) || details.length === 0) {
    return []
  }

  return details.map((d, idx) => {
    const sc = d.scaleConfig || {}
    const titleStr = d.missionTitle || d.title || ''
    const inputType = d.inputType || 'SCALE'
    const topic = sc.categoryName || sc.topic || d.description || 'Umum'

    return {
      id: d.tplMissionDetailId || d.id || `fb-item-${idx}`,
      tempId: d.tplMissionDetailId || d.id || `fb-item-${idx}`,
      question: titleStr,
      inputType: inputType === 'TEXT' ? 'TEXT' : 'SCALE',
      topic: topic,
      category: d.category || 'SOFT_SKILL',
      scaleConfig: sc
    }
  })
}

/**
 * Kompilasi list pertanyaan kuesioner menjadi flat details array untuk dikirim ke POST/PUT /api/templates
 */
export function compileFeedbackDetailsForApi(questions = []) {
  const details = []

  questions.forEach((q, idx) => {
    const title = q.question ? q.question.trim() : ''
    if (!title) return

    const inputType = q.inputType === 'TEXT' ? 'TEXT' : 'SCALE'
    const topic = q.topic?.trim() || 'Umum'
    const categoryEnum = q.category === 'TECHNICAL' ? 'TECHNICAL' : 'SOFT_SKILL'

    const scaleConfig = inputType === 'TEXT'
      ? {
          placeholder: 'Tuliskan masukan atau saran Anda...',
          questionNumber: idx + 1,
          categoryName: topic
        }
      : {
          min: 0,
          max: 10,
          step: 1,
          minLabel: 'Sangat Tidak Setuju',
          maxLabel: 'Sangat Setuju',
          questionNumber: idx + 1,
          categoryName: topic
        }

    details.push({
      missionTitle: title,
      category: categoryEnum,
      durationNumber: 1, // Sesuai kesepakatan: bukan tab, list murni durasi 1
      inputType,
      description: topic,
      scaleConfig
    })
  })

  return details
}
