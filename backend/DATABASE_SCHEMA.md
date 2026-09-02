# 🗄️ Database Architecture & DDL Schema Specification
### Re.juve Enterprise Gamification & Onboarding Platform
**Database Engine**: PostgreSQL 14+ / MySQL 8.0+  
**Naming Convention**: `snake_case` untuk tabel dan kolom  
**Standard Timestamp**: UTC ISO-8601 (`created_at`, `updated_at`)

---

## 1. Entity Relationship Overview (ERD Summary)

```
[stores] ──< [users] (store_id)
[stores] ──< [batches] (store_id)
[users] (SL/DM) ──< [stores] (store_leader_id, district_manager_id)

[template_packages] ──< [template_missions] (package_id)
[template_packages] ──< [batches] (template_package_id)

[buddy_packages] ──< [buddy_competencies] (package_id)
[buddy_competencies] ──< [buddy_indicators] (competency_id)
[buddy_packages] ──< [batches] (buddy_package_id)

[batches] ──< [batch_weeks] (batch_id)
[batches] ──< [missions] (batch_id)
[batch_weeks] ──< [missions] (week_id)
[template_missions] ──< [missions] (template_mission_id)

[missions] ──< [evaluations] (mission_id)
[users] (crew) ──< [evaluations] (crew_id)
[evaluations] ──< [evaluation_evidences] (evaluation_id)
[evaluations] ──< [star_ledger] (evaluation_id)

[users] (crew) ──< [buddy_evaluations] (crew_id)
[batches] ──< [buddy_evaluations] (batch_id)
[buddy_evaluations] ──< [buddy_evaluation_ratings] (evaluation_id)
[buddy_indicators] ──< [buddy_evaluation_ratings] (indicator_id)

[survey_questions] ──< [crew_feedback_answers] (question_id)
[users] (crew) ──< [crew_feedbacks] (crew_id)
[crew_feedbacks] ──< [crew_feedback_answers] (feedback_id)
```

---

## 2. Table Definitions & DDL Scripts

```sql
-- ========================================================
-- 1. ENUMS & EXTENSIONS
-- ========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role_enum AS ENUM ('SUPERADMIN', 'DISTRICT_MANAGER', 'STORE_LEADER', 'CREW');
CREATE TYPE batch_status_enum AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE week_status_enum AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');
CREATE TYPE mission_eval_status_enum AS ENUM ('PENDING_EVALUATION', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED');
CREATE TYPE rating_level_enum AS ENUM ('BELUM_MENGUASAI', 'BUTUH_PENDAMPINGAN', 'KOMPETEN');
CREATE TYPE buddy_recommendation_status_enum AS ENUM ('IN_PROGRESS', 'RECOMMENDED', 'NEED_RETRAINING');
CREATE TYPE survey_question_type_enum AS ENUM ('SCALE_0_10', 'ESSAY');

-- ========================================================
-- 2. MASTER STORES (Gerai Re.juve)
-- ========================================================
CREATE TABLE stores (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    store_leader_id VARCHAR(50),
    district_manager_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_sl ON stores(store_leader_id);
CREATE INDEX idx_stores_dm ON stores(district_manager_id);

-- ========================================================
-- 3. USERS & CREW PROFILES
-- ========================================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'CREW',
    position VARCHAR(100) NOT NULL,
    store_id VARCHAR(50) REFERENCES stores(id) ON DELETE SET NULL,
    avatar_url TEXT,
    phone VARCHAR(30),
    level INT DEFAULT 1,
    total_stars INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_store ON users(store_id);

-- Add Foreign Key to stores table for SL & DM
ALTER TABLE stores 
    ADD CONSTRAINT fk_stores_sl FOREIGN KEY (store_leader_id) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_stores_dm FOREIGN KEY (district_manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- ========================================================
-- 4. MASTER TEMPLATE SOP (Reguler Onboarding)
-- ========================================================
CREATE TABLE template_packages (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT 'Standar Operasional',
    target_type VARCHAR(100) DEFAULT 'Gerai Flagship',
    total_weeks INT NOT NULL DEFAULT 3,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE template_missions (
    id VARCHAR(50) PRIMARY KEY,
    package_id VARCHAR(50) NOT NULL REFERENCES template_packages(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    step_number INT NOT NULL,
    code VARCHAR(30),
    category VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tmpl_missions_pkg_week ON template_missions(package_id, week_number);

-- ========================================================
-- 5. MASTER TEMPLATE BUDDY (Rapor New Hire 3 Hari Pre-Batch)
-- ========================================================
CREATE TABLE buddy_packages (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    duration_days INT NOT NULL DEFAULT 3,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buddy_competencies (
    id VARCHAR(50) PRIMARY KEY,
    package_id VARCHAR(50) NOT NULL REFERENCES buddy_packages(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0
);

CREATE TABLE buddy_indicators (
    id VARCHAR(50) PRIMARY KEY,
    competency_id VARCHAR(50) NOT NULL REFERENCES buddy_competencies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    is_star BOOLEAN DEFAULT FALSE, -- Bintang * (Wajib Pembekalan)
    note TEXT,
    description TEXT,
    sort_order INT DEFAULT 0
);

CREATE INDEX idx_buddy_ind_comp ON buddy_indicators(competency_id);

-- ========================================================
-- 6. BATCH GERAI & SIKLUS MINGGUAN
-- ========================================================
CREATE TABLE batches (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    store_id VARCHAR(50) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    template_package_id VARCHAR(50) REFERENCES template_packages(id) ON DELETE SET NULL,
    buddy_package_id VARCHAR(50) REFERENCES buddy_packages(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    total_weeks INT NOT NULL DEFAULT 3,
    current_week INT NOT NULL DEFAULT 1,
    status batch_status_enum NOT NULL DEFAULT 'ACTIVE',
    min_score_for_5_stars INT DEFAULT 90,
    min_evidence_count INT DEFAULT 1,
    require_evidence BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batch_weeks (
    id VARCHAR(50) PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    theme VARCHAR(150),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status week_status_enum NOT NULL DEFAULT 'UPCOMING',
    completion_rate NUMERIC(5,2) DEFAULT 0.00
);

CREATE UNIQUE INDEX uq_batch_week ON batch_weeks(batch_id, week_number);

-- ========================================================
-- 7. MISI AKTIF BATCH
-- ========================================================
CREATE TABLE missions (
    id VARCHAR(50) PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    week_id VARCHAR(50) NOT NULL REFERENCES batch_weeks(id) ON DELETE CASCADE,
    template_mission_id VARCHAR(50) REFERENCES template_missions(id) ON DELETE SET NULL,
    code VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    week_number INT NOT NULL,
    step INT NOT NULL,
    description TEXT,
    checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_missions_batch_week ON missions(batch_id, week_number);

-- ========================================================
-- 8. EVALUASI MISI (Store Leader -> DM Approval)
-- ========================================================
CREATE TABLE evaluations (
    id VARCHAR(50) PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    mission_id VARCHAR(50) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    crew_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluator_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sl_score INT,
    dm_score INT,
    final_score INT,
    calculated_stars INT DEFAULT 0,
    status mission_eval_status_enum NOT NULL DEFAULT 'PENDING_EVALUATION',
    comment TEXT,
    dm_note TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_eval_mission_crew ON evaluations(batch_id, mission_id, crew_id);
CREATE INDEX idx_eval_status ON evaluations(status);

CREATE TABLE evaluation_evidences (
    id VARCHAR(50) PRIMARY KEY,
    evaluation_id VARCHAR(50) NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 9. STAR REWARD LEDGER (Gamifikasi Pencairan Bintang)
-- ========================================================
CREATE TABLE star_ledger (
    id VARCHAR(50) PRIMARY KEY,
    crew_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id VARCHAR(50) REFERENCES batches(id) ON DELETE SET NULL,
    mission_id VARCHAR(50) REFERENCES missions(id) ON DELETE SET NULL,
    evaluation_id VARCHAR(50) REFERENCES evaluations(id) ON DELETE SET NULL,
    stars_amount INT NOT NULL,
    source_type VARCHAR(50) NOT NULL DEFAULT 'MISSION_APPROVED',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_star_ledger_crew ON star_ledger(crew_id);

-- ========================================================
-- 10. RAPOR NEW HIRE (7 Kompetensi Buddy Pre-Batch)
-- ========================================================
CREATE TABLE buddy_evaluations (
    id VARCHAR(50) PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    crew_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_training VARCHAR(150),
    store_captain VARCHAR(150),
    evaluator_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    training_period VARCHAR(100) DEFAULT '1 - 3 September 2026',
    status buddy_recommendation_status_enum NOT NULL DEFAULT 'IN_PROGRESS',
    recommendation_note TEXT,
    captain_signed BOOLEAN DEFAULT FALSE,
    crew_signed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_buddy_eval_crew ON buddy_evaluations(batch_id, crew_id);

CREATE TABLE buddy_evaluation_ratings (
    id VARCHAR(50) PRIMARY KEY,
    evaluation_id VARCHAR(50) NOT NULL REFERENCES buddy_evaluations(id) ON DELETE CASCADE,
    indicator_id VARCHAR(50) NOT NULL REFERENCES buddy_indicators(id) ON DELETE CASCADE,
    rating rating_level_enum NOT NULL DEFAULT 'BUTUH_PENDAMPINGAN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_buddy_rating_ind ON buddy_evaluation_ratings(evaluation_id, indicator_id);

-- ========================================================
-- 11. SURVEI FEEDBACK ONBOARDING (Kuesioner Kru 1 Bulan)
-- ========================================================
CREATE TABLE survey_questions (
    id VARCHAR(50) PRIMARY KEY,
    number INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    type survey_question_type_enum NOT NULL DEFAULT 'SCALE_0_10',
    text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

CREATE TABLE crew_feedbacks (
    id VARCHAR(50) PRIMARY KEY,
    crew_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id VARCHAR(50) REFERENCES batches(id) ON DELETE SET NULL,
    crew_name VARCHAR(150) NOT NULL,
    store_location VARCHAR(150) NOT NULL,
    buddy_name VARCHAR(150) NOT NULL,
    avg_score NUMERIC(4,2) DEFAULT 0.00,
    essay_answer TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crew_feedback_answers (
    id VARCHAR(50) PRIMARY KEY,
    feedback_id VARCHAR(50) NOT NULL REFERENCES crew_feedbacks(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    rating_value INT NOT NULL
);

CREATE UNIQUE INDEX uq_feedback_ans ON crew_feedback_answers(feedback_id, question_id);
```
