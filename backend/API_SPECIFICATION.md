# 🚀 Re.juve Enterprise Gamification & Onboarding Platform
## Comprehensive Backend REST API Specification

**Base URL**: `https://api.rejuve-gamification.internal/api/v1` (Production) / `http://localhost:8000/api/v1` (Local Development)  
**Protocol**: HTTPS / RESTful JSON API  
**Authentication**: Bearer JWT (`Authorization: Bearer <token>`)  
**Standard Response Format**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Deskripsi status operasi",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 📑 DAFTAR MODUL API

| No | Modul API | Base Path | Deskripsi |
|---|---|---|---|
| 1 | **Authentication & Session** | `/auth` | Login, current user profile, token refresh, logout |
| 2 | **Master User & Crew** | `/users` | CRUD User, filtering role, penugasan gerai |
| 3 | **Master Gerai (Stores)** | `/stores` | CRUD Gerai, alokasi Store Leader & District Manager |
| 4 | **Master Template SOP** | `/templates/packages` | CRUD Paket SOP kurikulum misi mingguan |
| 5 | **Batch Gerai & Siklus** | `/batches` | Pembuatan batch gerai, generate otomatis misi dari template |
| 6 | **Misi Operasional** | `/missions` | Katalog misi per batch, filter week, detail checklist |
| 7 | **Evaluasi Store Leader** | `/evaluations` | Input skor SOP per kru & per misi, submit bukti foto |
| 8 | **Approval District Manager** | `/approvals` | Verifikasi, override skor DM, hitung rata-rata, cairkan reward bintang |
| 9 | **Gamifikasi & Progress** | `/gamification` | Journey adventure map, star ledger, leaderboard gerai |
| 10 | **Rapor New Hire (Buddy 3 Hari)** | `/buddy` | 7 Kompetensi, 22 Indikator SOP, 3 skala penguasaan, rekomendasi batch |
| 11 | **Survei Feedback Onboarding** | `/feedback` | 17 Butir pertanyaan kru, rating 0-10 & esai, kalkulasi kepuasan |

---

## 🔐 1. AUTHENTICATION & SESSION (`/auth`)

### 1.1. Login Multi-Role
* **Method & URL**: `POST /api/v1/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "budi.santoso@rejuve.co.id",
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
    "expiresIn": 86400,
    "user": {
      "id": "sl-001",
      "name": "Budi Santoso",
      "email": "budi.santoso@rejuve.co.id",
      "role": "STORE_LEADER",
      "roleTitle": "Store Leader (SL)",
      "position": "Store Leader",
      "storeId": "store-001",
      "storeName": "Grand Indonesia",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      "level": 3,
      "totalStars": 380
    }
  }
}
```

### 1.2. Get Current Authenticated User (Me)
* **Method & URL**: `GET /api/v1/auth/me`
* **Access**: Authenticated (`Bearer <token>`)
* **Response (200 OK)**: Sama seperti objek user login di atas.

---

## 👥 2. MASTER USER & CREW DIRECTORY (`/users`)

### 2.1. List Users
* **Method & URL**: `GET /api/v1/users?role=CREW&storeId=store-001&search=Andi&page=1&limit=20`
* **Access**: SUPERADMIN, DISTRICT_MANAGER, STORE_LEADER
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "crew-001",
      "code": "CRW-01",
      "name": "Andi Pratama",
      "email": "andi.pratama@rejuve.co.id",
      "role": "CREW",
      "position": "Senior Barista",
      "storeId": "store-001",
      "storeName": "Grand Indonesia",
      "level": 3,
      "totalStars": 142,
      "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
      "isActive": true
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

### 2.2. Create User Baru
* **Method & URL**: `POST /api/v1/users`
* **Access**: SUPERADMIN
* **Request Body**:
```json
{
  "name": "Riko Firmansyah",
  "email": "riko.firmansyah@rejuve.co.id",
  "password": "InitialPassword123!",
  "role": "CREW",
  "position": "Junior Barista",
  "storeId": "store-001",
  "phone": "081299887766"
}
```

---

## 🏪 3. MASTER GERAI / STORES (`/stores`)

### 3.1. List Gerai
* **Method & URL**: `GET /api/v1/stores`
* **Access**: All Roles
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "store-001",
      "code": "STR-GI-01",
      "name": "Grand Indonesia",
      "city": "Jakarta Pusat",
      "address": "Grand Indonesia Mall East Mall Lt. LG, Jl. M.H. Thamrin No.1",
      "storeLeader": {
        "id": "sl-001",
        "name": "Budi Santoso",
        "email": "budi.santoso@rejuve.co.id"
      },
      "districtManager": {
        "id": "dm-001",
        "name": "Rina Wijaya",
        "email": "rina.wijaya@rejuve.co.id"
      },
      "activeCrewCount": 8,
      "activeBatchCode": "BATCH-01-GI"
    }
  ]
}
```

### 3.2. Create / Update Gerai
* **Method & URL**: `POST /api/v1/stores` / `PUT /api/v1/stores/:id`
* **Request Body**:
```json
{
  "code": "STR-CP-02",
  "name": "Central Park Mall",
  "city": "Jakarta Barat",
  "address": "Central Park Mall Lt. LG No. 112",
  "storeLeaderId": "sl-002",
  "districtManagerId": "dm-001"
}
```

---

## 📋 4. MASTER TEMPLATE SOP PAKET MISI (`/templates/packages`)

### 4.1. List Template Packages
* **Method & URL**: `GET /api/v1/templates/packages`
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "pkg-std-01",
      "code": "SOP-STD-03",
      "name": "Standar Operasional Flagship (3 Minggu)",
      "category": "Standar Operasional",
      "totalWeeks": 3,
      "totalMissions": 12,
      "description": "Kurikulum standar 3 minggu Re.juve mencakup Higienitas, Kalibrasi Rasa, dan Service Excellence."
    }
  ]
}
```

### 4.2. Tambah Butir Misi ke Paket Template
* **Method & URL**: `POST /api/v1/templates/packages/:packageId/missions`
* **Request Body**:
```json
{
  "weekNumber": 2,
  "stepNumber": 1,
  "code": "M-05",
  "category": "Kualitas Produk",
  "title": "Cek Rasa & Kemanisan Alami Buah",
  "description": "Memastikan standar rasa buah cold-pressed tanpa tambahan air dan gula.",
  "checklistItems": [
    "Ukur tingkat brix kemanisan dengan refractometer",
    "Pastikan suhu penyimpanan juice 2-4°C",
    "Catat di logbook kualitas harian"
  ]
}
```

---

## 🎯 5. BATCH GERAI & SIKLUS MINGGUAN (`/batches`)

### 5.1. Create Batch Gerai Baru (Otomatis Generate Misi)
* **Method & URL**: `POST /api/v1/batches`
* **Business Logic**:
  * Saat batch dibuat, backend **otomatis meng-copy seluruh template misi** dari `templatePackageId` ke tabel `missions` untuk batch tersebut.
  * Otomatis membuat tabel `batch_weeks` sebanyak `totalWeeks`.
* **Request Body**:
```json
{
  "name": "Batch 4 - Senayan City",
  "storeId": "store-002",
  "templatePackageId": "pkg-std-01",
  "buddyPackageId": "pkg-buddy-standard",
  "startDate": "2026-09-10",
  "totalWeeks": 3,
  "approvalConfig": {
    "minScoreFor5Stars": 90,
    "minEvidenceCount": 1,
    "requireEvidence": true
  }
}
```

---

## 📝 6. WORKSTATION EVALUASI STORE LEADER (`/evaluations`)

### 6.1. Simpan / Update Evaluasi Misi Kru
* **Method & URL**: `POST /api/v1/evaluations`
* **Access**: STORE_LEADER, SUPERADMIN
* **Request Body**:
```json
{
  "batchId": "batch-alpha",
  "missionId": "msn-w2-001",
  "crewId": "crew-001",
  "slScore": 95,
  "comment": "Pemeriksaan rasa jus cold-pressed sangat segar dan takaran brix kemanisan buah presisi sesuai SOP.",
  "evidenceUrls": [
    {
      "url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      "caption": "Foto refractometer brix 12.4"
    }
  ]
}
```
* **Status Transisi**: Status otomatis berubah menjadi `PENDING_REVIEW` dan masuk ke antrean DM.

---

## 🛡️ 7. APPROVAL & PENGESAHAN NILAI DISTRICT MANAGER (`/approvals`)

### 7.1. List Antrean Persetujuan DM
* **Method & URL**: `GET /api/v1/approvals?status=PENDING_REVIEW&storeId=store-001`
* **Access**: DISTRICT_MANAGER, SUPERADMIN

### 7.2. Setujui Misi & Penyesuaian Nilai DM
* **Method & URL**: `POST /api/v1/approvals/:id/approve`
* **Request Body**:
```json
{
  "dmScore": 90,
  "dmNote": "Hasil uji konsisten baik. Pertahankan kebersihan area potong buah."
}
```
* **Formula Backend**:
  $$\text{finalScore} = \text{round}\left(\frac{\text{slScore} + \text{dmScore}}{2}\right) = \text{round}\left(\frac{95 + 90}{2}\right) = 93$$
  $$\text{calculatedStars} = \begin{cases} 
  5 & \text{jika } \text{finalScore} \ge 90 \\ 
  4 & \text{jika } 80 \le \text{finalScore} < 90 \\
  3 & \text{jika } 70 \le \text{finalScore} < 80 \\
  2 & \text{jika } 60 \le \text{finalScore} < 70 \\
  1 & \text{jika } \text{finalScore} < 60
  \end{cases}$$
* **Pencairan Reward**:
  * Otomatis insert ke `star_ledger` (+5 ⭐).
  * Update total bintang dan level kru di tabel `users`.
  * Status evaluasi menjadi `APPROVED`.

### 7.3. Minta Revisi Misi (Reject / Request Revision)
* **Method & URL**: `POST /api/v1/approvals/:id/request-revision`
* **Request Body**:
```json
{
  "reason": "Foto bukti brix meter buram, mohon upload ulang foto kalibrasi yang jelas."
}
```

---

## 🗺️ 8. GAMIFIKASI & ADVENTURE MAP (`/gamification`)

### 8.1. Get Journey Map Progress Kru
* **Method & URL**: `GET /api/v1/gamification/journey/:crewId`
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "crew": {
      "id": "crew-001",
      "name": "Andi Pratama",
      "level": 3,
      "totalStars": 142,
      "rankTitle": "Senior Barista",
      "currentMissionId": "msn-b1-w2-003"
    },
    "nodes": [
      {
        "id": "node-1",
        "missionId": "msn-b1-w1-001",
        "week": 1,
        "step": 1,
        "title": "Sanitasi & Kebersihan Bar",
        "status": "COMPLETED",
        "starsEarned": 5,
        "score": 95,
        "position": { "x": 18, "y": 82 }
      },
      {
        "id": "node-2",
        "missionId": "msn-b1-w1-002",
        "week": 1,
        "step": 2,
        "title": "Grooming & Seragam Standar",
        "status": "COMPLETED",
        "starsEarned": 5,
        "score": 92,
        "position": { "x": 26, "y": 74 }
      }
    ]
  }
}
```

### 8.2. Leaderboard Klasemen Gerai
* **Method & URL**: `GET /api/v1/gamification/leaderboard?storeId=store-001&period=WEEK_ACTIVE`

---

## 🤝 9. RAPOR NEW HIRE RE.JUVE (3 HARI PRE-BATCH) (`/buddy`)

### 9.1. Get Master Template Rapor 7 Kompetensi
* **Method & URL**: `GET /api/v1/buddy/templates`
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "pkg-buddy-standard",
      "code": "BUDDY-STD-03",
      "name": "Rapor Pendampingan New Hire (3 Hari Pra-Batch)",
      "durationDays": 3,
      "competencies": [
        {
          "id": "comp-pk",
          "code": "PK",
          "name": "Product Knowledge",
          "indicators": [
            { "id": "ind-pk-01", "name": "Menjelaskan produk & ingredients*", "isStar": true },
            { "id": "ind-pk-02", "name": "Menjelaskan manfaat produk", "isStar": false },
            { "id": "ind-pk-03", "name": "Memberikan rekomendasi sesuai kebutuhan customer", "isStar": false }
          ]
        },
        {
          "id": "comp-cs",
          "code": "CS",
          "name": "Customer Service",
          "indicators": [
            { "id": "ind-cs-01", "name": "Menyapa customer sesuai standard", "isStar": false },
            { "id": "ind-cs-02", "name": "Menggali kebutuhan customer", "isStar": false },
            { "id": "ind-cs-03", "name": "Memberikan pelayanan sesuai Service Standard Re.juve", "isStar": false }
          ]
        },
        {
          "id": "comp-su",
          "code": "SU",
          "name": "Sales & Upselling",
          "indicators": [
            { "id": "ind-su-01", "name": "Melakukan upselling paket juice/qty juice", "isStar": false },
            { "id": "ind-su-02", "name": "Melakukan cross-selling produk food", "isStar": false },
            { "id": "ind-su-03", "name": "Menawarkan membership secara konsisten", "isStar": false }
          ]
        },
        {
          "id": "comp-co",
          "code": "CO",
          "name": "Cashier Operation",
          "indicators": [
            { "id": "ind-co-01", "name": "Melakukan transaksi di EDC dengan benar", "isStar": false },
            { "id": "ind-co-02", "name": "Melakukan repeat order & payment dengan benar", "isStar": false },
            { "id": "ind-co-03", "name": "Melakukan proses pembayaran di cashier tanpa kesalahan", "isStar": false }
          ]
        },
        {
          "id": "comp-so",
          "code": "SO",
          "name": "Store Operation",
          "indicators": [
            { "id": "ind-so-01", "name": "Memahami proses opening & closing sesuai SOP*", "isStar": true },
            { "id": "ind-so-02", "name": "Melakukan cleaning & refill produk sesuai standard", "isStar": false },
            { "id": "ind-so-03", "name": "Melakukan penerimaan kedatangan barang dengan baik*", "isStar": true },
            { "id": "ind-so-04", "name": "Menjaga area kerja sesuai standard", "isStar": false }
          ]
        },
        {
          "id": "comp-fsq",
          "code": "FSQ",
          "name": "Food Safety & Quality",
          "indicators": [
            { "id": "ind-fsq-01", "name": "Menjalankan standard hygiene", "isStar": false },
            { "id": "ind-fsq-02", "name": "Melakukan handling produk dengan benar", "isStar": false },
            { "id": "ind-fsq-03", "name": "Menjalankan FIFO/FEFO", "isStar": false }
          ]
        },
        {
          "id": "comp-ta",
          "code": "TA",
          "name": "Teamwork & Attitude",
          "indicators": [
            { "id": "ind-ta-01", "name": "Menunjukkan sikap positif & disiplin", "isStar": false },
            { "id": "ind-ta-02", "name": "Berkomunikasi dengan baik", "isStar": false },
            { "id": "ind-ta-03", "name": "Mengikuti arahan atasan", "isStar": false }
          ]
        }
      ]
    }
  ]
}
```

### 9.2. Simpan Evaluasi Rapor New Hire
* **Method & URL**: `POST /api/v1/buddy/evaluations`
* **Request Body**:
```json
{
  "batchId": "batch-alpha",
  "crewId": "crew-001",
  "storeTraining": "Re.juve Grand Indonesia",
  "storeCaptain": "Budi Santoso (Store Leader)",
  "trainingPeriod": "1 - 3 September 2026",
  "indicatorRatings": {
    "ind-pk-01": "KOMPETEN",
    "ind-pk-02": "KOMPETEN",
    "ind-pk-03": "KOMPETEN",
    "ind-cs-01": "KOMPETEN",
    "ind-cs-02": "KOMPETEN",
    "ind-cs-03": "KOMPETEN",
    "ind-su-01": "BUTUH_PENDAMPINGAN",
    "ind-su-02": "BUTUH_PENDAMPINGAN",
    "ind-su-03": "KOMPETEN",
    "ind-co-01": "KOMPETEN",
    "ind-co-02": "KOMPETEN",
    "ind-co-03": "KOMPETEN",
    "ind-so-01": "KOMPETEN",
    "ind-so-02": "KOMPETEN",
    "ind-so-03": "BUTUH_PENDAMPINGAN",
    "ind-so-04": "KOMPETEN",
    "ind-fsq-01": "KOMPETEN",
    "ind-fsq-02": "KOMPETEN",
    "ind-fsq-03": "KOMPETEN",
    "ind-ta-01": "KOMPETEN",
    "ind-ta-02": "KOMPETEN",
    "ind-ta-03": "KOMPETEN"
  },
  "recommendationNote": "Andi sangat cepat memahami standar produk dan hospitality Re.juve.",
  "status": "RECOMMENDED",
  "captainSigned": true,
  "crewSigned": true
}
```

---

## 📋 10. SURVEI FEEDBACK ONBOARDING 1 BULAN (`/feedback`)

### 10.1. List Butir Pertanyaan Survei (17 Butir)
* **Method & URL**: `GET /api/v1/feedback/questions`

### 10.2. Submit Feedback Pengalaman Onboarding Kru
* **Method & URL**: `POST /api/v1/feedback/surveys`
* **Request Body**:
```json
{
  "crewId": "crew-001",
  "batchId": "batch-alpha",
  "crewName": "Andi Pratama",
  "storeLocation": "Grand Indonesia",
  "buddyName": "Budi Santoso",
  "ratings": {
    "sq-01": 10,
    "sq-02": 9,
    "sq-03": 10,
    "sq-04": 10,
    "sq-05": 9,
    "sq-06": 10,
    "sq-07": 8,
    "sq-08": 9,
    "sq-09": 10,
    "sq-10": 10,
    "sq-11": 9,
    "sq-12": 10,
    "sq-13": 10,
    "sq-14": 9,
    "sq-15": 10,
    "sq-16": 9
  },
  "essayAnswer": "Program pendampingan sangat menyenangkan dan penjelasan Store Leader sangat sabar dan mendetail."
}
```

---

## 🚦 HTTP STATUS & ERROR CODES STANDARD

| Status Code | Code | Keterangan |
|---|---|---|
| `200 OK` | `SUCCESS` | Permintaan berhasil diproses |
| `201 Created` | `CREATED` | Resource baru berhasil dibuat |
| `400 Bad Request` | `VALIDATION_ERROR` | Payload tidak sesuai skema validasi |
| `401 Unauthorized` | `UNAUTHORIZED` | Token JWT tidak ada atau kadaluarsa |
| `403 Forbidden` | `FORBIDDEN_ROLE` | Akun tidak memiliki hak akses role ini |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | Data ID tidak ditemukan di database |
| `409 Conflict` | `DUPLICATE_ENTRY` | Kode atau email sudah terdaftar |
| `500 Internal Error` | `SERVER_ERROR` | Kesalahan internal pada server |
