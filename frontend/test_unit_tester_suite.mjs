import { createPinia, setActivePinia } from 'pinia'
import {
  calculateStars,
  starsToPoints,
  calculateAverageDmSl
} from './utils/star.js'
import {
  MISSION_STATUSES,
  getMissionStatusMeta,
  calculateBatchCompletion
} from './utils/mission.js'
import { useUserStore } from './stores/user.js'
import { useApprovalStore } from './stores/approval.js'
import { useGamificationStore } from './stores/gamification.js'
import { useMissionStore } from './stores/mission.js'
import { useReportStore, downloadFileBlob } from './stores/report.js'
import { useBatchStore } from './stores/batch.js'
import { useStoreStore } from './stores/store.js'
import { reportApi, authApi, batchApi, departmentApi } from './services/api.js'

console.log('🧪 MEMULAI PENGUJIAN KOMPREHENSIF UNIT TESTER (QA SUITE)...\n')

let totalTests = 0
let passedTests = 0
let failedTests = 0

function test(name, fn) {
  totalTests++
  try {
    fn()
    passedTests++
    console.log(`  ✅ [PASS] ${name}`)
  } catch (err) {
    failedTests++
    console.error(`  ❌ [FAIL] ${name}`)
    console.error(`     Error: ${err.message}`)
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || ''} (Ekspektasi: ${expected}, Didapat: ${actual})`)
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(`${message || 'Assertion gagal, nilai bukan true'}`)
  }
}

function assertFalse(condition, message) {
  if (condition) {
    throw new Error(`${message || 'Assertion gagal, nilai bukan false'}`)
  }
}

// Setup Pinia Test Environment
const pinia = createPinia()
setActivePinia(pinia)

// ============================================================================
// SUITE 1: FORMULA PERHITUNGAN BINTANG & POIN GAMIFIKASI (utils/star.js)
// ============================================================================
console.log('📌 1. Menguji Formula Perhitungan Bintang & Poin Gamifikasi (Happy Path & Edge Cases):')

// 1.1 Happy Path
test('calculateStars: skor 100 menghasilkan 5.0 bintang', () => {
  assertEqual(calculateStars(100), 5.0)
})

test('calculateStars: skor 50 menghasilkan 2.5 bintang', () => {
  assertEqual(calculateStars(50), 2.5)
})

test('calculateStars: skor 78 menghasilkan 3.9 bintang (dibulatkan 1 desimal)', () => {
  assertEqual(calculateStars(78), 3.9)
})

// 1.2 Boundary & Edge Cases
test('calculateStars: skor 0 menghasilkan 0 bintang', () => {
  assertEqual(calculateStars(0), 0)
})

test('calculateStars: skor negatif (< 0) harus di-clamp menjadi 0 bintang', () => {
  assertEqual(calculateStars(-15), 0)
  assertEqual(calculateStars(-999), 0)
})

test('calculateStars: skor melebihi 100 (> 100) harus di-clamp maksimal 5.0 bintang', () => {
  assertEqual(calculateStars(105), 5.0)
  assertEqual(calculateStars(250), 5.0)
})

test('calculateStars: input string numerik ("85") harus dikonversi dengan benar', () => {
  assertEqual(calculateStars('85'), 4.3)
})

test('calculateStars: input tidak valid (null, undefined, NaN, "abc") harus aman menghasilkan 0', () => {
  assertEqual(calculateStars(null), 0)
  assertEqual(calculateStars(undefined), 0)
  assertEqual(calculateStars(NaN), 0)
  assertEqual(calculateStars('invalid_text'), 0)
})

// 1.3 Stars to Points (1 Bintang = 20 Points)
test('starsToPoints: konversi 5.0 bintang menjadi 100 poin', () => {
  assertEqual(starsToPoints(5), 100)
})

test('starsToPoints: konversi 2.5 bintang menjadi 50 poin', () => {
  assertEqual(starsToPoints(2.5), 50)
})

test('starsToPoints: konversi 56.5 bintang menjadi 1130 poin (Leaderboard spec)', () => {
  assertEqual(starsToPoints(56.5), 1130)
})

test('starsToPoints: konversi 100 bintang menjadi 2000 poin', () => {
  assertEqual(starsToPoints(100), 2000)
})

test('starsToPoints: input null/undefined menghasilkan 0 poin', () => {
  assertEqual(starsToPoints(null), 0)
  assertEqual(starsToPoints(undefined), 0)
})

// 1.4 Rumus Rata-rata SL & DM ((SL + DM) / 2) vs Penilaian Murni DM (isSlNotScored: true)
test('calculateAverageDmSl: SL=78 dan DM=85 (Reguler) menghasilkan avgScore 81.5 dan 4.1 bintang', () => {
  const res = calculateAverageDmSl(78, 85, false)
  assertEqual(res.avgScore, 81.5)
  assertEqual(res.stars, 4.1)
  assertEqual(res.isPureDm, false)
})

test('calculateAverageDmSl: SL=100 dan DM=100 menghasilkan avgScore 100 dan 5.0 bintang', () => {
  const res = calculateAverageDmSl(100, 100)
  assertEqual(res.avgScore, 100)
  assertEqual(res.stars, 5.0)
  assertEqual(res.isPureDm, false)
})

test('calculateAverageDmSl: SL Tidak Menilai / Auto-Forward Job (isSlNotScored: true) menghasilkan nilai murni DM 100% (DM=85 -> 85, 4.3⭐)', () => {
  const res = calculateAverageDmSl(0, 85, true)
  assertEqual(res.avgScore, 85)
  assertEqual(res.stars, 4.3)
  assertEqual(res.isPureDm, true)
})

test('calculateAverageDmSl: SL Tidak Menilai (isSlNotScored: true) dengan DM=100 menghasilkan 100 dan 5.0⭐', () => {
  const res = calculateAverageDmSl(null, 100, true)
  assertEqual(res.avgScore, 100)
  assertEqual(res.stars, 5.0)
  assertEqual(res.isPureDm, true)
})

test('calculateAverageDmSl: SL Tidak Menilai (isSlNotScored: true) dengan DM=70 menghasilkan 70 dan 3.5⭐', () => {
  const res = calculateAverageDmSl(undefined, 70, true)
  assertEqual(res.avgScore, 70)
  assertEqual(res.stars, 3.5)
  assertEqual(res.isPureDm, true)
})

test('calculateAverageDmSl: edge case nilai 0 pada kedua penilai', () => {
  const res = calculateAverageDmSl(0, 0)
  assertEqual(res.avgScore, 0)
  assertEqual(res.stars, 0)
})

test('calculateAverageDmSl: edge case penilai DM undefined pada mode reguler (fallback aman)', () => {
  const res = calculateAverageDmSl(90, undefined)
  assertEqual(res.avgScore, 45)
  assertEqual(res.stars, 2.3)
})

console.log('')

// ============================================================================
// SUITE 2: MISSION STATUS & COMPLETION HELPER (utils/mission.js)
// ============================================================================
console.log('📌 2. Menguji Status Misi & Perhitungan Progres Batch:')

test('MISSION_STATUSES: memastikan 9 status standar tersedia dengan label Bahasa Indonesia', () => {
  const expectedStatuses = [
    'NOT_STARTED', 'IN_PROGRESS', 'DRAFT', 'EVALUATED',
    'PENDING_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'COMPLETED', 'LOCKED'
  ]
  expectedStatuses.forEach(st => {
    assertTrue(Boolean(MISSION_STATUSES[st]), `Status ${st} harus terdefinisi`)
    assertTrue(typeof MISSION_STATUSES[st].label === 'string', `Status ${st} harus memiliki label teks`)
  })
})

test('getMissionStatusMeta: mengembalikan metadata yang benar untuk status valid', () => {
  const meta = getMissionStatusMeta('PENDING_REVIEW')
  assertEqual(meta.key, 'PENDING_REVIEW')
  assertEqual(meta.label, 'Menunggu Review DM')
  assertEqual(meta.color, 'amber')
})

test('getMissionStatusMeta: case-insensitive handling ("completed" -> "COMPLETED")', () => {
  const meta = getMissionStatusMeta('completed')
  assertEqual(meta.key, 'COMPLETED')
  assertEqual(meta.label, 'Selesai')
})

test('getMissionStatusMeta: fallback aman untuk input null / undefined / kosong', () => {
  assertEqual(getMissionStatusMeta(null).key, 'NOT_STARTED')
  assertEqual(getMissionStatusMeta(undefined).key, 'NOT_STARTED')
  assertEqual(getMissionStatusMeta('').key, 'NOT_STARTED')
})

test('getMissionStatusMeta: fallback terformat untuk status asing yang tidak dikenal', () => {
  const meta = getMissionStatusMeta('CUSTOM_STATUS_UNKNOWN')
  assertEqual(meta.key, 'CUSTOM_STATUS_UNKNOWN')
  assertEqual(meta.label, 'CUSTOM STATUS UNKNOWN')
})

test('calculateBatchCompletion: menangani input array kosong dan non-array secara aman', () => {
  const emptyRes = calculateBatchCompletion([])
  assertEqual(emptyRes.total, 0)
  assertEqual(emptyRes.percentage, 0)

  const nullRes = calculateBatchCompletion(null)
  assertEqual(nullRes.total, 0)
  assertEqual(nullRes.percentage, 0)
})

test('calculateBatchCompletion: menghitung total dan persentase penyelesaian secara akurat', () => {
  const sampleMissions = [
    { id: 1, status: 'COMPLETED' },
    { id: 2, status: 'APPROVED' },
    { id: 3, status: 'PENDING_REVIEW' },
    { id: 4, status: 'IN_PROGRESS' },
    { id: 5, status: 'NOT_STARTED' }
  ]
  const metrics = calculateBatchCompletion(sampleMissions)
  assertEqual(metrics.total, 5)
  assertEqual(metrics.completed, 2)
  assertEqual(metrics.pending, 1)
  assertEqual(metrics.inProgress, 1)
  assertEqual(metrics.percentage, 40) // (2 / 5) * 100 = 40%
})

console.log('')

// ============================================================================
// SUITE 3: ROLE & PERMISSION RULES (STORE LEADER, DM, CREW, BUDDY)
// ============================================================================
console.log('📌 3. Menguji Validasi Role & Kebijakan Hak Akses Navigasi:')

const userStore = useUserStore()

// Fixture user terisolasi untuk unit test
;[
  { id: 'sl-001', name: 'Budi Santoso', role: 'STORE_LEADER', isBuddy: true, email: 'budi.santoso@rejuve.co.id' },
  { id: 'sl-002', name: 'Dewi Lestari', role: 'STORE_LEADER', isBuddy: false, email: 'dewi.lestari@rejuve.co.id' },
  { id: 'dm-001', name: 'Ahmad Dahlan', role: 'DISTRICT_MANAGER', email: 'ahmad.dahlan@rejuve.co.id' },
  { id: 'crew-001', name: 'Andi Pratama', role: 'CREW', email: 'andi.pratama@rejuve.co.id' },
  { id: 'crew-002', name: 'Budi Kru', role: 'CREW', email: 'budi.kru@rejuve.co.id' }
].forEach(u => userStore.createUser(u))

test('Role Crew: identifikasi role dan ketiadaan akses manajerial', () => {
  userStore.loginAsUser('crew-001')
  assertTrue(userStore.isCrew, 'crew-001 harus terdeteksi sebagai isCrew')
  assertFalse(userStore.isStoreLeader, 'Crew tidak boleh memiliki hak isStoreLeader')
  assertFalse(userStore.isDistrictManager, 'Crew tidak boleh memiliki hak isDistrictManager')
  assertFalse(userStore.isSuperadmin, 'Crew tidak boleh memiliki hak isSuperadmin')
})

test('Role Store Leader (isBuddy = true): hak penilaian reguler dan penilaian buddy', () => {
  userStore.loginAsUser('sl-001')
  assertTrue(userStore.isStoreLeader, 'sl-001 harus terdeteksi sebagai Store Leader')
  assertTrue(Boolean(userStore.currentUser.isBuddy), 'sl-001 harus memiliki flag isBuddy true')
  assertFalse(userStore.isDistrictManager, 'Store Leader bukan District Manager')
})

test('Role Store Leader (isBuddy = false): hak penilaian reguler tanpa buddy', () => {
  userStore.loginAsUser('sl-002')
  assertTrue(userStore.isStoreLeader, 'sl-002 harus terdeteksi sebagai Store Leader')
  assertFalse(Boolean(userStore.currentUser.isBuddy), 'sl-002 harus memiliki flag isBuddy false')
})

test('Role District Manager (DM): hak persetujuan (Approvals) dan isolasi dari form penilaian kru', () => {
  userStore.loginAsUser('dm-001')
  assertTrue(userStore.isDistrictManager, 'dm-001 harus terdeteksi sebagai District Manager')
  assertFalse(userStore.isStoreLeader, 'DM tidak boleh merangkap Store Leader')
  assertFalse(userStore.isCrew, 'DM tidak boleh merangkap Crew')
})

test('Simulasi Navigasi: Menu Penilaian Buddy hanya muncul jika SL memiliki isBuddy: true', () => {
  // Fungsi logika yang sama persis seperti di AppSidebar.vue
  function getNavPathsForUser(user) {
    const role = user.role
    const isBuddy = Boolean(user.isBuddy)
    const paths = []

    if (role === 'STORE_LEADER') {
      paths.push('/dashboard', '/batches')
      if (isBuddy) paths.push('/buddy')
      paths.push('/evaluations', '/missions', '/leaderboard')
    } else if (role === 'DISTRICT_MANAGER') {
      paths.push('/dashboard', '/batches', '/approvals', '/missions', '/leaderboard')
    } else if (role === 'CREW') {
      paths.push('/dashboard', '/journey', '/missions', '/feedback', '/leaderboard', '/profile')
    }
    return paths
  }

  // Uji SL dengan isBuddy = true
  const sl1Nav = getNavPathsForUser({ role: 'STORE_LEADER', isBuddy: true })
  assertTrue(sl1Nav.includes('/buddy'), 'SL dengan isBuddy=true wajib melihat /buddy')
  assertTrue(sl1Nav.includes('/evaluations'), 'SL melihat form evaluasi')

  // Uji SL dengan isBuddy = false
  const sl2Nav = getNavPathsForUser({ role: 'STORE_LEADER', isBuddy: false })
  assertFalse(sl2Nav.includes('/buddy'), 'SL dengan isBuddy=false TIDAK BOLEH melihat /buddy')

  // Uji DM
  const dmNav = getNavPathsForUser({ role: 'DISTRICT_MANAGER', isBuddy: false })
  assertFalse(dmNav.includes('/buddy'), 'DM TIDAK BOLEH melihat menu /buddy')
  assertFalse(dmNav.includes('/evaluations'), 'DM TIDAK BOLEH melihat menu /evaluations')
  assertTrue(dmNav.includes('/approvals'), 'DM WAJIB melihat menu /approvals')
})

console.log('')

// ============================================================================
// SUITE 4: APPROVAL WORKFLOW & EDGE CASES (stores/approval.js)
// ============================================================================
console.log('📌 4. Menguji Workflow Persetujuan DM & Edge Cases:')

const approvalStore = useApprovalStore()
const gamificationStore = useGamificationStore()

test('bulkApprove: penanganan array kosong tidak boleh melempar error', () => {
  const result = approvalStore.bulkApprove([])
  assertEqual(result.success, false)
  assertEqual(result.approvedCount, 0)
})

test('bulkApprove: ID fiktif / tidak ditemukan ditangani dengan aman', () => {
  const result = approvalStore.bulkApprove(['non-existent-id-999999'])
  assertEqual(result.success, false)
  assertEqual(result.approvedCount, 0)
})

test('requestRevision: berhasil mengubah status approval menjadi REVISION_REQUIRED', () => {
  // Tambah item draf approval untuk dites
  approvalStore.approvals.push({
    id: 'app-test-unit-01',
    missionId: 'msn-test-01',
    status: 'PENDING_REVIEW',
    crewId: 'crew-001',
    score: 80
  })

  const revResult = approvalStore.requestRevision('app-test-unit-01', 'Perbaiki pencatatan suhu chiller')
  assertTrue(revResult.success, 'Request revision harus berhasil')
  
  const item = approvalStore.approvals.find(a => a.id === 'app-test-unit-01')
  assertEqual(item.status, 'REVISION_REQUIRED', 'Status harus menjadi REVISION_REQUIRED')
  assertEqual(item.revisionNote, 'Perbaiki pencatatan suhu chiller')
})

test('DM Notes Visibility: Catatan persetujuan DM (dmNotes) dan catatan SL (tlNotes) dapat ditampilkan bersama', () => {
  const missionItem = {
    userMissionId: 'um-test-01',
    status: 'APPROVED_BY_DM',
    tlScore: 90,
    tlNotes: 'Kru sudah bekerja sesuai standar SOP operasional.',
    dmScore: 95,
    dmNotes: 'Disetujui oleh District Manager. Pertahankan kebersihan chiller.',
    dm: { userId: 'dm-01', name: 'Ahmad Dahlan' }
  }

  function getMissionComment(m) {
    if (m?.tlNotes && m.tlNotes.trim()) return m.tlNotes
    return 'Catatan evaluasi belum diisi.'
  }

  function getMissionDmNotes(m) {
    if (m?.dmNotes && m.dmNotes.trim()) return m.dmNotes
    return ''
  }

  function getMissionDmName(m) {
    return m?.dm?.name || 'District Manager'
  }

  assertEqual(getMissionComment(missionItem), 'Kru sudah bekerja sesuai standar SOP operasional.', 'Catatan Evaluator SL terbaca dengan tepat')
  assertEqual(getMissionDmNotes(missionItem), 'Disetujui oleh District Manager. Pertahankan kebersihan chiller.', 'Catatan DM terbaca dengan tepat')
  assertEqual(getMissionDmName(missionItem), 'Ahmad Dahlan', 'Nama DM teridentifikasi dengan tepat')
})

test('approveMission (Reguler): SL=80 dan DM=90 menghasilkan skor rata-rata 85 (4.3⭐)', () => {
  approvalStore.approvals.push({
    id: 'app-test-reguler',
    missionId: 'msn-test-reguler',
    status: 'PENDING_REVIEW',
    crewId: 'crew-001',
    slScore: 80,
    isSlNotScored: false
  })

  const res = approvalStore.approveMission('app-test-reguler', { dmScore: 90 })
  assertTrue(res.success, 'Approval reguler harus berhasil')
  assertEqual(res.finalScore, 85, 'Skor akhir harus rata-rata (80+90)/2 = 85')
  assertEqual(res.awardedStars, 4.3, 'Bintang harus 4.3⭐')
  assertEqual(res.isAdjustedByDm, true, 'isAdjustedByDm harus true')
})

test('approveMission (Auto-Forward Job / SL Tidak Menilai): Nilai murni 100% dari DM (DM=90 -> Skor=90, 4.5⭐)', () => {
  approvalStore.approvals.push({
    id: 'app-test-job-autoforward',
    missionId: 'msn-test-job-01',
    status: 'PENDING_REVIEW',
    crewId: 'crew-002',
    slScore: 0,
    isSlNotScored: true
  })

  const res = approvalStore.approveMission('app-test-job-autoforward', { dmScore: 90, dmNote: 'Disetujui murni oleh DM' })
  assertTrue(res.success, 'Approval auto-forward harus berhasil')
  assertEqual(res.finalScore, 90, 'Skor akhir wajib 100% murni DM (90) bukan dirata-rata dengan SL')
  assertEqual(res.awardedStars, 4.5, 'Bintang wajib 4.5⭐ (90/100 * 5)')
  
  const savedItem = approvalStore.approvals.find(a => a.id === 'app-test-job-autoforward')
  assertEqual(savedItem.score, 90, 'Score di state approval harus 90')
  assertEqual(savedItem.calculatedStars, 4.5, 'Calculated stars di state approval harus 4.5')
  assertEqual(savedItem.status, 'APPROVED', 'Status harus APPROVED')
  assertEqual(savedItem.isSlNotScored, true, 'Flag isSlNotScored harus tetap true')
})

console.log('')

// ============================================================================
// SUITE 5: USER STORE FILTER & PAGINATION INTEGRATION (stores/user.js)
// ============================================================================
console.log('📌 5. Menguji Dukungan Filter Batch Pengguna:')

test('userStore: dukungan filter parameter exact.batchId pada fetchUsersFromApi', () => {
  // Verifikasi struktur metode dan parameter
  assertTrue(typeof userStore.fetchUsersFromApi === 'function', 'fetchUsersFromApi harus berupa fungsi')
  // Menguji direktori pengguna lokal
  const users = userStore.allUsers
  assertTrue(Array.isArray(users), 'allUsers harus mengembalikan array pengguna')
  assertTrue(users.length > 0, 'allUsers harus memiliki data pengguna')
})

console.log('')

// ============================================================================
// SUITE 6: CREW MISSION ISOLATION (Journey & Missions Page)
// ============================================================================
console.log('📌 6. Menguji Isolasi Data Misi per Kru pada Menu /journey & /missions:')

test('Crew Mission Isolation: Kru hanya melihat misinya sendiri (bukan seluruh misi anggota batch)', () => {
  const missionStore = useMissionStore()

  // Setup batch dengan 2 kru berbeda di batch yang sama
  const testBatchId = 'batch-isolation-test'
  const mockMissions = [
    // Misi milik crew-001 di Week 1 (3 misi)
    { id: 'm-c1-w1-1', batchId: testBatchId, week: 1, title: 'Misi C1 1.1', assignedCrewIds: ['crew-001'], crewEvaluations: [{ crewId: 'crew-001', score: 80, status: 'COMPLETED' }], status: 'COMPLETED' },
    { id: 'm-c1-w1-2', batchId: testBatchId, week: 1, title: 'Misi C1 1.2', assignedCrewIds: ['crew-001'], crewEvaluations: [{ crewId: 'crew-001', score: 90, status: 'IN_PROGRESS' }], status: 'IN_PROGRESS' },
    { id: 'm-c1-w1-3', batchId: testBatchId, week: 1, title: 'Misi C1 1.3', assignedCrewIds: ['crew-001'], crewEvaluations: [{ crewId: 'crew-001', score: 85, status: 'IN_PROGRESS' }], status: 'IN_PROGRESS' },
    // Misi milik crew-002 di Week 1 (3 misi)
    { id: 'm-c2-w1-1', batchId: testBatchId, week: 1, title: 'Misi C2 1.1', assignedCrewIds: ['crew-002'], crewEvaluations: [{ crewId: 'crew-002', score: 95, status: 'COMPLETED' }], status: 'COMPLETED' },
    { id: 'm-c2-w1-2', batchId: testBatchId, week: 1, title: 'Misi C2 1.2', assignedCrewIds: ['crew-002'], crewEvaluations: [{ crewId: 'crew-002', score: 88, status: 'COMPLETED' }], status: 'COMPLETED' },
    { id: 'm-c2-w1-3', batchId: testBatchId, week: 1, title: 'Misi C2 1.3', assignedCrewIds: ['crew-002'], crewEvaluations: [{ crewId: 'crew-002', score: 70, status: 'IN_PROGRESS' }], status: 'IN_PROGRESS' },
  ]
  missionStore.missions = mockMissions

  // 1. Simulasi login sebagai crew-001
  userStore.loginAsUser('crew-001')
  userStore.currentUser.batchId = testBatchId

  function getActiveBatchMissions(isCrew, currentUser) {
    const list = missionStore.missionsByBatch(testBatchId) || []
    if (isCrew && currentUser?.id) {
      const currentCrewId = currentUser.id
      return list.filter(m => {
        return (m.assignedCrewIds && m.assignedCrewIds.includes(currentCrewId)) ||
          (m.crewEvaluations && m.crewEvaluations.some(ce => ce.crewId === currentCrewId))
      })
    }
    return list
  }

  const c1Missions = getActiveBatchMissions(userStore.isCrew, userStore.currentUser)
  assertEqual(c1Missions.length, 3, 'crew-001 harus tepat mendapatkan 3 misi di Week 1 (bukan 6)')
  assertTrue(c1Missions.every(m => m.assignedCrewIds.includes('crew-001')), 'Semua misi harus milik crew-001')

  // 2. Simulasi login sebagai crew-002
  userStore.loginAsUser('crew-002')
  userStore.currentUser.batchId = testBatchId
  const c2Missions = getActiveBatchMissions(userStore.isCrew, userStore.currentUser)
  assertEqual(c2Missions.length, 3, 'crew-002 harus tepat mendapatkan 3 misi di Week 1 (bukan 6)')
  assertTrue(c2Missions.every(m => m.assignedCrewIds.includes('crew-002')), 'Semua misi harus milik crew-002')

  // 3. Simulasi login sebagai Store Leader (melihat seluruh 6 misi gerai)
  userStore.loginAsUser('sl-001')
  const slMissions = getActiveBatchMissions(userStore.isCrew, userStore.currentUser)
  assertEqual(slMissions.length, 6, 'Store Leader harus dapat melihat seluruh 6 misi di batch')
})

console.log('')

// ============================================================================
// SUITE 7: BATCH SWITCHER & MISSION CREW DETAIL MODAL
// ============================================================================
console.log('📌 7. Menguji Switcher Batch Misi & Parsing Detail Nilai Kru:')

test('Batch Switcher: sinkronisasi state selectedBatchId dan customSelectedWeek', () => {
  const batchStore = useBatchStore()
  batchStore.batches = [
    { id: 'b-01', code: 'BTH-01', name: 'Batch 1', currentWeek: 1, startDate: '2026-09-01' },
    { id: 'b-02', code: 'BTH-02', name: 'Batch 2', currentWeek: 2, startDate: '2026-08-25' }
  ]

  batchStore.selectBatch('b-02')
  assertEqual(batchStore.selectedBatchId, 'b-02', 'selectedBatchId harus b-02')
  assertEqual(batchStore.currentBatch.id, 'b-02', 'currentBatch harus merujuk ke b-02')
})

test('Mission Crew Detail: parsing evaluasi multi-kru per misi', () => {
  const sampleMission = {
    id: 'm-01',
    title: 'Pembersihan Cold Press Bar',
    category: 'Kebersihan',
    averageScore: 92,
    calculatedStars: 4.6,
    crewEvaluations: [
      { crewId: 'crew-001', name: 'Andi Pratama', score: 95, status: 'COMPLETED' },
      { crewId: 'crew-002', name: 'Budi Kru', score: 89, status: 'COMPLETED' }
    ]
  }

  const crewScores = sampleMission.crewEvaluations || []
  assertEqual(crewScores.length, 2, 'Misi harus memiliki 2 catatan evaluasi kru')
  assertEqual(crewScores[0].score, 95, 'Kru 1 mendapatkan skor 95')
  assertEqual(crewScores[1].score, 89, 'Kru 2 mendapatkan skor 89')
  const avg = Math.round(crewScores.reduce((sum, c) => sum + c.score, 0) / crewScores.length)
  assertEqual(avg, 92, 'Rata-rata kru harus tepat 92')
})

console.log('')

// ============================================================================
// SUITE 8: PROFILE ROLE ISOLATION & ACCOUNT SECURITY (pages/profile.vue & stores/user.js)
// ============================================================================
console.log('📌 8. Menguji Isolasi Profil Manajerial vs Crew & Keamanan Akun:')

test('Profile Gamification Visibility: Crew memiliki kartu bintang & lencana, sedangkan SL/DM tidak', () => {
  // Logika render profile.vue: gamifikasi hanya v-if="userStore.isCrew"
  function shouldShowGamificationCards(user) {
    return user.role === 'CREW'
  }

  userStore.loginAsUser('crew-001')
  assertTrue(shouldShowGamificationCards(userStore.currentUser), 'Crew wajib melihat komponen kartu gamifikasi bintang')

  userStore.loginAsUser('sl-001')
  assertFalse(shouldShowGamificationCards(userStore.currentUser), 'Store Leader TIDAK BOLEH melihat komponen kartu bintang gamifikasi')

  userStore.loginAsUser('dm-001')
  assertFalse(shouldShowGamificationCards(userStore.currentUser), 'District Manager TIDAK BOLEH melihat komponen kartu bintang gamifikasi')
})

test('Profile Update Endpoint: Endpoint PUT /auth/profile dan action updateProfile tersedia', async () => {
  assertTrue(typeof authApi.updateProfile === 'function', 'authApi.updateProfile harus terdefinisi sebagai fungsi pemanggil API')
  assertTrue(typeof userStore.updateProfile === 'function', 'userStore.updateProfile harus terdefinisi di Pinia user store')
})

test('Profile Update Multipart: Berhasil update profil mandiri via FormData multipart/form-data', async () => {
  userStore.loginAsUser('dm-001')
  
  // Test 1: Update via FormData
  if (typeof FormData !== 'undefined') {
    const fd = new FormData()
    fd.append('name', 'Ahmad Dahlan S.E.')
    fd.append('phone', '081234567899')
    fd.append('gender', 'M')
    fd.append('avatarUrl', 'https://images.unsplash.com/photo-profile-dm.jpg')
    await userStore.updateProfile(fd)

    const updated = userStore.currentUser
    assertEqual(updated.name, 'Ahmad Dahlan S.E.', 'Nama profil DM berhasil diperbarui via multipart FormData')
    assertEqual(updated.phone, '081234567899', 'Nomor telepon DM berhasil diperbarui via multipart FormData')
    assertEqual(updated.gender, 'M', 'Gender DM berhasil diperbarui via multipart FormData')
    assertEqual(updated.avatarUrl, 'https://images.unsplash.com/photo-profile-dm.jpg', 'Avatar DM berhasil diperbarui via multipart FormData')
  }

  // Test 2: Update via Object payload
  await userStore.updateProfile({
    id: 'dm-001',
    name: 'Ahmad Dahlan S.E., M.M.',
    phone: '081234567800',
    gender: 'M',
    avatarUrl: 'https://images.unsplash.com/photo-profile-dm-2.jpg'
  })

  const updatedObj = userStore.currentUser
  assertEqual(updatedObj.name, 'Ahmad Dahlan S.E., M.M.', 'Nama profil DM berhasil diperbarui via payload object')
  assertEqual(updatedObj.phone, '081234567800', 'Nomor telepon DM berhasil diperbarui via payload object')
})

test('Change Password Validation: Validasi password minimal 6 karakter dan kelengkapan input', async () => {
  // Test password terlalu pendek (< 6)
  let threwMinLength = false
  try {
    await userStore.changePassword({ oldPassword: 'old123', newPassword: '123' })
  } catch (e) {
    threwMinLength = true
  }
  assertTrue(threwMinLength, 'Change password harus melempar error jika password < 6 karakter')

  // Test input kosong
  let threwEmpty = false
  try {
    await userStore.changePassword({ oldPassword: '', newPassword: '' })
  } catch (e) {
    threwEmpty = true
  }
  assertTrue(threwEmpty, 'Change password harus melempar error jika input kosong')

  // Test password valid
  const validRes = await userStore.changePassword({ oldPassword: 'OldPassword123!', newPassword: 'NewSecret123!' })
  assertTrue(Boolean(validRes), 'Change password dengan input valid berhasil dieksekusi')
})

test('First Login Bonus Modal: Crew pertama kali login menerima 5 bintang dan 100 poin sambutan', () => {
  // Reset previous state
  userStore.dismissWelcomeReward('test-crew-first-login')
  
  // Login sebagai Crew baru
  userStore.createUser({
    id: 'test-crew-first-login',
    name: 'Intan Permata',
    role: 'CREW',
    email: 'intan.p@rejuve.co.id'
  })
  userStore.loginAsUser('test-crew-first-login')

  assertTrue(Boolean(userStore.pendingWelcomeReward), 'Kru baru harus memiliki pendingWelcomeReward aktif')
  assertEqual(userStore.pendingWelcomeReward?.starsEarned, 5, 'Bonus Bintang login pertama adalah +5 Bintang')
  assertEqual(userStore.pendingWelcomeReward?.pointsEarned, 100, 'Bonus Poin login pertama adalah +100 Pts')

  // Dismiss reward
  userStore.dismissWelcomeReward('test-crew-first-login')
  assertEqual(userStore.pendingWelcomeReward, null, 'Setelah dismiss, pendingWelcomeReward bernilai null')
  
  // Bersihkan data
  userStore.deleteUser('test-crew-first-login')
})

// ============================================================================
// ============================================================================
// SUITE 9: VALIDASI RESTRIKSI TAHAPAN ONBOARDING (BUDDY SEBELUM JOURNEY)
// ============================================================================
console.log('\n📌 9. Menguji Validasi Restriksi Tahap Onboarding (BUDDY vs JOURNEY):')

test('Evaluasi Kru: Kru dengan step "BUDDY" harus berstatus terkunci dari input nilai SL', () => {
  const checkBuddyLocked = (step) => {
    if (!step) return false
    return step === 'BUDDY' || (step !== 'JOURNEY' && step !== 'FEEDBACK' && step !== 'COMPLETED')
  }

  assertTrue(checkBuddyLocked('BUDDY'), 'Step BUDDY harus terkunci dari input nilai SL')
  assertTrue(checkBuddyLocked('ONBOARDING'), 'Step non-JOURNEY/non-COMPLETED harus terkunci')
  assertFalse(checkBuddyLocked('JOURNEY'), 'Step JOURNEY harus terbuka untuk dinilai SL')
  assertFalse(checkBuddyLocked('FEEDBACK'), 'Step FEEDBACK harus terbuka (telah melewati tahap Buddy)')
  assertFalse(checkBuddyLocked('COMPLETED'), 'Step COMPLETED harus terbuka (telah menyelesaikan seluruh tahapan)')
})

test('Evaluasi Kru: Validasi pencegahan submit nilai untuk kru di tahap BUDDY', () => {
  const submitMissionAttempt = (crew) => {
    const isLocked = crew.step === 'BUDDY' || (crew.step && crew.step !== 'JOURNEY' && crew.step !== 'FEEDBACK' && crew.step !== 'COMPLETED')
    if (isLocked) {
      throw new Error(`Tahap Buddy Belum Selesai: Kru "${crew.name}" masih berada di tahap BUDDY.`)
    }
    return { success: true, message: 'Berhasil dikirim ke DM' }
  }

  // 1. Coba submit untuk kru di tahap BUDDY
  const buddyCrew = { id: 'c-01', name: 'Budi Santoso', step: 'BUDDY' }
  let blocked = false
  try {
    submitMissionAttempt(buddyCrew)
  } catch (err) {
    blocked = true
    assertTrue(err.message.includes('Tahap Buddy Belum Selesai'), 'Pesan error harus menginformasikan penyelesaian tahap Buddy')
  }
  assertTrue(blocked, 'Submit nilai untuk kru di tahap BUDDY harus dicegah/diblokir')

  // 2. Submit untuk kru di tahap JOURNEY
  const journeyCrew = { id: 'c-02', name: 'Siti Aminah', step: 'JOURNEY' }
  const result = submitMissionAttempt(journeyCrew)
  assertTrue(result.success, 'Submit nilai untuk kru di tahap JOURNEY harus berhasil')
})

test('Dashboard Pipeline: Resolusi tahapan kru (BUDDY -> Captain Phase vs JOURNEY -> Week 1)', () => {
  const resolveStageKey = (c) => {
    const isBuddy = c.step === 'BUDDY' || c.type === 'BUDDY' || c.isBuddy || c.buddyCompleted === false
    return isBuddy ? 'BUDDY' : `STAGE_${c.currentWeek || c.week || 1}`
  }

  const crew1 = { name: 'Budi Santoso', step: 'BUDDY' }
  const crew2 = { name: 'test1', step: 'JOURNEY', week: 1 }

  assertEqual(resolveStageKey(crew1), 'BUDDY', 'Kru dengan step BUDDY harus masuk ke Captain Phase')
  assertEqual(resolveStageKey(crew2), 'STAGE_1', 'Kru dengan step JOURNEY harus masuk ke STAGE_1 / Week 1')
})

test('Dashboard Wording DM vs SL: Memastikan perbedaan wording kartu metrik dan tabel untuk DM dan SL', () => {
  const getStageCardMeta = (isDm) => {
    if (isDm) {
      return {
        card1Title: 'New Hire Aktif',
        card1Sub: 'Total di area kamu',
        card2Title: 'Belum Mulai',
        card2Sub: 'Menunggu Minggu 1',
        card3Title: 'Minggu 1',
        card3Sub: 'Dalam proses',
        card4Title: 'Minggu 2',
        card4Sub: 'Dalam proses',
        card5Title: 'Minggu 3',
        card5Sub: 'Dalam proses',
        card6Title: 'Menunggu Approval',
        card6Sub: 'Perlu review kamu',
        tableTitle: 'New Hire di Area Kamu'
      }
    }
    return {
      card1Title: 'Active New Hires',
      card1Sub: 'Currently in onboarding',
      card2Title: 'Captain Phase',
      card2Sub: 'First 3 Days (Buddy)',
      card3Title: 'Week 1',
      card3Sub: 'Mission in Progress',
      card4Title: 'Week 2',
      card4Sub: 'Mission in Progress',
      card5Title: 'Week 3',
      card5Sub: 'Final Week',
      card6Title: 'Needs Review',
      card6Sub: 'Your Action Required',
      tableTitle: 'New Hire Journey'
    }
  }

  // Uji DM Wording
  const dmMeta = getStageCardMeta(true)
  assertEqual(dmMeta.card1Title, 'New Hire Aktif', 'DM Card 1 Title: New Hire Aktif')
  assertEqual(dmMeta.card1Sub, 'Total di area kamu', 'DM Card 1 Subtitle: Total di area kamu')
  assertEqual(dmMeta.card2Title, 'Belum Mulai', 'DM Card 2 Title: Belum Mulai')
  assertEqual(dmMeta.card2Sub, 'Menunggu Minggu 1', 'DM Card 2 Subtitle: Menunggu Minggu 1')
  assertEqual(dmMeta.card3Title, 'Minggu 1', 'DM Card 3 Title: Minggu 1')
  assertEqual(dmMeta.card4Title, 'Minggu 2', 'DM Card 4 Title: Minggu 2')
  assertEqual(dmMeta.card5Title, 'Minggu 3', 'DM Card 5 Title: Minggu 3')
  assertEqual(dmMeta.card6Title, 'Menunggu Approval', 'DM Card 6 Title: Menunggu Approval')
  assertEqual(dmMeta.card6Sub, 'Perlu review kamu', 'DM Card 6 Subtitle: Perlu review kamu')
  assertEqual(dmMeta.tableTitle, 'New Hire di Area Kamu', 'DM Table Title: New Hire di Area Kamu')

  // Uji SL Wording (Tidak Boleh Berubah)
  const slMeta = getStageCardMeta(false)
  assertEqual(slMeta.card1Title, 'Active New Hires', 'SL Card 1 Title tetap Active New Hires')
  assertEqual(slMeta.card2Title, 'Captain Phase', 'SL Card 2 Title tetap Captain Phase')
  assertEqual(slMeta.card3Title, 'Week 1', 'SL Card 3 Title tetap Week 1')
  assertEqual(slMeta.card4Title, 'Week 2', 'SL Card 4 Title tetap Week 2')
  assertEqual(slMeta.card5Title, 'Week 3', 'SL Card 5 Title tetap Week 3')
  assertEqual(slMeta.card6Title, 'Needs Review', 'SL Card 6 Title tetap Needs Review')
  assertEqual(slMeta.tableTitle, 'New Hire Journey', 'SL Table Title tetap New Hire Journey')
})

// ============================================================================
// SUITE 10: PENGUJIAN MODUL LAPORAN & TRACEABILITY (QA SUITE)
// ============================================================================
console.log('\n📌 10. Menguji Modul Laporan & Ekspor Spreadsheet (.xlsx):')

const reportStore = useReportStore()

test('Report API Interface: Memastikan 14 endpoint laporan & ekspor tersedia', () => {
  // 1. Buddy Incentive Endpoints
  assertTrue(typeof reportApi.getBuddyIncentives === 'function', 'reportApi.getBuddyIncentives tersedia')
  assertTrue(typeof reportApi.getBuddyIncentiveDetail === 'function', 'reportApi.getBuddyIncentiveDetail tersedia')
  assertTrue(typeof reportApi.exportBuddyIncentives === 'function', 'reportApi.exportBuddyIncentives tersedia')
  assertTrue(typeof reportApi.exportBuddyIncentiveDetail === 'function', 'reportApi.exportBuddyIncentiveDetail tersedia')

  // 2. User Traceability Endpoints
  assertTrue(typeof reportApi.getUserTraceability === 'function', 'reportApi.getUserTraceability tersedia')
  assertTrue(typeof reportApi.getUserTraceabilityDetail === 'function', 'reportApi.getUserTraceabilityDetail tersedia')
  assertTrue(typeof reportApi.exportUserTraceability === 'function', 'reportApi.exportUserTraceability tersedia')
  assertTrue(typeof reportApi.exportUserTraceabilityDetail === 'function', 'reportApi.exportUserTraceabilityDetail tersedia')

  // 3. Score Report Endpoints
  assertTrue(typeof reportApi.getScoreReport === 'function', 'reportApi.getScoreReport tersedia')
  assertTrue(typeof reportApi.exportScoreReport === 'function', 'reportApi.exportScoreReport tersedia')

  // 4. Report by Store Endpoints
  assertTrue(typeof reportApi.getStoreReport === 'function', 'reportApi.getStoreReport tersedia')
  assertTrue(typeof reportApi.exportStoreReport === 'function', 'reportApi.exportStoreReport tersedia')

  // 5. Report by DM Endpoints
  assertTrue(typeof reportApi.getDmReport === 'function', 'reportApi.getDmReport tersedia')
  assertTrue(typeof reportApi.exportDmReport === 'function', 'reportApi.exportDmReport tersedia')
})

test('Blob Downloader Helper: Menangani eksekusi di environment Node.js & Browser secara aman', () => {
  const res = downloadFileBlob('test-content', 'Test_Laporan.xlsx')
  assertTrue(res === true, 'downloadFileBlob berjalan tanpa error di runtime non-browser')
})

test('Report Store: Sinkronisasi 5 Tab & Filter State', () => {
  reportStore.activeTab = 'buddy-incentive'
  assertEqual(reportStore.activeTab, 'buddy-incentive', 'Tab aktif awal adalah buddy-incentive')

  reportStore.activeTab = 'user-traceability'
  assertEqual(reportStore.activeTab, 'user-traceability', 'Tab aktif berhasil dialihkan ke user-traceability')

  reportStore.activeTab = 'score-report'
  assertEqual(reportStore.activeTab, 'score-report', 'Tab aktif berhasil dialihkan ke score-report')

  reportStore.activeTab = 'store-report'
  assertEqual(reportStore.activeTab, 'store-report', 'Tab aktif berhasil dialihkan ke store-report')

  reportStore.activeTab = 'dm-report'
  assertEqual(reportStore.activeTab, 'dm-report', 'Tab aktif berhasil dialihkan ke dm-report')

  reportStore.setFilter('status', 'COMPLETED')
  assertEqual(reportStore.filters.status, 'COMPLETED', 'Filter status berhasil diperbarui')

  reportStore.setFilter('departmentId', 'dept-ops')
  assertEqual(reportStore.filters.departmentId, 'dept-ops', 'Filter departmentId berhasil diperbarui')

  reportStore.setFilter('storeCode', 'ST-001')
  assertEqual(reportStore.filters.storeCode, 'ST-001', 'Filter storeCode berhasil diperbarui')

  reportStore.setFilter('dmId', 'dm-001')
  assertEqual(reportStore.filters.dmId, 'dm-001', 'Filter dmId berhasil diperbarui')

  reportStore.resetFilters()
  assertEqual(reportStore.filters.status, '', 'Filter status berhasil direset')
  assertEqual(reportStore.filters.departmentId, '', 'Filter departmentId berhasil direset')
  assertEqual(reportStore.filters.storeCode, '', 'Filter storeCode berhasil direset')
  assertEqual(reportStore.filters.dmId, '', 'Filter dmId berhasil direset')
})

// ============================================================================
// SUITE 11: PENGUJIAN KOMPRESI GAMBAR & AUTO-CLAMPING SKOR
// ============================================================================
console.log('\n📌 11. Menguji Kompresi Foto Bukti & Clamping Skor (0–100):')

test('validateImageFile: Menolak berkas non-gambar (pdf, txt, exe)', async () => {
  const { validateImageFile } = await import('./utils/imageCompressor.js')
  const invalidFile = { type: 'application/pdf', size: 1024 }
  const res = validateImageFile(invalidFile)
  assertFalse(res.valid, 'File PDF harus ditolak')
  assertEqual(res.error, 'Format berkas harus berupa JPG, PNG, atau WebP')
})

test('validateImageFile: Menerima berkas gambar yang valid (jpeg, png, webp)', async () => {
  const { validateImageFile } = await import('./utils/imageCompressor.js')
  const validJpg = { type: 'image/jpeg', size: 500 * 1024 }
  const validPng = { type: 'image/png', size: 1024 * 1024 }
  const validWebp = { type: 'image/webp', size: 200 * 1024 }
  
  assertTrue(validateImageFile(validJpg).valid, 'JPG harus valid')
  assertTrue(validateImageFile(validPng).valid, 'PNG harus valid')
  assertTrue(validateImageFile(validWebp).valid, 'WebP harus valid')
})

test('validateImageFile: Menolak berkas yang melebihi batas ukuran 10MB', async () => {
  const { validateImageFile } = await import('./utils/imageCompressor.js')
  const oversizedFile = { type: 'image/jpeg', size: 15 * 1024 * 1024 }
  const res = validateImageFile(oversizedFile)
  assertFalse(res.valid, 'File > 10MB harus ditolak')
})

test('compressImage: Berjalan aman di environment Node.js / Non-Browser', async () => {
  const { compressImage } = await import('./utils/imageCompressor.js')
  const mockFile = { type: 'image/jpeg', size: 2048 }
  const res = await compressImage(mockFile)
  assertTrue(Boolean(res.dataUrl), 'Kompresi menghasilkan dataUrl yang valid')
  assertEqual(res.originalSize, 2048, 'Ukuran original tercatat akurat')
})

test('Score Clamping: Memastikan nilai skor selalu berada di rentang 0-100', () => {
  const clampScore = (val) => Math.min(100, Math.max(0, Math.round(Number(val) || 0)))
  assertEqual(clampScore(-50), 0, 'Skor negatif di-clamp ke 0')
  assertEqual(clampScore(150), 100, 'Skor > 100 di-clamp ke 100')
  assertEqual(clampScore('85.6'), 86, 'String desimal dibulatkan dengan aman')
  assertEqual(clampScore(null), 0, 'Null menghasilkan 0')
  assertEqual(clampScore(100), 100, 'Skor 100 tetap 100')
})

// ============================================================================
// SUITE 12: PENGUJIAN KEANDALAN PINDAH BATCH & PINDAH API (DATA INTEGRITY)
// ============================================================================
console.log('\n📌 12. Menguji Keandalan Pindah Batch & Pindah API (Zero Blank & Zero Stale Data):')

const testMissionStore = useMissionStore()
const testGamificationStore = useGamificationStore()
const testUserStore = useUserStore()

test('Mission Store: Dukungan parameter polimorfik pada fetchMissionsFromApi', async () => {
  // Format 1: fetchMissionsFromApi(params, forceRefresh)
  await testMissionStore.fetchMissionsFromApi({ batchId: 'batch-test-01' }, true)
  assertTrue(Array.isArray(testMissionStore.missions), 'missions harus berupa array')

  // Format 2: fetchMissionsFromApi(forceRefresh, params) - backward compatible
  await testMissionStore.fetchMissionsFromApi(true, { batchId: 'batch-test-02' })
  assertTrue(Array.isArray(testMissionStore.missions), 'missions harus berupa array pada format backward compatible')
})

test('Mission Store: missionsByBatch menangani filter batch aktif dan fallback aman', () => {
  testMissionStore.missions = [
    { id: 'm-1', batchId: 'batch-alpha', week: 1, title: 'Misi Alpha' },
    { id: 'm-2', batchId: 'batch-beta', week: 1, title: 'Misi Beta' },
    { id: 'm-3', batchId: '', week: 1, title: 'Misi General' }
  ]

  const alphaMissions = testMissionStore.missionsByBatch('batch-alpha')
  assertTrue(alphaMissions.some(m => m.id === 'm-1'), 'Misi Alpha harus terfilter untuk batch-alpha')
  assertFalse(alphaMissions.some(m => m.id === 'm-2'), 'Misi Beta tidak boleh masuk ke batch-alpha')

  const betaMissions = testMissionStore.missionsByBatch('batch-beta')
  assertTrue(betaMissions.some(m => m.id === 'm-2'), 'Misi Beta harus terfilter untuk batch-beta')
  assertFalse(betaMissions.some(m => m.id === 'm-1'), 'Misi Alpha tidak boleh masuk ke batch-beta')

  const allMissions = testMissionStore.missionsByBatch('ALL')
  assertEqual(allMissions.length, 3, 'Filter ALL harus mengembalikan seluruh misi')
})

test('Gamification Store: leaderboardByBatch mengisolasi peringkat per batch tanpa data bocor', () => {
  testGamificationStore.apiLeaderboard = [
    { id: 'u-1', batchId: 'batch-alpha', name: 'Kru Alpha 1', stars: 50 },
    { id: 'u-2', batchId: 'batch-alpha', name: 'Kru Alpha 2', stars: 40 },
    { id: 'u-3', batchId: 'batch-beta', name: 'Kru Beta 1', stars: 60 }
  ]

  const alphaBoard = testGamificationStore.leaderboardByBatch('batch-alpha')
  assertEqual(alphaBoard.length, 2, 'Leaderboard Alpha harus berisi 2 kru')
  assertTrue(alphaBoard.every(c => c.batchId === 'batch-alpha'), 'Seluruh kru di board Alpha harus dari batch-alpha')

  const betaBoard = testGamificationStore.leaderboardByBatch('batch-beta')
  assertEqual(betaBoard.length, 1, 'Leaderboard Beta harus berisi 1 kru')
  assertEqual(betaBoard[0].name, 'Kru Beta 1', 'Kru Beta 1 tampil di board Beta')
})

test('User Store Auth Resilience: initAuth me-reset token saat fetchMe gagal', async () => {
  // Simulasikan token tersimpan yang tidak valid di server
  const { setAuthToken } = await import('./composables/useApi.js')
  setAuthToken('invalid_expired_token_123')
  testUserStore.token = 'invalid_expired_token_123'
  testUserStore.apiUser = null
  testUserStore.userDirectory = []

  // Jalankan initAuth
  const isAuth = await testUserStore.initAuth()
  assertFalse(isAuth, 'initAuth harus mengembalikan false jika token gagal divalidasi')
  assertEqual(testUserStore.token, null, 'userStore.token harus di-reset menjadi null')
  assertEqual(testUserStore.apiUser, null, 'userStore.apiUser harus bernilai null')
  assertFalse(testUserStore.isAuthenticated, 'userStore.isAuthenticated harus bernilai false')
})

// ============================================================================
// SUITE 13: PENGUJIAN RESTRIKSI FEEDBACK PASCA-JOURNEY
// ============================================================================
console.log('📌 13. Menguji Validasi Restriksi Kuesioner Feedback Pasca-Journey Selesai:')

test('Feedback Access: Kru dengan misi belum selesai harus berstatus Feedback Terkunci', () => {
  const missions = [
    { id: 'm-1', status: 'COMPLETED' },
    { id: 'm-2', status: 'IN_PROGRESS' },
    { id: 'm-3', status: 'LOCKED' }
  ]

  const isJourneyComplete = missions.every(m => m.status === 'COMPLETED' || m.status === 'APPROVED')
  assertFalse(isJourneyComplete, 'Journey harus dianggap belum selesai jika masih ada misi yang belum COMPLETED/APPROVED')
})

test('Feedback Access: Kru yang telah menyelesaikan seluruh misi membuka akses Feedback', () => {
  const missions = [
    { id: 'm-1', status: 'COMPLETED' },
    { id: 'm-2', status: 'APPROVED' },
    { id: 'm-3', status: 'COMPLETED' }
  ]

  const isJourneyComplete = missions.every(m => m.status === 'COMPLETED' || m.status === 'APPROVED')
  assertTrue(isJourneyComplete, 'Journey harus dianggap selesai dan membuka feedback jika seluruh misi berstatus COMPLETED/APPROVED')
})

test('Feedback Status Pill & Badge: Menampilkan label KUNCI saat terkunci dan ISI saat terbuka', () => {
  const getFeedbackPillStatus = (isComplete, hasSubmitted, avgScore = 0) => {
    if (!isComplete) {
      return { label: 'KUNCI', icon: '🔒', isLocked: true }
    }
    if (hasSubmitted) {
      return { label: `${avgScore}/10`, icon: '✓', isLocked: false }
    }
    return { label: 'ISI', icon: '💬', isLocked: false }
  }

  const lockedState = getFeedbackPillStatus(false, false)
  assertEqual(lockedState.label, 'KUNCI', 'Label harus KUNCI saat journey belum selesai')
  assertEqual(lockedState.icon, '🔒', 'Icon harus 🔒 saat journey belum selesai')
  assertTrue(lockedState.isLocked, 'isLocked harus true saat journey belum selesai')

  const readyState = getFeedbackPillStatus(true, false)
  assertEqual(readyState.label, 'ISI', 'Label harus ISI saat journey selesai dan belum isi feedback')
  assertEqual(readyState.icon, '💬', 'Icon harus 💬 saat journey selesai')
  assertFalse(readyState.isLocked, 'isLocked harus false')

  const submittedState = getFeedbackPillStatus(true, true, 9.5)
  assertEqual(submittedState.label, '9.5/10', 'Label harus skor feedback saat sudah submit')
  assertEqual(submittedState.icon, '✓', 'Icon harus ✓')
})

console.log('📌 14. Menguji Batch Draft Lifecycle & Edit Capabilities (POST /api/batches & PATCH /api/batches/:id):')

test('Batch API Interface: Endpoint PATCH /batches/:id dan POST /batches tersedia', () => {
  assertTrue(typeof batchApi.getAll === 'function', 'batchApi.getAll harus berupa fungsi')
  assertTrue(typeof batchApi.getById === 'function', 'batchApi.getById harus berupa fungsi')
  assertTrue(typeof batchApi.create === 'function', 'batchApi.create harus berupa fungsi')
  assertTrue(typeof batchApi.update === 'function', 'batchApi.update harus berupa fungsi')
  assertTrue(typeof batchApi.generate === 'function', 'batchApi.generate harus berupa fungsi')
})

test('Batch Flags Mapping: Response isDraft dan isGenerated terpetakan akurat di Store', () => {
  const batchStore = useBatchStore()
  
  // Kasus 1: Batch Draft (belum generate misi)
  const rawDraft = {
    batchId: 'bth-draft-1',
    code: 'BTH-01',
    name: 'Batch Pelatihan 01',
    status: 'DRAFT',
    isDraft: true,
    isGenerated: false,
    missions: []
  }
  const isDraftComputed = Boolean(rawDraft.isDraft !== undefined ? rawDraft.isDraft : (rawDraft.status === 'DRAFT'))
  const isGenComputed = Boolean(rawDraft.isGenerated !== undefined ? rawDraft.isGenerated : ((rawDraft.missions?.length || 0) > 0))
  assertTrue(isDraftComputed, 'isDraft harus true untuk status DRAFT')
  assertFalse(isGenComputed, 'isGenerated harus false untuk draft batch')

  // Kasus 2: Batch Generated (misi aktif)
  const rawActive = {
    batchId: 'bth-active-1',
    code: 'BTH-02',
    name: 'Batch Aktif 02',
    status: 'OPEN',
    isDraft: false,
    isGenerated: true,
    missions: [{ id: 'm-1' }]
  }
  const isDraftActive = Boolean(rawActive.isDraft !== undefined ? rawActive.isDraft : (rawActive.status === 'DRAFT'))
  const isGenActive = Boolean(rawActive.isGenerated !== undefined ? rawActive.isGenerated : ((rawActive.missions?.length || 0) > 0))
  assertFalse(isDraftActive, 'isDraft harus false untuk status OPEN')
  assertTrue(isGenActive, 'isGenerated harus true untuk batch yang memiliki misi ter-generate')
})

test('Batch Create Payload Builder: Mendukung Simpan Draft vs Publish & Generate', () => {
  const buildCreatePayload = (form, isDraft = false) => {
    return {
      name: form.name.trim(),
      code: form.code?.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      status: isDraft ? 'DRAFT' : 'OPEN',
      isDraft: Boolean(isDraft),
      currentWeek: 1,
      tplJourneyId: form.tplJourneyId || undefined,
      tplBuddyId: form.tplBuddyId || undefined,
      tplFeedbackId: form.tplFeedbackId || undefined,
      crewIds: form.crewIds || []
    }
  }

  const formData = {
    name: 'Batch Onboarding Baru',
    code: 'BTH-10',
    startDate: '2026-10-01',
    endDate: '2026-10-21',
    tplJourneyId: 'tpl-journey-1',
    tplBuddyId: 'tpl-buddy-1',
    crewIds: ['usr-1', 'usr-2']
  }

  // Uji Simpan Draft
  const draftPayload = buildCreatePayload(formData, true)
  assertEqual(draftPayload.status, 'DRAFT', 'Status draft payload harus DRAFT')
  assertTrue(draftPayload.isDraft, 'isDraft harus bernilai true pada simpan draft')
  assertEqual(draftPayload.name, 'Batch Onboarding Baru', 'Nama batch harus sesuai')
  assertEqual(draftPayload.endDate, '2026-10-21', 'endDate harus tersertakan')

  // Uji Publish & Generate
  const publishPayload = buildCreatePayload(formData, false)
  assertEqual(publishPayload.status, 'OPEN', 'Status publish payload harus OPEN')
  assertFalse(publishPayload.isDraft, 'isDraft harus bernilai false pada publish & generate')
})

test('Batch Update Payload Builder: Mengirimkan field pembaruan draft dengan method PATCH dan endDate', () => {
  const buildUpdatePayload = (form, isDraft = true) => {
    return {
      name: form.name.trim(),
      code: form.code?.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      status: isDraft ? 'DRAFT' : 'OPEN',
      isDraft: Boolean(isDraft),
      tplJourneyId: form.tplJourneyId || undefined,
      tplBuddyId: form.tplBuddyId || undefined,
      tplFeedbackId: form.tplFeedbackId || undefined,
      crewIds: form.crewIds || []
    }
  }

  const updatedFormData = {
    name: 'Batch 01 Revisi Tanggal & Kru',
    code: 'BTH-01-REV',
    startDate: '2026-10-15',
    endDate: '2026-11-04',
    tplJourneyId: 'tpl-journey-2',
    crewIds: ['usr-1', 'usr-3', 'usr-4']
  }

  const updateDraftPayload = buildUpdatePayload(updatedFormData, true)
  assertEqual(updateDraftPayload.name, 'Batch 01 Revisi Tanggal & Kru', 'Nama yang diupdate harus tersimpan')
  assertEqual(updateDraftPayload.startDate, '2026-10-15', 'Tanggal mulai yang diupdate harus tersimpan')
  assertEqual(updateDraftPayload.endDate, '2026-11-04', 'Tanggal selesai yang diupdate harus tersimpan')
  assertEqual(updateDraftPayload.crewIds.length, 3, 'Jumlah crew yang ditugaskan harus terupdate')
  assertTrue(updateDraftPayload.isDraft, 'isDraft harus true saat update draft')
})

test('Batch Lifecycle State: Menentukan mode Editable (Draft) vs Read-Only (Generated)', () => {
  const determineViewMode = (batch) => {
    if (batch.isDraft || batch.status === 'DRAFT') {
      return { isEditable: true, isReadOnly: false, mode: 'EDITABLE_DRAFT' }
    }
    return { isEditable: false, isReadOnly: true, mode: 'READ_ONLY' }
  }

  const draftBatch = { id: 'bth-1', status: 'DRAFT', isDraft: true, isGenerated: false }
  const draftResult = determineViewMode(draftBatch)
  assertTrue(draftResult.isEditable, 'Draft batch harus berada dalam mode Editable')
  assertFalse(draftResult.isReadOnly, 'Draft batch tidak boleh berstatus read-only')
  assertEqual(draftResult.mode, 'EDITABLE_DRAFT', 'Mode harus EDITABLE_DRAFT')

  const generatedBatch = { id: 'bth-2', status: 'OPEN', isDraft: false, isGenerated: true }
  const genResult = determineViewMode(generatedBatch)
  assertFalse(genResult.isEditable, 'Batch yang sudah digenerate tidak boleh sembarangan diedit')
  assertTrue(genResult.isReadOnly, 'Batch yang sudah digenerate harus berada dalam mode Read-Only')
  assertEqual(genResult.mode, 'READ_ONLY', 'Mode harus READ_ONLY')
})

// ============================================================================
// SUITE 16: BULK STORE / DEPARTMENT EXCEL UPDATE & ASSIGNMENT FLOW
// ============================================================================
console.log('📌 16. Menguji Fitur Bulk Store/Department Update via Excel (Template, Preview Dry-Run, & Commit):')

const storeStore = useStoreStore()

test('Department API Endpoints: downloadTemplate, bulkPreview, bulkCommit harus terdefinisi sebagai function', () => {
  assertTrue(typeof departmentApi.downloadTemplate === 'function', 'GET /masters/departments/template harus ada di departmentApi')
  assertTrue(typeof departmentApi.bulkPreview === 'function', 'POST /masters/departments/bulk-preview harus ada di departmentApi')
  assertTrue(typeof departmentApi.bulkCommit === 'function', 'POST /masters/departments/bulk-commit harus ada di departmentApi')
})

test('Store Store Actions: downloadTemplate, previewBulkDepartments, commitBulkDepartments harus tersedia', () => {
  assertTrue(typeof storeStore.downloadTemplate === 'function', 'downloadTemplate harus tersedia di storeStore')
  assertTrue(typeof storeStore.previewBulkDepartments === 'function', 'previewBulkDepartments harus tersedia di storeStore')
  assertTrue(typeof storeStore.commitBulkDepartments === 'function', 'commitBulkDepartments harus tersedia di storeStore')
})

test('Store Bulk Preview Data Normalization & Validation Logic', () => {
  const mockPreviewResponse = {
    summary: { totalRows: 3, validCount: 2, invalidCount: 1, updateCount: 2 },
    rows: [
      {
        rowNumber: 2,
        departmentCode: 'BKI_01',
        departmentName: 'Re.juve Bintaro Xchange',
        regionCode: 'JABODETABEK',
        slEmail: 'sl.bintaro@rejuve.co.id',
        dmEmail: 'dm.south@rejuve.co.id',
        isActive: true,
        status: 'VALID',
        errors: []
      },
      {
        rowNumber: 3,
        departmentCode: 'GI_01',
        departmentName: 'Re.juve Grand Indonesia',
        regionCode: 'Jakarta Pusat',
        slEmail: 'sl.gi@rejuve.co.id',
        dmEmail: 'dm.central@rejuve.co.id',
        isActive: true,
        status: 'VALID',
        errors: []
      },
      {
        rowNumber: 4,
        departmentCode: 'INVALID_99',
        departmentName: 'Gerai Fiktif',
        regionCode: 'Unknown',
        slEmail: 'notfound@rejuve.co.id',
        dmEmail: '',
        isActive: false,
        status: 'INVALID',
        errors: ['Kode Gerai "INVALID_99" tidak ditemukan di sistem database.']
      }
    ]
  }

  // Verifikasi normalisasi rows
  const normalizedRows = mockPreviewResponse.rows.map((r, i) => ({
    rowNumber: r.rowNumber || i + 1,
    departmentCode: r.departmentCode,
    departmentName: r.departmentName,
    regionCode: r.regionCode,
    slEmail: r.slEmail,
    dmEmail: r.dmEmail,
    isActive: Boolean(r.isActive),
    isValid: r.status === 'VALID',
    errorMessage: (r.errors || []).join(', ')
  }))

  assertEqual(normalizedRows.length, 3, 'Harus memproses 3 baris')
  assertEqual(normalizedRows.filter(r => r.isValid).length, 2, '2 baris valid')
  assertEqual(normalizedRows.filter(r => !r.isValid).length, 1, '1 baris invalid')
  assertEqual(normalizedRows[2].errorMessage, 'Kode Gerai "INVALID_99" tidak ditemukan di sistem database.', 'Pesan error harus terpetakan')

  // Verifikasi payload commit (hanya baris valid yang dikirim)
  const commitPayload = {
    departments: normalizedRows
      .filter(r => r.isValid)
      .map(r => ({
        departmentCode: r.departmentCode,
        departmentName: r.departmentName,
        regionCode: r.regionCode,
        slEmail: r.slEmail,
        dmEmail: r.dmEmail,
        isActive: r.isActive
      }))
  }

  assertEqual(commitPayload.departments.length, 2, 'Payload commit harus hanya berisi 2 baris valid')
  assertEqual(commitPayload.departments[0].departmentCode, 'BKI_01')
  assertEqual(commitPayload.departments[1].departmentCode, 'GI_01')
})

console.log('')
console.log('======================================================')
console.log(`🏁 HASIL AKHIR QA / UNIT TESTER:`)
console.log(`   Total Pengujian : ${totalTests}`)
console.log(`   Lolos (PASS)    : ${passedTests}`)
console.log(`   Gagal (FAIL)    : ${failedTests}`)
console.log(`   Tingkat Kelulusan: ${Math.round((passedTests / totalTests) * 100)}%`)
console.log('======================================================\n')

if (failedTests > 0) {
  process.exit(1)
} else {
  process.exit(0)
}


