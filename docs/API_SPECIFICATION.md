# 📋 Re.juve Gamification Platform — Backend REST API Specification & Data Contract

Dokumen spesifikasi lengkap kontrak API (Application Programming Interface) untuk Backend Developer. Mencakup seluruh endpoint, header otentikasi, request body, query parameters, dan struktur response JSON standar untuk seluruh fitur aplikasi berdasarkan sudut pandang **Batch Operasional Re.juve**.

---

## 🌐 1. Konvensi Global & Standard Response Envelope

### Base URL:
```
Development : http://localhost:8000/api/v1
Staging     : https://staging-api.rejuve-gamification.com/api/v1
Production  : https://api.rejuve-gamification.com/api/v1
```

### Global Request Headers:
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Standard Response Envelope (JSON):
* **Success Response (2xx)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data berhasil diambil",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

* **Error Response (4xx / 5xx)**:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validasi gagal: Nama batch wajib diisi",
  "errors": [
    {
      "field": "name",
      "message": "Field 'name' tidak boleh kosong"
    }
  ]
}
```

---

## 🔐 2. Modul Autentikasi & Profil Pengguna (`/auth`)

### 2.1 Login User
* **Method & Endpoint**: `POST /auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "andi.pratama@rejuve.co.id",
  "password": "Password123!"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "crew-001",
      "name": "Andi Pratama",
      "email": "andi.pratama@rejuve.co.id",
      "role": "CREW",
      "roleTitle": "Store Specialist",
      "position": "Store Leader",
      "department": "Operasional Batch",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "batchId": "batch-alpha",
      "batchName": "Batch 1",
      "stars": 1850,
      "level": 7,
      "levelTitle": "Elite Inspector"
    }
  }
}
```

### 2.2 Get Current Authenticated User Profile
* **Method & Endpoint**: `GET /auth/me`
* **Access**: All Roles (Authenticated)
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "crew-001",
    "name": "Andi Pratama",
    "email": "andi.pratama@rejuve.co.id",
    "role": "CREW",
    "batchId": "batch-alpha",
    "batchName": "Batch 1",
    "stars": 1850,
    "level": 7,
    "completedMissions": 8,
    "averageScore": 93.5
  }
}
```

---

## 👥 3. Modul Administrator: Manajemen User (`/admin/users`)

### 3.1 List Users (Search & Filter)
* **Method & Endpoint**: `GET /admin/users`
* **Access**: `SUPERADMIN`
* **Query Parameters**:
  - `search`: string (opsional, cari nama/email)
  - `role`: string (opsional: `CREW`, `SUPERVISOR`, `HEAD`, `SUPERADMIN`)
  - `batchId`: string (opsional: `batch-alpha`, dll)
  - `page`: integer (default: 1)
  - `limit`: integer (default: 20)
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "crew-001",
      "name": "Andi Pratama",
      "email": "andi.pratama@rejuve.co.id",
      "role": "CREW",
      "position": "Store Leader",
      "batchId": "batch-alpha",
      "batchName": "Batch 1",
      "stars": 1850,
      "status": "ACTIVE",
      "createdAt": "2026-08-01T08:00:00Z"
    }
  ],
  "meta": { "total": 24, "page": 1, "limit": 20 }
}
```

### 3.2 Create User
* **Method & Endpoint**: `POST /admin/users`
* **Access**: `SUPERADMIN`
* **Request Body**:
```json
{
  "name": "Budi Santoso",
  "email": "budi.santoso@rejuve.co.id",
  "password": "TempPassword123!",
  "role": "CREW",
  "position": "Senior Barista",
  "department": "Operasional Batch",
  "batchId": "batch-alpha"
}
```

### 3.3 Update User & Reassign Batch
* **Method & Endpoint**: `PUT /admin/users/:id`
* **Access**: `SUPERADMIN`
* **Request Body**:
```json
{
  "name": "Budi Santoso Updated",
  "position": "Senior Barista",
  "batchId": "batch-beta"
}
```

### 3.4 Delete User
* **Method & Endpoint**: `DELETE /admin/users/:id`
* **Access**: `SUPERADMIN`

---

## 📦 4. Modul Administrator: Manajemen Batch (`/batches`)

### 4.1 List All Batches
* **Method & Endpoint**: `GET /batches`
* **Access**: Authenticated
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "batch-alpha",
      "name": "Batch 1",
      "code": "BTH-01",
      "status": "ACTIVE",
      "startDate": "2026-08-10",
      "endDate": "2026-08-31",
      "currentWeek": 2,
      "totalWeeks": 3,
      "totalCrew": 6,
      "totalMissions": 12,
      "completedMissions": 4,
      "totalStars": 11100,
      "averageScore": 92.4,
      "weeks": [
        {
          "weekNumber": 1,
          "title": "Cold Chain & Sanitasi",
          "status": "COMPLETED",
          "isLocked": false,
          "missionCount": 4,
          "completionRate": 100
        },
        {
          "weekNumber": 2,
          "title": "Rasa & Layanan Barista",
          "status": "ACTIVE",
          "isLocked": false,
          "missionCount": 4,
          "completionRate": 50
        },
        {
          "weekNumber": 3,
          "title": "Audit & Evaluasi Siklus",
          "status": "LOCKED",
          "isLocked": true,
          "missionCount": 4,
          "completionRate": 0
        }
      ]
    }
  ]
}
```

### 4.2 Create Batch (With 1-Click SOP Template Package)
* **Method & Endpoint**: `POST /batches`
* **Access**: `SUPERADMIN`
* **Request Body**:
```json
{
  "name": "Batch 4",
  "code": "BTH-04",
  "startDate": "2026-08-25",
  "endDate": "2026-09-15",
  "applyTemplatePackage": true,
  "templatePackageId": "pkg-rejuve-standard"
}
```

### 4.3 Update Batch
* **Method & Endpoint**: `PUT /batches/:id`
* **Access**: `SUPERADMIN`
* **Request Body**:
```json
{
  "name": "Batch 4 (Updated)",
  "currentWeek": 2,
  "status": "ACTIVE"
}
```

---

## 🎯 5. Modul Misi & Template SOP (`/missions` & `/templates`)

### 5.1 List Missions by Batch & Week
* **Method & Endpoint**: `GET /missions`
* **Access**: Authenticated
* **Query Parameters**:
  - `batchId`: string (Wajib jika role non-Crew)
  - `week`: integer (opsional: 1, 2, 3)
  - `status`: string (opsional: `COMPLETED`, `PENDING_REVIEW`, `REVISION_REQUIRED`, `IN_PROGRESS`, `LOCKED`)
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "msn-w2-001",
      "batchId": "batch-alpha",
      "week": 2,
      "code": "M-05",
      "title": "Cek Rasa & Kemanisan Alami Buah",
      "description": "Cicipi sampel jus dari setiap batch pembuatan untuk memastikan rasa manis alami buah tanpa gula.",
      "category": "Kualitas Buah",
      "requirements": [
        "Cicipi 3 sampel botol dari batch pembuatan hari ini",
        "Pastikan tingkat kemanisan murni dari buah segar",
        "Catat hasil pengecekan rasa pada logbook harian"
      ],
      "status": "PENDING_REVIEW",
      "deadline": "2026-08-28T23:59:59Z",
      "assignedCrewIds": ["crew-001", "crew-002", "crew-003", "crew-004", "crew-005", "crew-006"],
      "averageScore": 94.0,
      "calculatedStars": 5,
      "awardedStars": null,
      "crewEvaluations": [
        {
          "crewId": "crew-001",
          "score": 95,
          "calculatedStars": 5,
          "status": "PENDING_REVIEW"
        }
      ]
    }
  ]
}
```

### 5.2 Get Mission Detail by ID
* **Method & Endpoint**: `GET /missions/:id`
* **Access**: Authenticated
* **Response (200 OK)**: Mengembalikan rincian lengkap misi, checklist SOP, histori evaluasi, catatan revisi, dan foto bukti.

### 5.3 Create Custom Mission
* **Method & Endpoint**: `POST /missions`
* **Access**: `SUPERADMIN`, `SUPERVISOR`
* **Request Body**:
```json
{
  "batchId": "batch-alpha",
  "week": 2,
  "code": "M-13",
  "title": "Pengecekan Kebersihan Area Kasir",
  "description": "Memastikan meja POS, EDC, dan akrilik kasir bebas debu dan noda.",
  "category": "Area Kasir",
  "requirements": ["Lap permukaan meja kasir dengan cairan sanitasi"],
  "deadline": "2026-08-29"
}
```

### 5.4 Apply Master Template Package to Batch
* **Method & Endpoint**: `POST /templates/apply-to-batch`
* **Access**: `SUPERADMIN`
* **Request Body**:
```json
{
  "packageId": "pkg-rejuve-standard",
  "targetBatchId": "batch-beta"
}
```

---

## 📝 6. Modul Evaluasi & Observasi Supervisor (`/evaluations`)

### 6.1 Submit Multi-Crew Mission Evaluation
* **Method & Endpoint**: `POST /evaluations/submit`
* **Access**: `SUPERVISOR`, `SUPERADMIN`
* **Request Body**:
```json
{
  "missionId": "msn-w2-001",
  "batchId": "batch-alpha",
  "week": 2,
  "comment": "Pemeriksaan rasa jus segar dan proses pembuatan sudah sesuai standar. Disiplin kebersihan bar sangat baik.",
  "evidence": [
    {
      "url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600",
      "caption": "Foto pengecekan sampel rasa botol jus segar"
    }
  ],
  "crewScores": [
    { "crewId": "crew-001", "crewName": "Andi Pratama", "score": 95, "calculatedStars": 5 },
    { "crewId": "crew-002", "crewName": "Bella Saphira", "score": 93, "calculatedStars": 5 },
    { "crewId": "crew-003", "crewName": "Candra Wijaya", "score": 92, "calculatedStars": 5 },
    { "crewId": "crew-004", "crewName": "Dedi Kurniawan", "score": 96, "calculatedStars": 5 },
    { "crewId": "crew-005", "crewName": "Eka Putri", "score": 94, "calculatedStars": 5 },
    { "crewId": "crew-006", "crewName": "Fajar Nugraha", "score": 94, "calculatedStars": 5 }
  ]
}
```

---

## 🛡️ 7. Modul Persetujuan Head of Operations (`/approvals`)

### 7.1 List Pending Approvals
* **Method & Endpoint**: `GET /approvals/pending`
* **Access**: `HEAD`, `SUPERADMIN`

### 7.2 Approve Mission & Distribute Stars
* **Method & Endpoint**: `POST /approvals/:evaluationId/approve`
* **Access**: `HEAD`, `SUPERADMIN`
* **Request Body**:
```json
{
  "decisionNote": "Kualitas operasional dan rasa jus segar terverifikasi baik. Bintang disetujui."
}
```
* **Effect Backend**:
  1. Ubah status misi & evaluasi menjadi `COMPLETED` / `APPROVED`.
  2. Tambahkan ⭐ Bintang resmi (1–5 bintang) ke profil seluruh Crew yang dinilai.
  3. Buka pos misi berikutnya di World Map Journey.

### 7.3 Request Revision to Supervisor
* **Method & Endpoint**: `POST /approvals/:evaluationId/revise`
* **Access**: `HEAD`, `SUPERADMIN`
* **Request Body**:
```json
{
  "revisionNote": "Foto bukti pengecekan rasa kurang jelas. Mohon upload ulang foto dokumentasi."
}
```
* **Effect Backend**: Ubah status misi menjadi `REVISION_REQUIRED`.

---

## 🗺️ 8. Modul Gamifikasi, Leaderboard & World Map Journey (`/gamification`)

### 8.1 Get World Map Journey State (Khusus Crew)
* **Method & Endpoint**: `GET /gamification/journey-map`
* **Access**: `CREW` (Terisolasi per user)
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "currentWeek": 2,
    "activeNodeId": "msn-w2-002",
    "activeNodeIndex": 6,
    "totalMissions": 12,
    "completedMissions": 4,
    "progressPercent": 33,
    "chapters": [
      {
        "week": 1,
        "title": "Pulau Suhu & Sanitasi",
        "status": "COMPLETED",
        "starsEarned": 20,
        "isLocked": false
      },
      {
        "week": 2,
        "title": "Pulau Rasa & Layanan",
        "status": "ACTIVE",
        "starsEarned": 5,
        "isLocked": false
      },
      {
        "week": 3,
        "title": "Pulau Audit & Stok",
        "status": "LOCKED",
        "bountyStars": 500,
        "isLocked": true
      }
    ],
    "waypoints": [
      {
        "id": "msn-w1-001",
        "index": 1,
        "code": "M-01",
        "title": "Cek Suhu Chiller (2–4°C)",
        "week": 1,
        "status": "COMPLETED",
        "personalScore": 95,
        "starsAwarded": 5
      },
      {
        "id": "msn-w2-002",
        "index": 6,
        "code": "M-06",
        "title": "Kecepatan Layanan Barista (< 45 Detik)",
        "week": 2,
        "status": "IN_PROGRESS",
        "isCurrentAvatarPos": true,
        "personalScore": null,
        "starsAwarded": null
      }
    ]
  }
}
```

### 8.2 Get Batch Leaderboard
* **Method & Endpoint**: `GET /gamification/leaderboard`
* **Access**: Authenticated
* **Query Parameters**:
  - `batchId`: string (default: batch user)
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "rank": 1,
      "crewId": "crew-001",
      "name": "Andi Pratama",
      "position": "Store Leader",
      "batchName": "Batch 1",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      "level": 7,
      "completedMissions": 8,
      "averageScore": 93.5,
      "stars": 1850
    },
    {
      "rank": 2,
      "crewId": "crew-002",
      "name": "Bella Saphira",
      "position": "Senior Barista",
      "batchName": "Batch 1",
      "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      "level": 7,
      "completedMissions": 7,
      "averageScore": 92.0,
      "stars": 1780
    }
  ]
}
```

---

## 📦 9. Ringkasan HTTP Status Codes:
| Status Code | Arti | Keterangan |
| :--- | :--- | :--- |
| `200 OK` | Sukses | Permintaan berhasil diproses dan data dikembalikan |
| `201 Created` | Sukses Dibuat | Entitas baru (User / Batch / Misi) berhasil dibuat |
| `400 Bad Request` | Error Input | Validasi request gagal atau parameter tidak lengkap |
| `401 Unauthorized` | Belum Login | Token JWT tidak ada atau kadaluarsa |
| `403 Forbidden` | Tidak Ada Akses | Role tidak memiliki hak (misal Crew akses endpoint admin) |
| `404 Not Found` | Tidak Ditemukan | ID data yang diminta tidak ditemukan di database |
| `500 Server Error` | Gangguan Server | Kesalahan internal server |
