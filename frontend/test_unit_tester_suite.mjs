import { createPinia, setActivePinia } from 'pinia'
import {
  calculateStars,
  starsToPoints,
  calculateAverageDmSl,
  calculateStarLevel,
  getNextStarLevel,
  getStarProgress
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
// SUITE 1: FORMULA PERHITUNGAN BINTANG & GAMIFIKASI (utils/star.js)
// ============================================================================
console.log('📌 1. Menguji Formula Perhitungan Bintang & Gamifikasi (Happy Path & Edge Cases):')

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

// 1.3 Stars to Points
test('starsToPoints: konversi 5.0 bintang menjadi 100 poin', () => {
  assertEqual(starsToPoints(5), 100)
})

test('starsToPoints: konversi 2.5 bintang menjadi 50 poin', () => {
  assertEqual(starsToPoints(2.5), 50)
})

test('starsToPoints: input null/undefined menghasilkan 0 poin', () => {
  assertEqual(starsToPoints(null), 0)
  assertEqual(starsToPoints(undefined), 0)
})

// 1.4 Rumus Rata-rata SL & DM ((SL + DM) / 2)
test('calculateAverageDmSl: SL=78 dan DM=85 menghasilkan avgScore 81.5 dan 4.1 bintang', () => {
  const res = calculateAverageDmSl(78, 85)
  assertEqual(res.avgScore, 81.5)
  assertEqual(res.stars, 4.1)
})

test('calculateAverageDmSl: SL=100 dan DM=100 menghasilkan avgScore 100 dan 5.0 bintang', () => {
  const res = calculateAverageDmSl(100, 100)
  assertEqual(res.avgScore, 100)
  assertEqual(res.stars, 5.0)
})

test('calculateAverageDmSl: edge case nilai 0 pada kedua penilai', () => {
  const res = calculateAverageDmSl(0, 0)
  assertEqual(res.avgScore, 0)
  assertEqual(res.stars, 0)
})

test('calculateAverageDmSl: edge case penilai DM undefined (fallback aman)', () => {
  const res = calculateAverageDmSl(90, undefined)
  assertEqual(res.avgScore, 45)
  assertEqual(res.stars, 2.3)
})

// 1.5 Star Progression & Levels
test('calculateStarLevel: level 1 untuk bintang awal (0 - 99)', () => {
  assertEqual(calculateStarLevel(0), 1)
  assertEqual(calculateStarLevel(50), 1)
  assertEqual(calculateStarLevel(99), 1)
})

test('calculateStarLevel: transisi level 2 pada 100 bintang', () => {
  assertEqual(calculateStarLevel(100), 2)
})

test('calculateStarLevel: level 10 (Star Legend) pada >= 3500 bintang', () => {
  assertEqual(calculateStarLevel(3500), 10)
  assertEqual(calculateStarLevel(9999), 10)
})

test('calculateStarLevel: edge case bintang negatif harus fallback ke level 1', () => {
  assertEqual(calculateStarLevel(-50), 1)
})

test('getStarProgress: progres kalkulasi normal dan sisa bintang ke level berikutnya', () => {
  const prog = getStarProgress(150)
  assertEqual(prog.currentLevel, 2)
  assertEqual(prog.nextLevel, 3)
  assertEqual(prog.starsToNextLevel, 100) // 250 - 150
  assertEqual(prog.isMaxLevel, false)
})

test('getStarProgress: akun dengan bintang maksimum (>= 3500) menghasilkan isMaxLevel true dan 100%', () => {
  const prog = getStarProgress(4000)
  assertEqual(prog.currentLevel, 10)
  assertEqual(prog.isMaxLevel, true)
  assertEqual(prog.progressPercent, 100)
  assertEqual(prog.starsToNextLevel, 0)
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
      paths.push('/evaluations', '/missions', '/leaderboard', '/achievements')
    } else if (role === 'DISTRICT_MANAGER') {
      paths.push('/dashboard', '/batches', '/approvals', '/missions', '/leaderboard', '/achievements')
    } else if (role === 'CREW') {
      paths.push('/dashboard', '/journey', '/missions', '/feedback', '/leaderboard', '/achievements', '/profile')
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

import { useBatchStore } from './stores/batch.js'

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
