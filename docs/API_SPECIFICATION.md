# 📋 Re.juve Gamification Platform — Backend REST API Specification & Data Contract

Dokumen spesifikasi lengkap kontrak API (Application Programming Interface) untuk Backend Developer. Mencakup seluruh endpoint, header otentikasi, request body, query parameters, dan struktur response JSON standar untuk seluruh fitur aplikasi.

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
  "message": "Validasi gagal: Nama gerai wajib diisi",
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
      "position": "Senior Barista",
      "department": "Store Operations",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "batchId": "batch-alpha",
      "storeLocation": "Re.juve Grand Indonesia",
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
      "position": "Senior Barista",
      "batchId": "batch-alpha",
      "batchName": "Batch Alpha — Grand Indonesia",
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
  "position": "Store Specialist Barista",
  "department": "Store Operations",
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
  "position": "Senior Barista Specialist",
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
      "name": "Batch Alpha — Grand Indonesia",
      "code": "B-ALPHA",
      "location": "Grand Indonesia Mall, Jakarta Pusat",
      "status": "ACTIVE",
      "startDate": "2026-08-10",
      "endDate": "2026-08-31",
      "currentWeek": 2,
      "totalWeeks": 3,
      "totalCrew": 6,
      "totalMissions": 12,
      "completedMissions": 4,
      "totalStars": 11100,
      "averageScore": 92.4
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
  "name": "Batch Delta — Kota Kasablanka",
  "code": "B-DELTA",
  "location": "Mall Kota Kasablanka, Jakarta Selatan",
  "startDate": "2026-08-25",
  "endDate": "2026-09-15",
  "applyTemplatePackage": true,
  "packageId": "pkg-rejuve-master-12"
}
```

### 4.3 Update Batch
* **Method & Endpoint**: `PUT /batches/:id`
* **Access**: `SUPERADMIN`
* **Request Body**:
```json
{
  "name": "Batch Delta — Kota Kasablanka (Updated)",
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
      "id": "m-05",
      "batchId": "batch-alpha",
      "week": 2,
      "code": "QC-01",
      "title": "Audit Rasio Ekstraksi Jus Murni & Brix Monitor",
      "description": "Verifikasi rendemen ekstraksi cold-pressed 100% buah murni tanpa tambahan air dan gula.",
      "category": "Quality Control",
      "requirements": [
        "Uji brix meter pada 3 batch sampel jus harian",
        "Pencatatan yield rasio bahan baku ke dalam log digital",
        "Pemeriksaan segel #CleanLabel botol kemasan"
      ],
      "status": "PENDING_REVIEW",
      "deadline": "2026-08-28T23:59:59Z",
      "assignedCrewIds": ["crew-001", "crew-002", "crew-003", "crew-004", "crew-005", "crew-006"],
      "averageScore": 94.5,
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
  "code": "QC-03",
  "title": "Kalibrasi Termometer Digital Chiller",
  "description": "Pemeriksaan kalibrasi sensor suhu digital chiller 2-4°C.",
  "category": "Cold Chain",
  "requirements": ["Uji dengan termometer pembanding standar"],
  "deadline": "2026-08-29"
}
```

### 5.4 Apply Master Template Package to Batch
* **Method & Endpoint**: `POST /templates/apply-to-batch`
* **Access**: `SUPERADMIN`
* **Request Body**:
```json
{
  "packageId": "pkg-rejuve-master-12",
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
  "missionId": "m-05",
  "batchId": "batch-alpha",
  "week": 2,
  "comment": "SOP ekstraksi buah dingin terlaksana sangat baik, suhu chiller stabil di 2.8°C.",
  "evidence": [
    {
      "url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
      "caption": "Bukti kalibrasi brix meter dan suhu display chiller"
    }
  ],
  "crewScores": [
    { "crewId": "crew-001", "score": 95, "notes": "Disiplin SOP sangat tinggi" },
    { "crewId": "crew-002", "score": 90, "notes": "Baik" },
    { "crewId": "crew-003", "score": 92, "notes": "Baik" },
    { "crewId": "crew-004", "score": 96, "notes": "Sangat teliti" },
    { "crewId": "crew-005", "score": 94, "notes": "Bagus" },
    { "crewId": "crew-006", "score": 95, "notes": "Optimal" }
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
  "decisionNote": "Kualitas cold-chain terverifikasi memenuhi standar HACCP Re.juve. Bintang disetujui."
}
```
* **Effect Backend**:
  1. Ubah status misi & evaluasi menjadi `COMPLETED` / `APPROVED`.
  2. Tambahkan ⭐ Bintang (misal 5 bintang) ke profil seluruh Crew yang dinilai.
  3. Buka pos misi berikutnya di Journey Map.

### 7.3 Request Revision to Supervisor
* **Method & Endpoint**: `POST /approvals/:evaluationId/revise`
* **Access**: `HEAD`, `SUPERADMIN`
* **Request Body**:
```json
{
  "revisionNote": "Foto bukti kalibrasi brix buah apel kurang tajam. Mohon re-audit dan upload ulang."
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
    "activeNodeId": "m-06",
    "activeNodeIndex": 6,
    "totalMissions": 12,
    "completedMissions": 5,
    "progressPercent": 42,
    "chapters": [
      {
        "week": 1,
        "title": "Cold Chain Lagoon",
        "status": "COMPLETED",
        "starsEarned": 5,
        "isLocked": false
      },
      {
        "week": 2,
        "title": "Pure Extraction Ridge",
        "status": "ACTIVE",
        "starsEarned": 5,
        "isLocked": false
      },
      {
        "week": 3,
        "title": "HACCP Summit Fortress",
        "status": "LOCKED",
        "bountyStars": 500,
        "isLocked": true
      }
    ],
    "waypoints": [
      {
        "id": "m-01",
        "index": 1,
        "code": "CC-01",
        "title": "Verifikasi Suhu Cold Chain Chiller 2-4°C",
        "week": 1,
        "status": "COMPLETED",
        "personalScore": 96,
        "starsAwarded": 5
      },
      {
        "id": "m-06",
        "index": 6,
        "code": "SV-01",
        "title": "Speed of Service Barista < 45 Detik",
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

### 8.2 Get Store Branch Leaderboard
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
      "position": "Senior Barista",
      "storeLocation": "Re.juve Grand Indonesia",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      "level": 7,
      "completedMissions": 8,
      "averageScore": 93.5,
      "stars": 1850
    },
    {
      "rank": 2,
      "crewId": "crew-002",
      "name": "Bambang Wijaya",
      "position": "Cold-Pressed Specialist",
      "storeLocation": "Re.juve Grand Indonesia",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      "level": 6,
      "completedMissions": 7,
      "averageScore": 91.0,
      "stars": 1720
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
