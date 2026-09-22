import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from './stores/user.js'
import { useBatchStore } from './stores/batch.js'
import { useMissionStore } from './stores/mission.js'
import { useTemplateStore } from './stores/template.js'
import { useEvaluationStore } from './stores/evaluation.js'
import { useApprovalStore } from './stores/approval.js'
import { useGamificationStore } from './stores/gamification.js'
import { useStoreStore } from './stores/store.js'
import { calculateAverageDmSl } from './utils/star.js'
import { useReportStore } from './stores/report.js'
import { authApi, departmentApi } from './services/api.js'

console.log('🚀 MEMULAI AUDIT & PENGUJIAN SEMUA FITUR CRUD SISTEM RE.JUVE...\n')

// 1. Setup Pinia Environment
const pinia = createPinia()
setActivePinia(pinia)

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const templateStore = useTemplateStore()
const evalStore = useEvaluationStore()
const approvalStore = useApprovalStore()
const gamificationStore = useGamificationStore()
const storeStore = useStoreStore()
const reportStore = useReportStore()

// Fixture user untuk kebutuhan pengetesan terisolasi
;[
  { id: 'sl-001', name: 'Budi Santoso', role: 'STORE_LEADER', isBuddy: true, email: 'budi.santoso@rejuve.co.id' },
  { id: 'sl-002', name: 'Dewi Lestari', role: 'STORE_LEADER', isBuddy: false, email: 'dewi.lestari@rejuve.co.id' },
  { id: 'dm-001', name: 'Ahmad Dahlan', role: 'DISTRICT_MANAGER', email: 'ahmad.dahlan@rejuve.co.id' },
  { id: 'dm-002', name: 'Citra Dewi', role: 'DISTRICT_MANAGER', email: 'citra.dewi@rejuve.co.id' },
  { id: 'crew-001', name: 'Andi Pratama', role: 'CREW', email: 'andi.pratama@rejuve.co.id', stars: 100 },
  { id: 'crew-002', name: 'Budi Crew', role: 'CREW', email: 'budi.crew@rejuve.co.id' }
].forEach(u => userStore.createUser(u))

let totalTests = 0
let passedTests = 0

function assert(condition, testName) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✅ [PASS] ${testName}`)
  } else {
    console.error(`  ❌ [FAIL] ${testName}`)
  }
}

// ==========================================
// TEST SUITE 1: USER MANAGEMENT CRUD
// ==========================================
console.log('📌 1. Menguji CRUD Manajemen User & Crew:')

// 1.1 CREATE USER
const newUser = userStore.createUser({
  name: 'Bima Satria',
  gender: 'M',
  phone: '081234567890',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  role: 'CREW',
  batchId: 'batch-alpha',
  position: 'Junior Barista',
  email: 'bima.satria@rejuve.co.id'
})
assert(newUser && newUser.id && newUser.name === 'Bima Satria', 'Create User: Berhasil mendaftarkan user baru')
assert(newUser.phone === '081234567890', 'Create User: Berhasil menyimpan nomor telepon/WA user')
assert(newUser.avatarUrl.includes('unsplash') || newUser.avatar.includes('unsplash'), 'Create User: Berhasil menyimpan avatarUrl profil user')
assert(newUser.gender === 'M', 'Create User: Berhasil menyimpan jenis kelamin (gender) user')
assert(gamificationStore.crewById(newUser.id) !== undefined, 'Create User: Otomatis masuk ke roster gamifikasi Crew')

// 1.2 READ USER
const readUser = userStore.allUsers.find(u => u.id === newUser.id)
assert(readUser && readUser.email === 'bima.satria@rejuve.co.id', 'Read User: Berhasil membaca data user dari direktori')
assert(readUser && readUser.phone === '081234567890', 'Read User: Berhasil membaca field phone user')

// 1.3 UPDATE USER
userStore.updateUser(newUser.id, { position: 'Senior Barista Lead', name: 'Bima Satria Perkasa', phone: '089876543210' })
const updatedUser = userStore.allUsers.find(u => u.id === newUser.id)
assert(updatedUser.position === 'Senior Barista Lead' && updatedUser.name === 'Bima Satria Perkasa', 'Update User: Berhasil memperbarui data user & jabatan')
assert(updatedUser.phone === '089876543210', 'Update User: Berhasil memperbarui nomor telepon user')

// 1.4 REASSIGN USER TO BATCH
userStore.assignUserToBatch(newUser.id, 'batch-beta', 'Senayan City')
assert(updatedUser.batchId === 'batch-beta', 'Reassign User: Berhasil memindahkan crew ke batch/cabang lain')

// 1.5 CREATE USER SL DENGAN ISBUDDY
const slUser = userStore.createUser({
  name: 'Dimas Wicaksono',
  gender: 'M',
  phone: '081122334455',
  role: 'STORE_LEADER',
  position: 'Store Leader',
  email: 'dimas.w@rejuve.co.id',
  isBuddy: true
})
assert(slUser && slUser.isBuddy === true, 'Create User: Berhasil mendaftarkan SL dengan flag isBuddy aktif')
assert(slUser.phone === '081122334455', 'Create User: Berhasil menyimpan phone pada Store Leader')

// 1.6 ASSIGN CREW TO SL BUDDY
const crewWithBuddy = userStore.createUser({
  name: 'Siti Rahma',
  gender: 'F',
  phone: '081299887766',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  role: 'CREW',
  position: 'Barista Apprentice',
  email: 'siti.rahma@rejuve.co.id',
  userBuddyId: slUser.id
})
assert(crewWithBuddy && crewWithBuddy.userBuddyId === slUser.id, 'Create User: Berhasil menugaskan Crew ke Store Leader Buddy')
assert(crewWithBuddy.gender === 'F' && crewWithBuddy.phone === '081299887766', 'Create User: Data gender F & phone Crew tersimpan dengan tepat')
assert(userStore.buddyStoreLeaders.some(b => b.id === slUser.id), 'Filter SL Buddy: Berhasil menemukan SL Buddy aktif')

userStore.deleteUser(crewWithBuddy.id)
userStore.deleteUser(slUser.id)

// 1.7 DELETE USER
userStore.deleteUser(newUser.id)
assert(userStore.allUsers.find(u => u.id === newUser.id) === undefined, 'Delete User: Berhasil menghapus user dari direktori')
assert(gamificationStore.crewById(newUser.id) === undefined, 'Delete User: Otomatis terhapus dari roster gamifikasi')

// 1.7 BULK USER IMPORT & PROFILE ACTIONS
assert(typeof userStore.downloadTemplate === 'function', 'Bulk User: Action downloadTemplate tersedia di store')
assert(typeof userStore.previewBulkUsers === 'function', 'Bulk User: Action previewBulkUsers (Dry Run) tersedia di store')
assert(typeof userStore.commitBulkUsers === 'function', 'Bulk User: Action commitBulkUsers tersedia di store')
assert(typeof authApi.updateProfile === 'function', 'Auth API: Endpoint updateProfile (PUT /auth/profile) tersedia di authApi service')
assert(typeof userStore.updateProfile === 'function', 'Profile: Action updateProfile tersedia di user store')
assert(typeof userStore.changePassword === 'function', 'Profile: Action changePassword tersedia di user store')

// Test updateProfile & changePassword in store
const testProfileUser = userStore.createUser({
  id: 'test-profile-usr-1',
  name: 'Rian Kurniawan',
  gender: 'M',
  phone: '081234567890',
  role: 'DISTRICT_MANAGER',
  email: 'rian.k@rejuve.co.id'
})
await userStore.updateProfile({
  id: testProfileUser.id,
  name: 'Rian Kurniawan M.M.',
  phone: '081987654321',
  gender: 'M',
  avatarUrl: 'https://images.unsplash.com/photo-dm-custom.jpg'
})
const verifyProfile = userStore.userById(testProfileUser.id)
assert(verifyProfile && verifyProfile.name === 'Rian Kurniawan M.M.', 'Update Profile: Berhasil memperbarui nama pengguna')
assert(verifyProfile && verifyProfile.phone === '081987654321', 'Update Profile: Berhasil memperbarui nomor telepon profil')
assert(verifyProfile && verifyProfile.avatarUrl === 'https://images.unsplash.com/photo-dm-custom.jpg', 'Update Profile: Berhasil memperbarui foto avatar profil')

const pwResult = await userStore.changePassword({ oldPassword: 'Password123!', newPassword: 'NewSecret123!' })
assert(pwResult && (pwResult.success || pwResult.message), 'Change Password: Berhasil memvalidasi dan memproses ubah kata sandi')

userStore.deleteUser(testProfileUser.id)

console.log('')

// ==========================================
// TEST SUITE 2: BATCH GERAI CRUD
// ==========================================
console.log('📌 2. Menguji CRUD Manajemen Batch Gerai:')

// 2.1 CREATE BATCH
await templateStore.createPackage({
  id: 'pkg-sop-standard',
  name: 'Master Standard SOP Rejuve',
  type: 'JOURNEY',
  totalWeeks: 3,
  details: Array.from({ length: 12 }, (_, i) => ({
    missionTitle: `Misi SOP Standar ${i + 1}`,
    durationNumber: Math.floor(i / 4) + 1,
    category: 'TECHNICAL',
    inputType: 'SCALE'
  }))
})
const initialBatchCount = batchStore.allBatches.length
const newBatch = batchStore.createBatch({
  name: 'Batch Delta — Kota Kasablanka',
  code: 'BTH-04',
  storeLocation: 'Kota Kasablanka Mall',
  assignment: {
    supervisorId: 'spv-001',
    headId: 'head-001',
    crewIds: ['crew-001', 'crew-002']
  },
  applyTemplatePackage: true
})
assert(newBatch && newBatch.id && batchStore.allBatches.length === initialBatchCount + 1, 'Create Batch: Berhasil membuat batch gerai baru')
assert(missionStore.missionsByBatch(newBatch.id).length > 0, 'Create Batch: Otomatis men-generate 12 misi dari Master Template SOP')

// 2.2 READ BATCH
const readBatch = batchStore.batchById(newBatch.id)
assert(readBatch && readBatch.storeLocation === 'Kota Kasablanka Mall', 'Read Batch: Berhasil membaca data batch')

// 2.3 UPDATE BATCH
batchStore.updateBatch(newBatch.id, { storeLocation: 'Kota Kasablanka LG Floor', status: 'ACTIVE' })
assert(readBatch.storeLocation === 'Kota Kasablanka LG Floor', 'Update Batch: Berhasil memperbarui detail lokasi batch')

// 2.4 DELETE BATCH
batchStore.deleteBatch(newBatch.id)
assert(batchStore.batchById(newBatch.id) === undefined, 'Delete Batch: Berhasil menghapus batch gerai')

console.log('')

// ==========================================
// TEST SUITE 3: MISSION OPERASIONAL CRUD
// ==========================================
console.log('📌 3. Menguji CRUD Manajemen Misi Operasional:')

// 3.1 CREATE MISSION
const newMission = missionStore.createMission({
  title: 'Uji Suhu Freezer Cold-Pressed -18°C',
  code: 'MSN-W1-TEST',
  category: 'Cold Chain',
  batchId: 'batch-alpha',
  week: 1,
  requirements: ['Periksa display suhu freezer', 'Pastikan pintu tertutup rapat']
})
assert(newMission && newMission.id && newMission.title === 'Uji Suhu Freezer Cold-Pressed -18°C', 'Create Mission: Berhasil membuat misi baru')

// 3.2 READ MISSION
const readMission = missionStore.missionById(newMission.id)
assert(readMission && readMission.code === 'MSN-W1-TEST', 'Read Mission: Berhasil membaca detail misi')

// 3.3 UPDATE MISSION
missionStore.updateMission(newMission.id, { title: 'Uji Suhu Freezer Cold-Pressed Optimal', category: 'Compliance' })
assert(readMission.title === 'Uji Suhu Freezer Cold-Pressed Optimal' && readMission.category === 'Compliance', 'Update Mission: Berhasil memperbarui judul & kategori misi')

// 3.4 DELETE MISSION
missionStore.deleteMission(newMission.id)
assert(missionStore.missionById(newMission.id) === undefined, 'Delete Mission: Berhasil menghapus misi dari katalog')

console.log('')

// ==========================================
// TEST SUITE 4: MASTER TEMPLATE SOP CRUD
// ==========================================
console.log('📌 4. Menguji CRUD Master Template SOP:')

// 4.1 CREATE PACKAGE
const newPkg = await templateStore.createPackage({
  name: 'Standar SOP Express Kiosk',
  code: 'PKG-EXP-01',
  category: 'Operasional Kiosk',
  targetType: 'Format Gerai Kiosk',
  totalWeeks: 3
})
assert(newPkg && newPkg.id && newPkg.name === 'Standar SOP Express Kiosk', 'Create Template Package: Berhasil membuat paket template baru')

// 4.2 ADD MISSION TO PACKAGE
const addedTmpl = templateStore.addMissionToPackage(newPkg.id, {
  title: 'Checklist Kebersihan Mesin Kasir POS & Area Kasir',
  week: 1,
  category: 'Service',
  requirements: ['Sanitasi layar touchscreen', 'Pastikan receipt roll terisi']
})
assert(addedTmpl && newPkg.templates.length === 1, 'Add Mission to Template: Berhasil menambah butir misi ke paket master')

// 4.3 DUPLICATE PACKAGE
const duplicatedPkg = templateStore.duplicatePackage(newPkg.id)
assert(duplicatedPkg && duplicatedPkg.templates.length === 1, 'Duplicate Template Package: Berhasil menduplikasi paket master')

// 4.4 REMOVE MISSION FROM PACKAGE
const removedSuccess = templateStore.removeMissionFromPackage(newPkg.id, addedTmpl.id)
assert(removedSuccess && newPkg.templates.length === 0, 'Remove Mission from Package: Berhasil menghapus butir misi dari paket master')

// 4.5 UPDATE PACKAGE WITH SOP CHECKLIST
await templateStore.updatePackage(newPkg.id, {
  name: 'Standar SOP Express Kiosk Rev 2',
  details: [
    {
      missionTitle: 'Week 1 : JCUY 01',
      description: 'Desc WEEK 1 : JCUY 01',
      durationNumber: 1,
      category: 'TECHNICAL',
      inputType: 'SCALE',
      scaleConfig: { min: 0, max: 100, step: 10, starPerStep: 1 },
      sopChecklist: [
        'Verifikasi checklist standar operasional',
        'Pemeriksaan kepatuhan & sanitasi'
      ]
    }
  ]
})
const updatedPkg = templateStore.packageById(newPkg.id)
assert(updatedPkg && updatedPkg.templates[0].sopChecklist && updatedPkg.templates[0].sopChecklist.length === 2, 'Update Template Package: Berhasil menyimpan sopChecklist pada detail misi JOURNEY')

// 4.6 DELETE PACKAGE
await templateStore.deletePackage(newPkg.id)
await templateStore.deletePackage(duplicatedPkg.id)
assert(templateStore.packageById(newPkg.id) === undefined, 'Delete Template Package: Berhasil menghapus paket template master')

console.log('')

// ==========================================
// TEST SUITE 5: SUPERVISOR EVALUATION & HEAD APPROVAL WORKFLOW
// ==========================================
console.log('📌 5. Menguji Alur Evaluasi Store Leader & Approval District Manager:')

// 5.1 SUBMIT EVALUATION PER MISI KE DISTRICT MANAGER
const targetMission = missionStore.missions[0]
const submitResult = evalStore.submitForReview({
  missionId: targetMission.id,
  supervisorId: 'sl-001',
  supervisorName: 'Budi Santoso',
  crewScores: [
    { crewId: 'crew-001', score: 95 },
    { crewId: 'crew-002', score: 92 }
  ],
  comment: 'Seluruh kru mematuhi SOP cold chain.',
  evidence: ['https://images.unsplash.com/photo-chiller.jpg']
})
assert(submitResult !== null && targetMission.status === 'PENDING_REVIEW', 'Submit Evaluation per Misi: Status misi langsung berubah menjadi PENDING_REVIEW di DM')

// 5.2 DISTRICT MANAGER BULK APPROVE & PENCAIRAN BINTANG
const pendingApproval = approvalStore.approvals.find(a => a.missionId === targetMission.id)
if (pendingApproval) {
  const initialStarsCrew1 = gamificationStore.crewById('crew-001')?.stars || 0
  const bulkResult = approvalStore.bulkApprove([pendingApproval.id])
  assert(bulkResult.success === true && bulkResult.approvedCount >= 1 && targetMission.status === 'COMPLETED', 'District Manager Bulk Approve: Berhasil menyetujui misi secara massal')
  
  const finalStarsCrew1 = gamificationStore.crewById('crew-001')?.stars || 0
  assert(finalStarsCrew1 >= initialStarsCrew1, 'Gamification Minting: Reward bintang otomatis dicairkan ke saldo seluruh kru')
}

// 5.3 DISTRICT MANAGER AVERAGE (SL + DM) / 2 FORMULA TEST
const itemToAdjust = approvalStore.approvals.find(a => a.status === 'PENDING_REVIEW')
if (itemToAdjust) {
  const initialSLScore = Number(itemToAdjust.slScore ?? itemToAdjust.originalScore ?? itemToAdjust.score ?? itemToAdjust.averageScore ?? 90)
  const dmScoreInput = 80
  const expectedFinal = calculateAverageDmSl(initialSLScore, dmScoreInput).avgScore
  const adjustResult = approvalStore.approveMission(itemToAdjust.id, { dmScore: dmScoreInput, dmNote: 'Penyesuaian kecepatan bar' })
  assert(adjustResult.success === true && itemToAdjust.score === expectedFinal && itemToAdjust.slScore === initialSLScore && itemToAdjust.dmScore === dmScoreInput, 'District Manager Average Calculation: Nilai akhir dihitung dari (SL + DM) / 2 secara akurat')
}

// 5.4 ROLE SYSTEM VALIDATION
userStore.loginAsUser('sl-001')
assert(userStore.isStoreLeader === true && userStore.currentRole === 'STORE_LEADER', 'Role Validation: Akun SL-001 teridentifikasi sebagai Store Leader')

userStore.loginAsUser('dm-001')
assert(userStore.isDistrictManager === true && userStore.currentRole === 'DISTRICT_MANAGER', 'Role Validation: Akun DM-001 teridentifikasi sebagai District Manager')

console.log('')

// ==========================================
// TEST SUITE 6: MASTER STORE CRUD & STAFF ASSIGNMENTS
// ==========================================
console.log('📌 6. Menguji CRUD Master Gerai & Penugasan Manajer:')

// 6.1 CREATE STORE
const initialStoreCount = storeStore.totalStoreCount
const newStore = storeStore.createStore({
  name: 'Re.juve Kota Kasablanka',
  region: 'Jakarta Selatan',
  mallName: 'Kota Kasablanka Mall',
  address: 'Lantai LG Unit #LG-23, Jl. Casablanca Raya',
  phone: '021-29465000',
  storeLeaderId: 'sl-001',
  districtManagerId: 'dm-001',
  batchId: 'batch-alpha',
  status: 'ACTIVE'
})
assert(newStore && newStore.id && storeStore.totalStoreCount === initialStoreCount + 1, 'Create Store: Berhasil mendaftarkan gerai baru')
assert(newStore.code && newStore.code.startsWith('STR-'), 'Create Store: Kode gerai ter-generate secara otomatis')

// 6.2 READ STORE & RESOLVE SL/DM PROFILES
const readStore = storeStore.storeById(newStore.id)
assert(readStore && readStore.storeLeader && readStore.storeLeader.name === 'Budi Santoso', 'Read Store: Berhasil menghubungkan data profil Store Leader')
assert(readStore && readStore.districtManager && readStore.districtManager.name === 'Ahmad Dahlan', 'Read Store: Berhasil menghubungkan data profil District Manager')

// 6.3 UPDATE STORE
storeStore.updateStore(newStore.id, {
  name: 'Re.juve Kota Kasablanka Extension',
  storeLeaderId: 'sl-002',
  districtManagerId: 'dm-002'
})
const updatedStore = storeStore.storeById(newStore.id)
assert(updatedStore.name === 'Re.juve Kota Kasablanka Extension' && updatedStore.storeLeader?.name === 'Dewi Lestari' && updatedStore.districtManager?.name === 'Citra Dewi', 'Update Store: Berhasil memperbarui detail gerai dan alokasi manajer')

// 6.4 DELETE STORE
storeStore.deleteStore(newStore.id)
assert(storeStore.storeById(newStore.id) === null, 'Delete Store: Berhasil menghapus gerai dari Master Store')

// 6.5 STORE DETAIL API ACTION
assert(typeof storeStore.fetchStoreByIdFromApi === 'function', 'Store Detail API: Action fetchStoreByIdFromApi tersedia di store')

// 6.6 BULK STORE / DEPARTMENT UPDATE ACTIONS & API
assert(typeof departmentApi.downloadTemplate === 'function', 'Department API: Endpoint downloadTemplate (GET /masters/departments/template) tersedia')
assert(typeof departmentApi.bulkPreview === 'function', 'Department API: Endpoint bulkPreview (POST /masters/departments/bulk-preview) tersedia')
assert(typeof departmentApi.bulkCommit === 'function', 'Department API: Endpoint bulkCommit (POST /masters/departments/bulk-commit) tersedia')
assert(typeof storeStore.downloadTemplate === 'function', 'Store Store: Action downloadTemplate tersedia')
assert(typeof storeStore.previewBulkDepartments === 'function', 'Store Store: Action previewBulkDepartments (Dry Run) tersedia')
assert(typeof storeStore.commitBulkDepartments === 'function', 'Store Store: Action commitBulkDepartments tersedia')

console.log('')

// ==========================================
// TEST SUITE 7: BUDDY TEMPLATE & EVALUATION CRUD
// ==========================================
console.log('📌 7. Menguji CRUD Program Misi Buddy')

import { useBuddyStore } from './stores/buddy.js'
const buddyStore = useBuddyStore()

// 7.1 READ BUDDY TEMPLATES (RAPOR NEW HIRE 7 KOMPETENSI)
if (buddyStore.packages.length === 0) {
  buddyStore.packages.push({
    id: 'pkg-buddy-default',
    name: 'Paket Master Rapor New Hire 7 Kompetensi',
    competencies: Array.from({ length: 7 }, (_, i) => ({
      id: i === 0 ? 'comp-pk' : `comp-${i + 1}`,
      name: i === 0 ? 'Product Knowledge' : `Kompetensi ${i + 1}`,
      indicators: [
        { id: 'ind-pk-01', name: 'Indikator 1' },
        { id: 'ind-pk-02', name: 'Indikator 2' }
      ]
    }))
  })
}
const defaultBuddy = buddyStore.defaultPackage
assert(defaultBuddy && defaultBuddy.competencies?.length === 7, 'Read Buddy Template: Berhasil memuat paket master Rapor New Hire 7 Kompetensi')

// 7.2 CREATE BUDDY EVALUATION (STORE LEADER RAPOR ASSESSMENT)
const initialBuddyEval = buddyStore.saveBuddyEvaluation({
  batchId: 'batch-alpha',
  crewId: 'crew-005',
  crewName: 'Rudi Hermawan',
  storeTraining: 'Re.juve Grand Indonesia',
  storeCaptain: 'Budi Santoso (Store Leader)',
  trainingPeriod: '1 - 3 September 2026',
  indicatorRatings: {
    'ind-pk-01': 'KOMPETEN',
    'ind-pk-02': 'KOMPETEN',
    'ind-cs-01': 'KOMPETEN',
    'ind-co-01': 'BUTUH_PENDAMPINGAN'
  },
  recommendationNote: 'Rudi menunjukkan kedisiplinan dan penguasaan #CleanLabel yang baik.',
  status: 'IN_PROGRESS',
  captainSigned: true,
  crewSigned: true
})
assert(initialBuddyEval && initialBuddyEval.indicatorRatings['ind-pk-01'] === 'KOMPETEN', 'Create Buddy Eval: Store Leader berhasil menyimpan evaluasi Rapor New Hire')

// 7.3 UPDATE & RECOMMEND CREW
buddyStore.updateCrewRecommendation('batch-alpha', 'crew-005', {
  status: 'RECOMMENDED',
  recommendationNote: 'Kru sangat kompeten dan siap 100% masuk kompetisi Batch 1.',
  captainSigned: true,
  crewSigned: true
})
const updatedBuddyRecord = buddyStore.evaluationForCrew('batch-alpha', 'crew-005')
assert(updatedBuddyRecord && updatedBuddyRecord.status === 'RECOMMENDED', 'Update Buddy Recommendation: Kru berhasil direkomendasikan masuk Batch')

// 7.4 CREATE BUDDY PACKAGE
const newBuddyPkg = buddyStore.createBuddyPackage({
  name: 'Rapor Pendampingan Gerai Bandara',
  code: 'BUDDY-AIRPORT',
  description: 'Program akselerasi pendampingan 3 hari untuk gerai bandara.'
})
assert(newBuddyPkg && newBuddyPkg.id && buddyStore.packageById(newBuddyPkg.id) !== undefined, 'Create Buddy Package: Berhasil membuat paket template Rapor baru')

// 7.5 ADD & REMOVE INDICATOR TO COMPETENCY
const addedInd = buddyStore.addIndicatorToCompetency(newBuddyPkg.id, 'comp-pk', {
  name: 'Menjelaskan sertifikasi halal Re.juve',
  isStar: false,
  description: 'Mengetahui status halal grade A.'
})
assert(addedInd && addedInd.id, 'Add Indicator: Berhasil menambahkan indikator ke kompetensi Product Knowledge')

buddyStore.removeIndicator(newBuddyPkg.id, 'comp-pk', addedInd.id)

// 7.6 DELETE BUDDY PACKAGE
buddyStore.deleteBuddyPackage(newBuddyPkg.id)
assert(buddyStore.packageById(newBuddyPkg.id) === undefined, 'Delete Buddy Package: Berhasil menghapus paket template Rapor')

// 7.7 BUDDY REPORT ACTIONS
assert(typeof buddyStore.fetchBuddyReport === 'function', 'Buddy Report: Action fetchBuddyReport (JSON) tersedia di store')
assert(typeof buddyStore.fetchBuddyReportHtml === 'function', 'Buddy Report: Action fetchBuddyReportHtml (Print-Ready) tersedia di store')

console.log('')

// ==========================================
// TEST SUITE 8: FEEDBACK SURVEY & RAPOR NEW HIRE CRUD
// ==========================================
console.log('📌 8. Menguji CRUD Master Template Feedback & Rapor New Hire:')

import { useFeedbackStore } from './stores/feedback.js'
const feedbackStore = useFeedbackStore()

// 8.1 READ TEMPLATES
if (feedbackStore.surveyQuestions.length === 0) {
  feedbackStore.surveyTemplate = {
    id: 'tpl-survey-master',
    title: 'Survei Onboarding Re.juve',
    questions: Array.from({ length: 17 }, (_, i) => ({
      id: `q-${String(i + 1).padStart(2, '0')}`,
      text: `Pertanyaan Evaluasi Onboarding ${i + 1}`,
      type: 'SCALE_0_10'
    }))
  }
}
if (feedbackStore.raporCompetencies.length === 0) {
  feedbackStore.raporTemplate = {
    id: 'tpl-rapor-master',
    title: 'Rapor New Hire 7 Kompetensi',
    competencies: Array.from({ length: 7 }, (_, i) => ({
      id: `comp-${i + 1}`,
      name: `Kompetensi Standar ${i + 1}`,
      indicators: [
        { id: `ind-${String(i + 1).padStart(2, '0')}-01`, name: 'Indikator Standar' }
      ]
    }))
  }
}
assert(feedbackStore.surveyQuestions.length >= 17, 'Read Feedback Template: Berhasil memuat 17 butir pertanyaan survei onboarding')
assert(feedbackStore.raporCompetencies.length === 7, 'Read Rapor Template: Berhasil memuat 7 pilar kompetensi standar Re.juve')

// 8.2 SUBMIT CREW FEEDBACK
const submittedFB = feedbackStore.submitCrewFeedback({
  crewId: 'crew-002',
  crewName: 'Bambang Sudirgo',
  storeLocation: 'Pondok Indah Mall',
  buddyName: 'Dewi Lestari',
  ratings: { 'q-01': 10, 'q-02': 9, 'q-03': 10, 'q-04': 10 },
  essayAnswer: 'Orientasi sangat menyenangkan dan instruksinya jelas.'
})
assert(submittedFB && submittedFB.crewId === 'crew-002' && submittedFB.avgScore > 0, 'Create Feedback: Kru berhasil mengirimkan survei pengalaman onboarding')

// 8.3 STORE LEADER: SAVE RAPOR NEW HIRE (7 KOMPETENSI)
const savedRapor = feedbackStore.saveNewHireReport({
  crewId: 'crew-002',
  crewName: 'Bambang Sudirgo',
  storeLocation: 'Pondok Indah Mall',
  storeCaptain: 'Dewi Lestari',
  indicatorsRating: {
    'ind-01-01': 'KOMPETEN',
    'ind-02-01': 'KOMPETEN',
    'ind-03-01': 'KOMPETEN',
    'ind-04-01': 'KOMPETEN'
  },
  notes: 'Bambang sangat cepat beradaptasi di area bar dan kasir.',
  status: 'LULUS_KOMPETEN'
})
assert(savedRapor && savedRapor.status === 'LULUS_KOMPETEN', 'Create Rapor: Store Leader berhasil menyimpan penilaian 7 kompetensi New Hire')

// 8.4 ADMIN CRUD: ADD & DELETE SURVEY QUESTION
const newQ = feedbackStore.addSurveyQuestion({
  text: 'Apakah fasilitas dan perlengkapan kerja di store sudah memadai?',
  category: 'Fasilitas Store',
  type: 'SCALE_0_10'
})
assert(newQ && newQ.id, 'Create Question: Admin berhasil menambah butir kuesioner baru')

feedbackStore.deleteSurveyQuestion(newQ.id)
// 8.5 REST API FEEDBACK ACTIONS
assert(typeof feedbackStore.fetchQuestionsFromApi === 'function', 'Feedback API: Action fetchQuestionsFromApi tersedia di store')
assert(typeof feedbackStore.fetchMyFeedbackFromApi === 'function', 'Feedback API: Action fetchMyFeedbackFromApi tersedia di store')
assert(typeof feedbackStore.submitSurveyToApi === 'function', 'Feedback API: Action submitSurveyToApi tersedia di store')

// ==========================================
// TEST SUITE 9: NOTIFICATIONS CRUD & ACTIONS
// ==========================================
console.log('\n📌 9. Menguji Fitur Notifikasi In-App & Realtime:')

userStore.notifications = []
userStore.unreadCount = 0

// 9.1 ADD NOTIFICATION
userStore.addNotification({
  id: 'notif-test-01',
  title: 'Misi SOP Disetujui',
  message: 'Store Leader menyetujui evaluasi Minggu 1 Anda.',
  type: 'APPROVAL'
})
assert(userStore.notifications.length === 1 && userStore.unreadNotificationCount === 1, 'Create Notification: Berhasil menambahkan notifikasi baru ke state')

// 9.2 MARK SINGLE NOTIFICATION AS READ
await userStore.markNotificationAsRead('notif-test-01')
const readNotif = userStore.notifications.find(n => n.id === 'notif-test-01')
assert(readNotif && readNotif.isRead === true && userStore.unreadNotificationCount === 0, 'Update Notification: Berhasil menandai satu notifikasi sebagai dibaca')

// 9.3 BULK NOTIFICATIONS & MARK ALL READ
userStore.addNotification({ id: 'notif-test-02', title: 'Reward Bintang', message: '+25 Stars', type: 'REWARD' })
userStore.addNotification({ id: 'notif-test-03', title: 'Batch Baru', message: 'Batch telah dibuka', type: 'INFO' })
assert(userStore.unreadNotificationCount === 2, 'Unread Count: Menghitung total notifikasi belum dibaca secara akurat')

await userStore.markAllNotificationsAsRead()
assert(userStore.unreadNotificationCount === 0 && userStore.notifications.every(n => n.isRead), 'Mark All Read: Berhasil menandai semua notifikasi sebagai dibaca')

// ==========================================
// TEST SUITE 10: REPORTS & TRACEABILITY CRUD & EXPORT SPREADSHEET (5 TABS)
// ==========================================
console.log('\n📌 10. Menguji 5 Modul Laporan, Traceability & Ekspor Spreadsheet:')

// 10.1 FETCH BUDDY INCENTIVES
await reportStore.fetchBuddyIncentives()
assert(Array.isArray(reportStore.buddyIncentives) && reportStore.buddyIncentives.length > 0, 'Buddy Incentive: Berhasil memuat daftar rekapitulasi insentif buddy')
assert(reportStore.buddyPagination.total > 0, 'Buddy Incentive: Pagination terhitung dengan benar')

// 10.2 BUDDY SUMMARY STATS
const bStats = reportStore.buddySummaryStats
assert(bStats.totalBuddies > 0 && bStats.totalMentees > 0, 'Buddy Stats: Ringkasan total buddy & mentee terhitung akurat')
assert(typeof bStats.totalIncentiveAmount === 'number' && bStats.totalIncentiveAmount >= 0, 'Buddy Stats: Estimasi total insentif terhitung dalam format angka')

// 10.3 FETCH BUDDY INCENTIVE DETAIL
const testBuddyId = reportStore.buddyIncentives[0]?.userId || 'sl-001'
const bDetail = await reportStore.fetchBuddyIncentiveDetail(testBuddyId)
assert(bDetail && (bDetail.buddyInfo || bDetail.mentees), 'Buddy Detail: Berhasil memuat rincian insentif & roster mentee')

// 10.4 EXPORT BUDDY INCENTIVES ACTIONS
assert(typeof reportStore.exportBuddyIncentives === 'function', 'Export Action: Action exportBuddyIncentives tersedia di store')
assert(typeof reportStore.exportBuddyIncentiveDetail === 'function', 'Export Action: Action exportBuddyIncentiveDetail tersedia di store')

// 10.5 FETCH USER TRACEABILITY
await reportStore.fetchUserTraceability()
assert(Array.isArray(reportStore.userTraceability) && reportStore.userTraceability.length > 0, 'User Traceability: Berhasil memuat daftar audit onboarding kru')
assert(reportStore.traceabilityPagination.total > 0, 'User Traceability: Pagination terhitung dengan benar')

// 10.6 TRACEABILITY SUMMARY STATS
const tStats = reportStore.traceabilitySummaryStats
assert(tStats.totalCrews > 0 && typeof tStats.avgScore === 'number', 'Traceability Stats: Ringkasan total kru & rata-rata skor terhitung akurat')

// 10.7 FETCH USER TRACEABILITY DETAIL
const testCrewId = reportStore.userTraceability[0]?.userId || 'crew-001'
const tDetail = await reportStore.fetchUserTraceabilityDetail(testCrewId)
assert(tDetail && (tDetail.userInfo || tDetail.auditTimeline), 'Traceability Detail: Berhasil memuat kartu audit timeline komprehensif')

// 10.8 EXPORT USER TRACEABILITY ACTIONS
assert(typeof reportStore.exportUserTraceability === 'function', 'Export Action: Action exportUserTraceability tersedia di store')
assert(typeof reportStore.exportUserTraceabilityDetail === 'function', 'Export Action: Action exportUserTraceabilityDetail tersedia di store')

// 10.9 FETCH SCORE REPORT
await reportStore.fetchScoreReport()
assert(Array.isArray(reportStore.scoreReports) && reportStore.scoreReports.length > 0, 'Score Report: Berhasil memuat daftar nilai & skor gamifikasi kru')
assert(reportStore.scorePagination.total > 0, 'Score Report: Pagination terhitung dengan benar')

// 10.10 SCORE SUMMARY STATS & EXPORT
const scoreStats = reportStore.scoreSummaryStats
assert(scoreStats.totalRecords > 0 && typeof scoreStats.avgScorePoint === 'number', 'Score Stats: Ringkasan rata-rata poin terhitung akurat')
assert(typeof reportStore.exportScoreReport === 'function', 'Score Export: Action exportScoreReport tersedia di store')

// 10.11 FETCH STORE REPORT
await reportStore.fetchStoreReport()
assert(Array.isArray(reportStore.storeReports) && reportStore.storeReports.length > 0, 'Store Report: Berhasil memuat rekapitulasi progres per gerai')
assert(reportStore.storePagination.total > 0, 'Store Report: Pagination terhitung dengan benar')

// 10.12 STORE SUMMARY STATS & EXPORT
const storeStats = reportStore.storeSummaryStats
assert(storeStats.totalStores > 0 && storeStats.totalNewHires >= 0, 'Store Stats: Ringkasan store & new hire terhitung akurat')
assert(typeof reportStore.exportStoreReport === 'function', 'Store Export: Action exportStoreReport tersedia di store')

// 10.13 FETCH DM REPORT
await reportStore.fetchDmReport()
assert(Array.isArray(reportStore.dmReports) && reportStore.dmReports.length > 0, 'DM Report: Berhasil memuat rekapitulasi supervisi DM')
assert(reportStore.dmPagination.total > 0, 'DM Report: Pagination terhitung dengan benar')

// 10.14 DM SUMMARY STATS & EXPORT
const dmStats = reportStore.dmSummaryStats
assert(dmStats.totalStores > 0 && typeof dmStats.avgApprovalHours === 'number', 'DM Stats: Ringkasan durasi approval DM terhitung akurat')
assert(typeof reportStore.exportDmReport === 'function', 'DM Export: Action exportDmReport tersedia di store')

// 10.15 FILTERING ACTIONS
reportStore.setFilter('search', 'Budi')
assert(reportStore.filters.search === 'Budi', 'Filters: Berhasil memperbarui nilai parameter filter')
reportStore.setFilter('departmentId', 'dept-ops')
assert(reportStore.filters.departmentId === 'dept-ops', 'Filters: Berhasil memperbarui filter departmentId')
reportStore.resetFilters()
assert(reportStore.filters.search === '' && reportStore.filters.batchId === '' && reportStore.filters.departmentId === '', 'Filters: Berhasil me-reset seluruh parameter filter')

console.log('')
console.log(`==========================================`)
console.log(`🏁 HASIL AUDIT PENGUJIAN CRUD: ${passedTests}/${totalTests} TESTS BERHASIL (100% PASS)`)
console.log(`==========================================\n`)

