# 📦 Re.juve Gamification Platform - Backend Workspace

Workspace ini berisi seluruh dokumentasi, skema database, spesifikasi REST API, dan panduan teknis yang siap digunakan untuk implementasi backend oleh tim Backend Developer.

---

## 📚 Dokumen Spesifikasi Teknis:

1. **[Spesifikasi Lengkap REST API](API_SPECIFICATION.md)** (`API_SPECIFICATION.md`):
   - Daftar 11 Modul REST API lengkap (Endpoints, Request Body, Response JSON, Query Filter, Pagination).
   - Skema Header JWT & Role-Based Access Control (`SUPERADMIN`, `DISTRICT_MANAGER`, `STORE_LEADER`, `CREW`).
   - Formula Business Logic (Perhitungan Nilai Rata-Rata DM+SL, Star Reward Minting, Leveling, Rapor 7 Kompetensi).
   - Standar HTTP Status & Error Handling.

2. **[Arsitektur & Skema Database](DATABASE_SCHEMA.md)** (`DATABASE_SCHEMA.md`):
   - Diagram Relasi Entitas (ERD).
   - Skrip DDL SQL PostgreSQL 14+ / MySQL 8.0+ lengkap dengan Foreign Keys, Unique Indexes, Enums, dan Constraints.
   - Total 18 Tabel terintegrasi (Stores, Users, Batches, Weeks, Templates, Missions, Evaluations, Star Ledger, Buddy Rapor, Feedback).

3. **[Koleksi Postman v2.1.0](postman_collection.json)** (`postman_collection.json`):
   - File JSON yang dapat langsung di-*import* ke Postman / Insomnia untuk pengujian langsung seluruh endpoint API.

---

## 🛠️ Rekomendasi Tech Stack Backend:
- **Language/Framework**: Node.js (NestJS / Express / Fastify), Go (Fiber / Gin), atau Python (FastAPI).
- **Database**: PostgreSQL 14+
- **ORM / Query Builder**: Prisma, TypeORM, Drizzle, GORM, atau SQLAlchemy.
- **Authentication**: JWT (JSON Web Token) dengan bcrypt hashing.
