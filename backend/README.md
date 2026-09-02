# Re.juve Gamification - Backend Service

Folder ini dialokasikan untuk service Backend (REST API) sistem Re.juve Gamification & Onboarding.

## Dokumen Spesifikasi API
Spesifikasi lengkap REST API JSON, skema data, endpoint, parameter, response model, dan alur business logic dapat dilihat pada:
- File spesifikasi: `docs/backend_api_specification.md` (atau di folder `docs/`)

## Modul Utama Backend:
1. **Authentication & Authorization (JWT & Role-based Access)**
   - Roles: `ADMIN`, `DM` (Duty Manager), `SL` (Store Leader), `CREW`
2. **Master Gerai / Stores**
   - CRUD Gerai, penugasan SL & DM per gerai
3. **Template Misi & Batch (Onboarding 3-5 Minggu)**
   - Manajemen template misi SOP, penugasan batch ke kru gerai
4. **Evaluasi Misi Harian (Store Leader)**
   - Input skor SOP, checklist, foto bukti, catatan SL
5. **Persetujuan / Approvals (Duty Manager)**
   - Verifikasi evaluasi SL, override skor DM, formula nilai: `(Skor SL + Skor DM) / 2`
   - Reward pencairan bintang ke kru
6. **Gamifikasi & Progress (Adventure Map & Leaderboard)**
   - Journey map status (Base Camp, River Crossing, Canopy, Summit)
   - Bintang, level, streak harian, badge pencapaian, leaderboard gerai
7. **Buddy Pre-Batch (3 Hari)**
   - Evaluasi checklist harian SOP + rekomendasi SL (`READY_FOR_BATCH` / `NEED_RETRAINING`)
8. **Feedback Onboarding & Rapor 7 Pilar Kompetensi**
   - Survei 17 butir pertanyaan kru baru & kalkulasi otomatis 7 pilar kompetensi Re.juve
