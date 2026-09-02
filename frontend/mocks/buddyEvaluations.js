/**
 * Mock Data: Evaluasi Rapor New Hire (3 Hari Pre-Batch) per Kru
 * Menyimpan penilaian 7 kompetensi & 22 indikator oleh Store Captain / Store Leader.
 * Skala Penilaian:
 * - 'BELUM_MENGUASAI' (Belum Menguasai)
 * - 'BUTUH_PENDAMPINGAN' (Butuh Pendampingan)
 * - 'KOMPETEN' (Kompeten)
 */

export const mockBuddyEvaluations = [
  {
    id: 'beval-c01',
    batchId: 'batch-alpha',
    crewId: 'crew-001',
    crewName: 'Andi Pratama',
    storeTraining: 'Re.juve Grand Indonesia, Jakarta Pusat',
    storeCaptain: 'Budi Santoso (Store Leader)',
    evaluatorId: 'sl-001',
    trainingPeriod: '1 - 3 September 2026',
    status: 'RECOMMENDED', // RECOMMENDED | IN_PROGRESS | NEED_RETRAINING
    recommendationNote: 'Andi menunjukkan antusiasme sangat tinggi. Pemahaman #CleanLabel dan operasional POS kasir sangat baik. Siap 100% masuk Batch 1.',
    captainSigned: true,
    crewSigned: true,
    updatedAt: '2026-09-03T17:00:00.000Z',
    indicatorRatings: {
      'ind-pk-01': 'KOMPETEN',
      'ind-pk-02': 'KOMPETEN',
      'ind-pk-03': 'KOMPETEN',
      'ind-cs-01': 'KOMPETEN',
      'ind-cs-02': 'KOMPETEN',
      'ind-cs-03': 'KOMPETEN',
      'ind-su-01': 'BUTUH_PENDAMPINGAN',
      'ind-su-02': 'BUTUH_PENDAMPINGAN',
      'ind-su-03': 'KOMPETEN',
      'ind-co-01': 'KOMPETEN',
      'ind-co-02': 'KOMPETEN',
      'ind-co-03': 'KOMPETEN',
      'ind-so-01': 'KOMPETEN',
      'ind-so-02': 'KOMPETEN',
      'ind-so-03': 'BUTUH_PENDAMPINGAN',
      'ind-so-04': 'KOMPETEN',
      'ind-fsq-01': 'KOMPETEN',
      'ind-fsq-02': 'KOMPETEN',
      'ind-fsq-03': 'KOMPETEN',
      'ind-ta-01': 'KOMPETEN',
      'ind-ta-02': 'KOMPETEN',
      'ind-ta-03': 'KOMPETEN'
    }
  },
  {
    id: 'beval-c02',
    batchId: 'batch-alpha',
    crewId: 'crew-002',
    crewName: 'Bella Safitri',
    storeTraining: 'Re.juve Grand Indonesia, Jakarta Pusat',
    storeCaptain: 'Budi Santoso (Store Leader)',
    evaluatorId: 'sl-001',
    trainingPeriod: '1 - 3 September 2026',
    status: 'RECOMMENDED',
    recommendationNote: 'Bella memiliki dasar hospitality yang luar biasa. Sangat direkomendasikan untuk kompetisi Batch 1.',
    captainSigned: true,
    crewSigned: true,
    updatedAt: '2026-09-03T16:30:00.000Z',
    indicatorRatings: {
      'ind-pk-01': 'KOMPETEN',
      'ind-pk-02': 'KOMPETEN',
      'ind-pk-03': 'KOMPETEN',
      'ind-cs-01': 'KOMPETEN',
      'ind-cs-02': 'KOMPETEN',
      'ind-cs-03': 'KOMPETEN',
      'ind-su-01': 'KOMPETEN',
      'ind-su-02': 'KOMPETEN',
      'ind-su-03': 'KOMPETEN',
      'ind-co-01': 'KOMPETEN',
      'ind-co-02': 'KOMPETEN',
      'ind-co-03': 'KOMPETEN',
      'ind-so-01': 'BUTUH_PENDAMPINGAN',
      'ind-so-02': 'KOMPETEN',
      'ind-so-03': 'BUTUH_PENDAMPINGAN',
      'ind-so-04': 'KOMPETEN',
      'ind-fsq-01': 'KOMPETEN',
      'ind-fsq-02': 'KOMPETEN',
      'ind-fsq-03': 'KOMPETEN',
      'ind-ta-01': 'KOMPETEN',
      'ind-ta-02': 'KOMPETEN',
      'ind-ta-03': 'KOMPETEN'
    }
  },
  {
    id: 'beval-c12',
    batchId: 'batch-gamma',
    crewId: 'crew-012',
    crewName: 'Lina Marlina',
    storeTraining: 'Re.juve Pondok Indah Mall, Jakarta Selatan',
    storeCaptain: 'Dewi Lestari (Store Leader)',
    evaluatorId: 'sl-002',
    trainingPeriod: '15 - 17 September 2026',
    status: 'RECOMMENDED',
    recommendationNote: 'Lina memiliki kepemimpinan dan inisiatif kerja yang kuat. Standar kebersihan dan sanitasi sangat terjaga.',
    captainSigned: true,
    crewSigned: true,
    updatedAt: '2026-09-17T17:00:00.000Z',
    indicatorRatings: {
      'ind-pk-01': 'KOMPETEN',
      'ind-pk-02': 'KOMPETEN',
      'ind-pk-03': 'KOMPETEN',
      'ind-cs-01': 'KOMPETEN',
      'ind-cs-02': 'KOMPETEN',
      'ind-cs-03': 'KOMPETEN',
      'ind-su-01': 'KOMPETEN',
      'ind-su-02': 'KOMPETEN',
      'ind-su-03': 'KOMPETEN',
      'ind-co-01': 'KOMPETEN',
      'ind-co-02': 'KOMPETEN',
      'ind-co-03': 'KOMPETEN',
      'ind-so-01': 'KOMPETEN',
      'ind-so-02': 'KOMPETEN',
      'ind-so-03': 'KOMPETEN',
      'ind-so-04': 'KOMPETEN',
      'ind-fsq-01': 'KOMPETEN',
      'ind-fsq-02': 'KOMPETEN',
      'ind-fsq-03': 'KOMPETEN',
      'ind-ta-01': 'KOMPETEN',
      'ind-ta-02': 'KOMPETEN',
      'ind-ta-03': 'KOMPETEN'
    }
  }
]
