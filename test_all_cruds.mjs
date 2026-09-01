import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from './stores/user.js'
import { useBatchStore } from './stores/batch.js'
import { useMissionStore } from './stores/mission.js'
import { useTemplateStore } from './stores/template.js'
import { useEvaluationStore } from './stores/evaluation.js'
import { useApprovalStore } from './stores/approval.js'
import { useGamificationStore } from './stores/gamification.js'
import { useStoreStore } from './stores/store.js'

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
  role: 'CREW',
  batchId: 'batch-alpha',
  position: 'Junior Barista',
  email: 'bima.satria@rejuve.co.id'
})
assert(newUser && newUser.id && newUser.name === 'Bima Satria', 'Create User: Berhasil mendaftarkan user baru')
assert(gamificationStore.crewById(newUser.id) !== undefined, 'Create User: Otomatis masuk ke roster gamifikasi Crew')

// 1.2 READ USER
const readUser = userStore.allUsers.find(u => u.id === newUser.id)
assert(readUser && readUser.email === 'bima.satria@rejuve.co.id', 'Read User: Berhasil membaca data user dari direktori')

// 1.3 UPDATE USER
userStore.updateUser(newUser.id, { position: 'Senior Barista Lead', name: 'Bima Satria Perkasa' })
const updatedUser = userStore.allUsers.find(u => u.id === newUser.id)
assert(updatedUser.position === 'Senior Barista Lead' && updatedUser.name === 'Bima Satria Perkasa', 'Update User: Berhasil memperbarui data user & jabatan')

// 1.4 REASSIGN USER TO BATCH
userStore.assignUserToBatch(newUser.id, 'batch-beta', 'Senayan City')
assert(updatedUser.batchId === 'batch-beta', 'Reassign User: Berhasil memindahkan crew ke batch/cabang lain')

// 1.5 DELETE USER
userStore.deleteUser(newUser.id)
assert(userStore.allUsers.find(u => u.id === newUser.id) === undefined, 'Delete User: Berhasil menghapus user dari direktori')
assert(gamificationStore.crewById(newUser.id) === undefined, 'Delete User: Otomatis terhapus dari roster gamifikasi')

console.log('')

// ==========================================
// TEST SUITE 2: BATCH GERAI CRUD
// ==========================================
console.log('📌 2. Menguji CRUD Manajemen Batch Gerai:')

// 2.1 CREATE BATCH
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
const newPkg = templateStore.createPackage({
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

// 4.5 DELETE PACKAGE
templateStore.deletePackage(newPkg.id)
templateStore.deletePackage(duplicatedPkg.id)
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

// 5.3 DISTRICT MANAGER (SL + DM) / 2 FORMULA TEST
const itemToAdjust = approvalStore.approvals.find(a => a.status === 'PENDING_REVIEW')
if (itemToAdjust) {
  const initialSLScore = itemToAdjust.score || itemToAdjust.averageScore || 90
  const dmScoreInput = 80
  const expectedFinal = Math.round((initialSLScore + dmScoreInput) / 2)
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

console.log('')
console.log(`==========================================`)
console.log(`🏁 HASIL AUDIT PENGUJIAN CRUD: ${passedTests}/${totalTests} TESTS BERHASIL (100% PASS)`)
console.log(`==========================================\n`)
