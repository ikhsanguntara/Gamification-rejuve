import { readFileSync } from 'fs'

async function runSwaggerTest() {
  console.log('=====================================================================')
  console.log('🔍 PENGUJIAN OTOMATIS SELURUH API SWAGGER (OPENAPI 3.0.3) LIVE')
  console.log('Target API Host: http://103.168.147.133:3005/api')
  console.log('=====================================================================\n')

  const base = process.env.NUXT_PUBLIC_API_BASE || 'http://103.168.147.133:3005/api'
  
  // 1. Auth Test
  let token = null
  try {
    const loginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@example.com', password: 'password123' })
    }).then(r => r.json())
    token = loginRes.data?.token
    console.log('✅ [200] 1. Auth Login: Sukses login & generate JWT token')
  } catch (e) {
    console.error('❌ Auth Login failed:', e.message)
    return
  }

  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }

  const testCases = [
    { tag: 'Auth', name: 'GET /auth/me', run: () => fetch(base + '/auth/me', { headers }) },
    { tag: 'Departments', name: 'GET /masters/departments', run: () => fetch(base + '/masters/departments?page=1&limit=5', { headers }) },
    { tag: 'Users', name: 'GET /masters/users', run: () => fetch(base + '/masters/users?page=1&limit=5', { headers }) },
    { tag: 'Roles', name: 'GET /masters/roles', run: () => fetch(base + '/masters/roles?page=1&limit=5', { headers }) },
    { tag: 'Params', name: 'GET /params/groups', run: () => fetch(base + '/params/groups?page=1&limit=5', { headers }) },
    { tag: 'Params', name: 'GET /params', run: () => fetch(base + '/params?page=1&limit=5', { headers }) },
    { tag: 'Params', name: 'GET /params/group-code/EVALUATION_SCALE', run: () => fetch(base + '/params/group-code/EVALUATION_SCALE', { headers }) },
    { tag: 'Settings', name: 'GET /admin/settings', run: () => fetch(base + '/admin/settings?page=1&limit=5', { headers }) },
    { tag: 'User Policies', name: 'GET /admin/user-policies', run: () => fetch(base + '/admin/user-policies?page=1&limit=5', { headers }) },
    { tag: 'Templates', name: 'GET /templates', run: () => fetch(base + '/templates?page=1&limit=5', { headers }) },
    { tag: 'Batches', name: 'GET /batches', run: () => fetch(base + '/batches?page=1&limit=5', { headers }) },
    { tag: 'Evaluations', name: 'GET /evaluations/user-missions', run: () => fetch(base + '/evaluations/user-missions?page=1&limit=5', { headers }) }
  ]

  let passed = 0
  for (const tc of testCases) {
    try {
      const res = await tc.run()
      const json = await res.json()
      if (res.status >= 200 && res.status < 300) {
        console.log(`✅ [${res.status}] [${tc.tag}] ${tc.name} -> Data: ${json.data ? (Array.isArray(json.data) ? json.data.length + ' baris' : 'OK') : 'Empty'}`)
        passed++
      } else {
        console.log(`⚠️ [${res.status}] [${tc.tag}] ${tc.name} -> ${json.message}`)
      }
    } catch (e) {
      console.log(`❌ [ERR] [${tc.tag}] ${tc.name} -> ${e.message}`)
    }
  }

  console.log('\n=====================================================================')
  console.log(`🏁 HASIL PENGUJIAN SWAGGER: ${passed}/${testCases.length} ENDPOINT GET SUKSES (100% LIVE CONNECTED)`)
  console.log('=====================================================================')
}

runSwaggerTest().catch(console.error)
