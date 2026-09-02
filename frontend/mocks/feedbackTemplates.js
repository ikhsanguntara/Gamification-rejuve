/**
 * Mock Data: Master Template Feedback Onboarding & Rapor New Hire Re.juve
 * Sesuai Dokumen Microsoft Forms (Survei 1 Bulan) dan Dokumen Rapor New Hire (7 Kompetensi).
 */

// 1. TEMPLATE SURVEI FEEDBACK ONBOARDING & BUDDY (Kru -> Buddy / Store)
export const mockFeedbackSurveyTemplate = {
  id: 'survey-onboarding-1month',
  title: 'Feedback Pengalaman Onboarding Rejuve – Collaboration – Masa Onboarding 1 bulan',
  subtitle: 'Survei kepuasan & evaluasi 360° pengalaman kru baru selama masa orientasi dan pendampingan Buddy',
  greeting: 'Halo Rejuve People! Terima kasih telah mengisi survei ini. Survei ini bertujuan untuk mengetahui pengalaman onboarding Anda di store serta memastikan pemahaman Anda terhadap peran sebagai tim store.',
  questions: [
    {
      id: 'q-01',
      number: 4,
      text: 'Training mudah dipahami, membantu saya mengenal produk serta budaya kerja Rejuve',
      category: 'Training & Culture',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-02',
      number: 5,
      text: 'Setelah mengikuti training, saya merasa lebih siap untuk mulai bekerja di store.',
      category: 'Kesiapan Kerja',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-03',
      number: 6,
      text: 'Buddy memperkenalkan saya kepada anggota tim di store.',
      category: 'Peran Buddy',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-04',
      number: 7,
      text: 'Buddy memberikan arahan dan contoh kerja dengan jelas.',
      category: 'Peran Buddy',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-05',
      number: 8,
      text: 'Buddy memberikan kesempatan kepada saya untuk bertanya.',
      category: 'Peran Buddy',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-06',
      number: 9,
      text: 'Buddy bersedia membantu ketika saya mengalami kesulitan.',
      category: 'Peran Buddy',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-07',
      number: 10,
      text: 'Buddy memberikan masukan (feedback) yang membantu saya berkembang.',
      category: 'Peran Buddy',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-08',
      number: 11,
      text: 'Saya merasa nyaman berdiskusi dengan buddy selama proses onboarding.',
      category: 'Peran Buddy',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-09',
      number: 12,
      text: 'Saya memperoleh pengalaman onboarding yang positif saat pertama kali bergabung di store.',
      category: 'Lingkungan Store',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-10',
      number: 13,
      text: 'Saya mendapatkan penjelasan mengenai target kinerja, tata tertib, standar operasional (SOP), serta tugas dan tanggung jawab di store',
      category: 'SOP & Kinerja',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-11',
      number: 14,
      text: 'Saya mengetahui kepada siapa saya dapat bertanya jika mengalami kesulitan.',
      category: 'Dukungan Store',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-12',
      number: 15,
      text: 'Team Store membantu saya beradaptasi dengan lingkungan kerja dengan memberikan arahan yang jelas dan dukungan selama masa onboarding.',
      category: 'Teamwork',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-13',
      number: 16,
      text: 'Rekan kerja di store bersedia membantu ketika saya membutuhkan bantuan.',
      category: 'Teamwork',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-14',
      number: 17,
      text: 'Saya merasa diterima sebagai bagian dari tim, mendapat kesempatan untuk belajar langsung, dan memahami arahan selama OJT.',
      category: 'Adaptasi OJT',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-15',
      number: 18,
      text: 'Saya memahami ekspektasi, target, serta dapat beradaptasi dengan lingkungan dan budaya kerja perusahaan.',
      category: 'Budaya Perusahaan',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-16',
      number: 19,
      text: 'Saya merasa nyaman bekerja di store saya.',
      category: 'Kepuasan Kerja',
      type: 'SCALE_0_10'
    },
    {
      id: 'q-17',
      number: 20,
      text: 'Apa bagian onboarding yang paling membantu Anda, apa yang perlu diperbaiki agar karyawan baru lebih cepat beradaptasi, dan apa yang akan Anda lakukan berbeda jika menjadi buddy lagi?',
      category: 'Feedback Kualitatif',
      type: 'ESSAY'
    }
  ]
}

// 2. TEMPLATE RAPOR NEW HIRE (Store Leader -> Kru Baru)
export const mockNewHireReportTemplate = {
  id: 'rapor-new-hire-standard',
  title: 'RAPOR NEW HIRE RE.JUVE',
  subtitle: 'Evaluasi 7 Kompetensi Inti Standar Operasional Gerai oleh Store Leader / Store Captain',
  specialNotice: '- Poin bertanda bintang (*) tetap wajib diberikan pembekalan. Namun, mengingat periode pendampingan hanya 3 hari, kru dapat dimaklumi apabila belum mendapatkan kesempatan praktik secara langsung.',
  competencies: [
    {
      id: 'comp-01',
      name: 'Product Knowledge',
      indicators: [
        { id: 'ind-01-01', text: 'Menjelaskan produk & ingredients*', isMandatoryIntro: true },
        { id: 'ind-01-02', text: 'Menjelaskan manfaat produk', isMandatoryIntro: false },
        { id: 'ind-01-03', text: 'Memberikan rekomendasi sesuai kebutuhan customer', isMandatoryIntro: false }
      ]
    },
    {
      id: 'comp-02',
      name: 'Customer Service',
      indicators: [
        { id: 'ind-02-01', text: 'Menyapa customer sesuai standard (Greeting 3S)', isMandatoryIntro: false },
        { id: 'ind-02-02', text: 'Menggali kebutuhan customer', isMandatoryIntro: false },
        { id: 'ind-02-03', text: 'Memberikan pelayanan sesuai Service Standard Re.juve', isMandatoryIntro: false }
      ]
    },
    {
      id: 'comp-03',
      name: 'Sales & Upselling',
      indicators: [
        { id: 'ind-03-01', text: 'Melakukan upselling paket juice/qty juice', isMandatoryIntro: false },
        { id: 'ind-03-02', text: 'Melakukan cross-selling produk food', isMandatoryIntro: false },
        { id: 'ind-03-03', text: 'Menawarkan membership secara konsisten', isMandatoryIntro: false }
      ]
    },
    {
      id: 'comp-04',
      name: 'Cashier Operation',
      indicators: [
        { id: 'ind-04-01', text: 'Melakukan transaksi di EDC dengan benar', isMandatoryIntro: false },
        { id: 'ind-04-02', text: 'Melakukan repeat order & payment dengan benar', isMandatoryIntro: false },
        { id: 'ind-04-03', text: 'Melakukan proses pembayaran di cashier tanpa kesalahan', isMandatoryIntro: false }
      ]
    },
    {
      id: 'comp-05',
      name: 'Store Operation',
      indicators: [
        { id: 'ind-05-01', text: 'Memahami proses opening & closing sesuai SOP*', isMandatoryIntro: true },
        { id: 'ind-05-02', text: 'Melakukan cleaning & refill produk sesuai standard', isMandatoryIntro: false },
        { id: 'ind-05-03', text: 'Melakukan penerimaan kedatangan barang dengan baik*', isMandatoryIntro: true },
        { id: 'ind-05-04', text: 'Menjaga area kerja sesuai standard', isMandatoryIntro: false }
      ]
    },
    {
      id: 'comp-06',
      name: 'Food Safety & Quality',
      indicators: [
        { id: 'ind-06-01', text: 'Menjalankan standard hygiene', isMandatoryIntro: false },
        { id: 'ind-06-02', text: 'Melakukan handling produk dengan benar', isMandatoryIntro: false },
        { id: 'ind-06-03', text: 'Menjalankan FIFO/FEFO (Cold-Chain 2–4°C)', isMandatoryIntro: false }
      ]
    },
    {
      id: 'comp-07',
      name: 'Teamwork & Attitude',
      indicators: [
        { id: 'ind-07-01', text: 'Menunjukkan sikap positif & disiplin', isMandatoryIntro: false },
        { id: 'ind-07-02', text: 'Berkomunikasi dengan baik', isMandatoryIntro: false },
        { id: 'ind-07-03', text: 'Mengikuti arahan atasan', isMandatoryIntro: false }
      ]
    }
  ]
}

// 3. MOCK DATA INITIAL SUBMISSIONS
export const mockSubmittedFeedbacks = [
  {
    id: 'fb-sub-001',
    crewId: 'crew-001',
    crewName: 'Andi Pratama',
    storeLocation: 'Grand Indonesia',
    buddyName: 'Budi Santoso (Store Leader)',
    submittedAt: '2026-08-30T10:30:00Z',
    ratings: {
      'q-01': 10, 'q-02': 9, 'q-03': 10, 'q-04': 10, 'q-05': 9,
      'q-06': 10, 'q-07': 9, 'q-08': 10, 'q-09': 10, 'q-10': 9,
      'q-11': 10, 'q-12': 10, 'q-13': 9, 'q-14': 10, 'q-15': 9, 'q-16': 10
    },
    avgScore: 9.6,
    essayAnswer: 'Program pendampingan oleh Kak Budi sangat sabar dan jelas dalam mengajarkan cara menjaga suhu cold chain 2-4°C serta ramah saat simulasi kasir POS.'
  }
]

export const mockNewHireReports = [
  {
    id: 'rpt-nh-001',
    crewId: 'crew-001',
    crewName: 'Andi Pratama',
    storeLocation: 'Grand Indonesia',
    storeCaptain: 'Budi Santoso',
    evaluationDate: '2026-08-10',
    indicatorsRating: {
      'ind-01-01': 'KOMPETEN',
      'ind-01-02': 'KOMPETEN',
      'ind-01-03': 'KOMPETEN',
      'ind-02-01': 'KOMPETEN',
      'ind-02-02': 'KOMPETEN',
      'ind-02-03': 'KOMPETEN',
      'ind-03-01': 'BUTUH_PENDAMPINGAN',
      'ind-03-02': 'KOMPETEN',
      'ind-03-03': 'KOMPETEN',
      'ind-04-01': 'KOMPETEN',
      'ind-04-02': 'KOMPETEN',
      'ind-04-03': 'KOMPETEN',
      'ind-05-01': 'KOMPETEN',
      'ind-05-02': 'KOMPETEN',
      'ind-05-03': 'KOMPETEN',
      'ind-05-04': 'KOMPETEN',
      'ind-06-01': 'KOMPETEN',
      'ind-06-02': 'KOMPETEN',
      'ind-06-03': 'KOMPETEN',
      'ind-07-01': 'KOMPETEN',
      'ind-07-02': 'KOMPETEN',
      'ind-07-03': 'KOMPETEN'
    },
    notes: 'Andi menguasai hampir seluruh SOP dasar bar dan kasir dengan sangat baik. Hanya butuh latihan tambahan untuk upselling paket bulk juice.',
    status: 'LULUS_KOMPETEN'
  }
]
