/**
 * Mock Data: Evaluasi Misi Buddy Pre-Batch per Kru
 * Menyimpan catatan observasi pendampingan 3 hari oleh Store Leader (SL).
 */

export const mockBuddyEvaluations = [
  // Evaluasi Kru Batch 1 (Grand Indonesia - Store Leader: Budi Santoso)
  {
    id: 'beval-c01',
    batchId: 'batch-alpha',
    crewId: 'crew-001',
    evaluatorId: 'sl-001',
    evaluatorName: 'Budi Santoso (Store Leader)',
    storeId: 'store-001',
    storeName: 'Re.juve Grand Indonesia',
    status: 'RECOMMENDED', // RECOMMENDED | IN_PROGRESS | NEEDS_ATTENTION
    recommendationNote: 'Andi menunjukkan antusiasme tinggi, pemahaman #CleanLabel sangat baik, siap 100% masuk Batch 1.',
    dayEvaluations: {
      1: {
        score: 95,
        status: 'COMPLETED',
        note: 'Sangat rapi, seragam dan APD lengkap. Memahami filosofi #CleanLabel dengan fasih.',
        checklistResults: { 'bm-d1-01': true, 'bm-d1-02': true, 'bm-d1-03': true },
        evidences: [{ url: '/images/evidence-1.jpg', caption: 'Pemeriksaan Seragam & APD' }]
      },
      2: {
        score: 92,
        status: 'COMPLETED',
        note: 'SOP cuci tangan dan pembersihan mesin press dilakukan secara higienis.',
        checklistResults: { 'bm-d2-01': true, 'bm-d2-02': true, 'bm-d2-03': true },
        evidences: [{ url: '/images/evidence-2.jpg', caption: 'Sanitasi Plat Press' }]
      },
      3: {
        score: 96,
        status: 'COMPLETED',
        note: 'Simulasi POS kasir lancar tanpa kendala. Hospitality sangat ramah.',
        checklistResults: { 'bm-d3-01': true, 'bm-d3-02': true, 'bm-d3-03': true },
        evidences: []
      }
    }
  },
  {
    id: 'beval-c02',
    batchId: 'batch-alpha',
    crewId: 'crew-002',
    evaluatorId: 'sl-001',
    evaluatorName: 'Budi Santoso (Store Leader)',
    storeId: 'store-001',
    storeName: 'Re.juve Grand Indonesia',
    status: 'RECOMMENDED',
    recommendationNote: 'Bella siap diterjunkan sebagai Senior Barista pendukung di Batch 1.',
    dayEvaluations: {
      1: {
        score: 90,
        status: 'COMPLETED',
        note: 'Grooming baik, memahami alur area kerja basah dan kering.',
        checklistResults: { 'bm-d1-01': true, 'bm-d1-02': true, 'bm-d1-03': true },
        evidences: []
      },
      2: {
        score: 94,
        status: 'COMPLETED',
        note: 'Pencatatan suhu chiller akurat di 3°C.',
        checklistResults: { 'bm-d2-01': true, 'bm-d2-02': true, 'bm-d2-03': true },
        evidences: []
      },
      3: {
        score: 93,
        status: 'COMPLETED',
        note: 'Greeting pelanggan ramah dan sigap.',
        checklistResults: { 'bm-d3-01': true, 'bm-d3-02': true, 'bm-d3-03': true },
        evidences: []
      }
    }
  },

  // Evaluasi Kru Batch 3 (Pondok Indah Mall - Store Leader: Dewi Lestari)
  {
    id: 'beval-c12',
    batchId: 'batch-gamma',
    crewId: 'crew-012',
    evaluatorId: 'sl-002',
    evaluatorName: 'Dewi Lestari (Store Leader)',
    storeId: 'store-003',
    storeName: 'Re.juve Pondok Indah Mall',
    status: 'RECOMMENDED',
    recommendationNote: 'Lina memiliki jiwa leadership kuat, sangat siap untuk program kepemimpinan Batch 3.',
    dayEvaluations: {
      1: {
        score: 96,
        status: 'COMPLETED',
        note: 'Grooming sempurna, paham 100% prinsip cold chain.',
        checklistResults: { 'bm-d1-01': true, 'bm-d1-02': true, 'bm-d1-03': true },
        evidences: [{ url: '/images/evidence-1.jpg', caption: 'Orientasi Grooming PIM' }]
      },
      2: {
        score: 95,
        status: 'COMPLETED',
        note: 'Sanitasi mesin press sangat teliti.',
        checklistResults: { 'bm-d2-01': true, 'bm-d2-02': true, 'bm-d2-03': true },
        evidences: []
      },
      3: {
        score: 98,
        status: 'COMPLETED',
        note: 'Simulasi kasir POS dan briefing pagi luar biasa.',
        checklistResults: { 'bm-d3-01': true, 'bm-d3-02': true, 'bm-d3-03': true },
        evidences: []
      }
    }
  }
]
